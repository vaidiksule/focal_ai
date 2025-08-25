from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import json
from .services.multi_agent import MultiAgentSystem
from .services.mongodb_service import MongoDBService
from .auth_middleware import require_auth, get_user_from_request
from .user_views import get_user_profile, deduct_credits, get_user_transactions
from datetime import datetime


def _parse_prd_sections(prd_text):
    """Parse PRD content into structured sections"""
    sections = {
        'overview': '',
        'problem_statement': '',
        'debate_summary': '',
        'objectives': '',
        'scope': '',
        'requirements': '',
        'user_stories': '',
        'trade_offs_decisions': '',
        'next_steps': '',
        'success_metrics': ''
    }
    
    lines = prd_text.split('\n')
    current_section = None
    
    for line in lines:
        line = line.strip()
        
        # Check for section headers
        if '1. OVERVIEW' in line.upper():
            current_section = 'overview'
        elif '2. PROBLEM STATEMENT' in line.upper():
            current_section = 'problem_statement'
        elif '3. DEBATE SUMMARY' in line.upper():
            current_section = 'debate_summary'
        elif '4. OBJECTIVES' in line.upper():
            current_section = 'objectives'
        elif '5. SCOPE' in line.upper():
            current_section = 'scope'
        elif '6. REQUIREMENTS' in line.upper():
            current_section = 'requirements'
        elif '7. USER STORIES' in line.upper():
            current_section = 'user_stories'
        elif '8. TRADE-OFFS' in line.upper() or '8. TRADE OFFS' in line.upper():
            current_section = 'trade_offs_decisions'
        elif '9. NEXT STEPS' in line.upper():
            current_section = 'next_steps'
        elif '10. SUCCESS METRICS' in line.upper():
            current_section = 'success_metrics'
        elif current_section and line:
            sections[current_section] += line + '\n'
    
    return sections


@csrf_exempt
@require_http_methods(["GET"])
def test_connection(request):
    """Test endpoint to verify frontend-backend communication"""
    return JsonResponse({
        'success': True,
        'message': 'Backend is running and accessible',
        'timestamp': timezone.now().isoformat()
    })


@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def test_auth(request):
    """Test endpoint to verify authentication is working"""
    user = get_user_from_request(request)
    return JsonResponse({
        'success': True,
        'message': 'Authentication is working',
        'user': user,
        'timestamp': timezone.now().isoformat()
    })


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def refine_requirements(request):
    """API endpoint to refine requirements using multi-agent debate"""
    try:
        data = json.loads(request.body)
        idea_text = data.get('idea', '').strip()
        
        if not idea_text:
            return JsonResponse({
                'success': False,
                'error': 'Idea text is required'
            }, status=400)
        
        # Get authenticated user
        user = get_user_from_request(request)
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'User authentication required'
            }, status=401)
        
        # Check if user has sufficient credits
        mongodb_service = MongoDBService()
        current_credits = mongodb_service.get_user_credits(user['_id'])
        
        if current_credits < 2:
            mongodb_service.close()
            return JsonResponse({
                'success': False,
                'error': f'Insufficient credits. Required: 2, Available: {current_credits}'
            }, status=402)
        
        # Deduct credits first
        success, message = mongodb_service.deduct_credits(user['_id'], 2, 'Requirement generation')
        if not success:
            mongodb_service.close()
            return JsonResponse({
                'success': False,
                'error': message
            }, status=402)
        
        # Initialize services
        agent_system = MultiAgentSystem()
        
        # Save idea to MongoDB with user_id
        idea_data = {
            'title': idea_text[:200],  # Truncate if too long
            'description': idea_text,
            'user_id': user['_id']
        }
        idea_id = mongodb_service.save_idea(idea_data)
        
        # Run requirement refinement
        result = agent_system.refine_requirements(idea_text)
        
        print(f"🔍 Refinement result: {result}")
        
        if result['success']:
            # Save debate log to MongoDB
            mongodb_service.save_debates(idea_id, result['debate_log'])
            
            # Parse PRD content to extract sections
            prd_text = result['prd_content']
            
            # Parse the PRD sections
            sections = _parse_prd_sections(prd_text)
            
            # Save PRD to MongoDB
            requirements_data = {
                'prd_content': prd_text,
                'sections': sections
            }
            mongodb_service.save_requirements(idea_id, requirements_data)
            
            # Get updated user data
            updated_user = mongodb_service.get_user_by_id(user['_id'])
            mongodb_service.close()
            
            # Prepare response with fallback information
            response_data = {
                'success': True,
                'idea_id': idea_id,
                'prd_content': result['prd_content'],
                'sections': sections,
                'debate_log': result['debate_log'],
                'user': updated_user
            }
            
            # Add fallback information if used
            if result.get('used_fallback', False):
                response_data['fallback_used'] = True
                response_data['fallback_message'] = 'Analysis completed using fallback responses due to API quota limitations. For more detailed AI-powered analysis, please try again later when quota resets.'
                response_data['api_calls_made'] = result.get('api_calls_made', 0)
            else:
                response_data['fallback_used'] = False
                response_data['api_calls_made'] = result.get('api_calls_made', 0)
            
            print(f"📤 Sending response: {response_data}")
            return JsonResponse(response_data)
        else:
            # Refund credits if requirement generation failed
            mongodb_service.add_credits(user['_id'], 2, 'Credit refund - requirement generation failed')
            mongodb_service.close()
            
            return JsonResponse({
                'success': False,
                'error': result.get('error', 'Unknown error occurred')
            }, status=500)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def refine_requirements_with_feedback(request):
    """API endpoint to refine requirements based on user feedback"""
    try:
        data = json.loads(request.body)
        idea_id = data.get('idea_id', '').strip()
        user_feedback = data.get('feedback', '').strip()
        
        if not idea_id:
            return JsonResponse({
                'success': False,
                'error': 'Idea ID is required'
            }, status=400)
        
        if not user_feedback:
            return JsonResponse({
                'success': False,
                'error': 'User feedback is required'
            }, status=400)
        
        # Get authenticated user
        user = get_user_from_request(request)
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'User authentication required'
            }, status=401)
        
        # Check if user has sufficient credits (1 credit for feedback iteration)
        mongodb_service = MongoDBService()
        current_credits = mongodb_service.get_user_credits(user['_id'])
        
        if current_credits < 1:
            mongodb_service.close()
            return JsonResponse({
                'success': False,
                'error': f'Insufficient credits. Required: 1, Available: {current_credits}'
            }, status=402)
        
        # Get the original idea and previous debate
        idea_data = mongodb_service.get_idea_with_iterations(idea_id)
        if not idea_data:
            mongodb_service.close()
            return JsonResponse({
                'success': False,
                'error': 'Idea not found'
            }, status=404)
        
        # Check if user owns this idea
        if idea_data['idea']['user_id'] != user['_id']:
            mongodb_service.close()
            return JsonResponse({
                'success': False,
                'error': 'Access denied'
            }, status=403)
        
        # Deduct 1 credit for feedback iteration
        success, message = mongodb_service.deduct_credits(user['_id'], 1, 'Feedback-based requirement refinement')
        if not success:
            mongodb_service.close()
            return JsonResponse({
                'success': False,
                'error': message
            }, status=402)
        
        # Get the original idea text
        original_idea = idea_data['idea']['description']
        
        # Get previous debate log
        previous_debate_log = []
        for round_num, debates in idea_data['debate_rounds'].items():
            for debate in debates:
                previous_debate_log.append({
                    'agent': debate['agent'],
                    'response': debate['message'],
                    'round': round_num
                })
        
        # Initialize services
        agent_system = MultiAgentSystem()
        
        # Run feedback-based refinement
        result = agent_system.refine_requirements_with_feedback(
            original_idea, 
            previous_debate_log, 
            user_feedback
        )
        
        if result['success']:
            # Save new debate log
            mongodb_service.save_debates(idea_id, result['debate_log'])
            
            # Parse PRD content to extract sections
            prd_text = result['prd_content']
            
            # Parse the PRD sections
            sections = _parse_prd_sections(prd_text)
            
            # Save feedback iteration to MongoDB
            iteration_data = {
                'user_feedback': user_feedback,
                'prd_content': prd_text,
                'sections': sections,
                'iteration_number': len(idea_data['requirements_iterations']) + 1
            }
            mongodb_service.save_feedback_iteration(idea_id, iteration_data)
            
            # Get updated user data
            updated_user = mongodb_service.get_user_by_id(user['_id'])
            mongodb_service.close()
            
            # Prepare response with fallback information
            response_data = {
                'success': True,
                'idea_id': idea_id,
                'prd_content': result['prd_content'],
                'debate_log': result['debate_log'],
                'sections': sections,
                'user': updated_user
            }
            
            # Add fallback information if used
            if result.get('used_fallback', False):
                response_data['fallback_used'] = True
                response_data['fallback_message'] = 'Analysis completed using fallback responses due to API quota limitations. For more detailed AI-powered analysis, please try again later when quota resets.'
                response_data['api_calls_made'] = result.get('api_calls_made', 0)
            else:
                response_data['fallback_used'] = False
                response_data['api_calls_made'] = result.get('api_calls_made', 0)
            
            return JsonResponse(response_data)
        else:
            # Refund credits if refinement failed
            mongodb_service.add_credits(user['_id'], 1, 'Credit refund - feedback refinement failed')
            mongodb_service.close()
            
            return JsonResponse({
                'success': False,
                'error': result.get('error', 'Unknown error occurred')
            }, status=500)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_history(request):
    """API endpoint to get past ideas and debates"""
    try:
        mongodb_service = MongoDBService()
        history = mongodb_service.get_idea_history(limit=10)
        mongodb_service.close()
        
        # Convert ObjectId to string for JSON serialization
        for item in history:
            item['_id'] = str(item['_id'])
            if 'latest_requirement' in item and item['latest_requirement']:
                item['latest_requirement']['_id'] = str(item['latest_requirement']['_id'])
        
        return JsonResponse({
            'success': True,
            'history': history
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_idea_details(request, idea_id):
    """API endpoint to get detailed information about a specific idea"""
    try:
        mongodb_service = MongoDBService()
        details = mongodb_service.get_idea_details(idea_id)
        mongodb_service.close()
        
        if not details:
            return JsonResponse({
                'success': False,
                'error': 'Idea not found'
            }, status=404)
        
        # Convert ObjectId to string for JSON serialization
        details['idea']['_id'] = str(details['idea']['_id'])
        if details['requirement']:
            details['requirement']['_id'] = str(details['requirement']['_id'])
        
        return JsonResponse({
            'success': True,
            'idea': details['idea'],
            'debate_rounds': details['debate_rounds'],
            'requirement': details['requirement']
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


# Chat Session Management Endpoints
@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def create_chat_session(request):
    """Create a new chat session"""
    try:
        user = get_user_from_request(request)
        data = json.loads(request.body)
        
        title = data.get('title', 'New Chat')
        idea_summary = data.get('idea_summary', '')
        
        # Create session in MongoDB
        mongodb_service = MongoDBService()
        session_id = mongodb_service.create_chat_session(
            user_id=user['email'],
            title=title,
            idea_summary=idea_summary
        )
        
        if session_id:
            return JsonResponse({
                'success': True,
                'session_id': session_id,
                'message': 'Chat session created successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to create chat session'
            }, status=500)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def get_chat_sessions(request):
    """Get all chat sessions for the authenticated user"""
    try:
        user = get_user_from_request(request)
        
        # Get sessions from MongoDB
        mongodb_service = MongoDBService()
        sessions = mongodb_service.get_user_chat_sessions(user['email'])
        
        return JsonResponse({
            'success': True,
            'sessions': sessions
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def get_chat_session(request, session_id):
    """Get a specific chat session with its messages"""
    try:
        user = get_user_from_request(request)
        
        # Get session and messages from MongoDB
        mongodb_service = MongoDBService()
        session = mongodb_service.get_chat_session(session_id)
        
        if not session:
            return JsonResponse({
                'success': False,
                'error': 'Chat session not found'
            }, status=404)
        
        # Verify user owns this session
        if session['user_id'] != user['email']:
            return JsonResponse({
                'success': False,
                'error': 'Access denied'
            }, status=403)
        
        # Get messages for this session
        messages = mongodb_service.get_chat_messages(session_id)
        
        return JsonResponse({
            'success': True,
            'session': session,
            'messages': messages
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
@require_auth
def update_chat_session(request, session_id):
    """Update a chat session (title, status, etc.)"""
    try:
        user = get_user_from_request(request)
        data = json.loads(request.body)
        
        # Verify user owns this session
        mongodb_service = MongoDBService()
        session = mongodb_service.get_chat_session(session_id)
        
        if not session:
            return JsonResponse({
                'success': False,
                'error': 'Chat session not found'
            }, status=404)
        
        if session['user_id'] != user['email']:
            return JsonResponse({
                'success': False,
                'error': 'Access denied'
            }, status=403)
        
        # Update session
        updates = {}
        if 'title' in data:
            updates['title'] = data['title']
        if 'status' in data:
            updates['status'] = data['status']
        if 'idea_summary' in data:
            updates['idea_summary'] = data['idea_summary']
        
        if updates:
            success = mongodb_service.update_chat_session(session_id, updates)
            if success:
                return JsonResponse({
                    'success': True,
                    'message': 'Chat session updated successfully'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to update chat session'
                }, status=500)
        else:
            return JsonResponse({
                'success': False,
                'error': 'No valid updates provided'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
@require_auth
def delete_chat_session(request, session_id):
    """Delete a chat session and all its messages"""
    try:
        user = get_user_from_request(request)
        
        # Verify user owns this session
        mongodb_service = MongoDBService()
        session = mongodb_service.get_chat_session(session_id)
        
        if not session:
            return JsonResponse({
                'success': False,
                'error': 'Chat session not found'
            }, status=404)
        
        if session['user_id'] != user['email']:
            return JsonResponse({
                'success': False,
                'error': 'Access denied'
            }, status=403)
        
        # Delete session
        success = mongodb_service.delete_chat_session(session_id)
        if success:
            return JsonResponse({
                'success': True,
                'message': 'Chat session deleted successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to delete chat session'
            }, status=500)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def add_chat_message(request):
    """Add a new chat message to a session"""
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        role = data.get('role')
        content = data.get('content')
        round_number = data.get('round_number', 1)
        
        if not all([session_id, role, content]):
            return JsonResponse({
                'success': False,
                'error': 'Missing required fields: session_id, role, content'
            }, status=400)
        
        # Get the chat session
        mongodb_service = MongoDBService()
        session = mongodb_service.get_chat_session(session_id)
        if not session:
            return JsonResponse({
                'success': False,
                'error': 'Chat session not found'
            }, status=404)
        
        # Verify user owns this session
        if session.get('user_id') != request.user_id:
            return JsonResponse({
                'success': False,
                'error': 'Unauthorized access to chat session'
            }, status=403)
        
        # Add the message
        message_id = mongodb_service.add_chat_message(
            session_id=session_id,
            role=role,
            content=content,
            round_number=round_number
        )
        mongodb_service.close()
        
        if message_id:
            return JsonResponse({
                'success': True,
                'message': {
                    'id': message_id,
                    'session_id': session_id,
                    'role': role,
                    'content': content,
                    'round_number': round_number,
                    'timestamp': datetime.now().isoformat()
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to add chat message'
            }, status=500)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        print(f"Error adding chat message: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)
