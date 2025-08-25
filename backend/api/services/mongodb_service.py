import os
from pymongo import MongoClient
from django.conf import settings
import json
from datetime import datetime
from bson import ObjectId


class MongoDBService:
    """Service for MongoDB operations"""
    
    def __init__(self):
        # MongoDB connection configuration
        self.mongodb_uri = settings.MONGODB_URI
        self.db_name = settings.MONGODB_DB_NAME
        
        if not self.mongodb_uri:
            raise ValueError("MONGODB_URI is not configured in settings")
        
        try:
            # Connect to MongoDB with proper options
            self.client = MongoClient(
                self.mongodb_uri,
                serverSelectionTimeoutMS=10000,
                connectTimeoutMS=10000,
                socketTimeoutMS=20000,
                maxPoolSize=10,
                retryWrites=True,
                w='majority'
            )
            
            # Test the connection
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            
            # Initialize collections
            self.ideas_collection = self.db.ideas
            self.debates_collection = self.db.debates
            self.requirements_collection = self.db.requirements
            self.users_collection = self.db.users
            self.credit_transactions_collection = self.db.credit_transactions
            self.chat_sessions_collection = self.db.chat_sessions
            self.chat_messages_collection = self.db.chat_messages
            
            # Create indexes for better performance
            self._create_indexes()
            
        except Exception as e:
            raise Exception(f"Failed to connect to MongoDB: {str(e)}")
    
    def _create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # User indexes
            self.users_collection.create_index("email", unique=True)
            self.users_collection.create_index("created_at")
            
            # Idea indexes
            self.ideas_collection.create_index("created_at")
            self.ideas_collection.create_index("user_id")
            
            # Debate indexes
            self.debates_collection.create_index("idea_id")
            self.debates_collection.create_index("round_number")
            
            # Requirements indexes
            self.requirements_collection.create_index("idea_id")
            self.requirements_collection.create_index("created_at")
            
            # Transaction indexes
            self.credit_transactions_collection.create_index("user_id")
            self.credit_transactions_collection.create_index("created_at")
            
            # Chat session indexes
            self.chat_sessions_collection.create_index("user_id")
            self.chat_sessions_collection.create_index("created_at")
            self.chat_sessions_collection.create_index("status")
            
            # Chat message indexes
            self.chat_messages_collection.create_index("session_id")
            self.chat_messages_collection.create_index("round_number")
            self.chat_messages_collection.create_index("timestamp")
            
        except Exception as e:
            print(f"⚠️ Warning: Failed to create some indexes: {str(e)}")
    
    def save_idea(self, idea_data):
        """Save idea to MongoDB"""
        idea_data['created_at'] = datetime.utcnow()
        idea_data['updated_at'] = datetime.utcnow()
        # Ensure user_id is included
        if 'user_id' not in idea_data:
            raise ValueError("user_id is required for idea creation")
        result = self.ideas_collection.insert_one(idea_data)
        return str(result.inserted_id)
    
    def save_debates(self, idea_id, debates):
        """Save debate entries to MongoDB"""
        debate_docs = []
        for debate in debates:
            debate_doc = {
                'idea_id': idea_id,
                'round_number': debate['round'],
                'agent_name': debate['agent'],
                'message': debate['response'],
                'timestamp': datetime.utcnow()
            }
            debate_docs.append(debate_doc)
        
        if debate_docs:
            result = self.debates_collection.insert_many(debate_docs)
            return [str(id) for id in result.inserted_ids]
        return []
    
    def save_requirements(self, idea_id, requirements_data):
        """Save refined requirements to MongoDB"""
        requirements_data['idea_id'] = idea_id
        requirements_data['created_at'] = datetime.utcnow()
        result = self.requirements_collection.insert_one(requirements_data)
        return str(result.inserted_id)
    
    def save_feedback_iteration(self, idea_id, iteration_data):
        """Save a feedback iteration with user feedback and new requirements"""
        iteration_data['idea_id'] = idea_id
        iteration_data['created_at'] = datetime.utcnow()
        result = self.requirements_collection.insert_one(iteration_data)
        return str(result.inserted_id)
    
    def get_idea_history(self, limit=10):
        """Get recent ideas with their requirements"""
        pipeline = [
            {
                '$lookup': {
                    'from': 'requirements',
                    'localField': '_id',
                    'foreignField': 'idea_id',
                    'as': 'requirements'
                }
            },
            {
                '$lookup': {
                    'from': 'debates',
                    'localField': '_id',
                    'foreignField': 'idea_id',
                    'as': 'debates'
                }
            },
            {
                '$addFields': {
                    'debate_count': {'$size': '$debates'},
                    'latest_requirement': {'$arrayElemAt': ['$requirements', -1]}
                }
            },
            {
                '$sort': {'created_at': -1}
            },
            {
                '$limit': limit
            }
        ]
        
        return list(self.ideas_collection.aggregate(pipeline))
    
    def get_idea_details(self, idea_id):
        """Get detailed information about a specific idea"""
        from bson import ObjectId
        
        # Get idea
        idea = self.ideas_collection.find_one({'_id': ObjectId(idea_id)})
        if not idea:
            return None
        
        # Get debates organized by round
        debates = list(self.debates_collection.find({'idea_id': idea_id}).sort([('round_number', 1), ('timestamp', 1)]))
        
        # Get latest requirement
        requirement = self.requirements_collection.find_one({'idea_id': idea_id}, sort=[('created_at', -1)])
        
        # Organize debates by round
        debate_rounds = {}
        for debate in debates:
            round_num = debate['round_number']
            if round_num not in debate_rounds:
                debate_rounds[round_num] = []
            debate_rounds[round_num].append({
                'agent': debate['agent_name'],
                'message': debate['message'],
                'timestamp': debate['timestamp'].isoformat()
            })
        
        return {
            'idea': idea,
            'debate_rounds': debate_rounds,
            'requirement': requirement
        }
    
    def get_idea_with_iterations(self, idea_id):
        """Get idea with all its requirement iterations"""
        from bson import ObjectId
        
        # Get idea
        idea = self.ideas_collection.find_one({'_id': ObjectId(idea_id)})
        if not idea:
            return None
        
        # Get all requirement iterations
        requirements = list(self.requirements_collection.find({'idea_id': idea_id}).sort('created_at', 1))
        
        # Get debates
        debates = list(self.debates_collection.find({'idea_id': idea_id}).sort([('round_number', 1), ('timestamp', 1)]))
        
        # Organize debates by round
        debate_rounds = {}
        for debate in debates:
            round_num = debate['round_number']
            if round_num not in debate_rounds:
                debate_rounds[round_num] = []
            debate_rounds[round_num].append({
                'agent': debate['agent_name'],
                'message': debate['message'],
                'timestamp': debate['timestamp'].isoformat()
            })
        
        return {
            'idea': idea,
            'requirements_iterations': requirements,
            'debate_rounds': debate_rounds
        }
    
    # User Management Methods
    def create_user(self, user_data):
        """Create a new user with initial 10 credits"""
        try:
            user_doc = {
                'email': user_data['email'],
                'name': user_data.get('name', ''),
                'avatar': user_data.get('picture', ''),  # Google OAuth provides 'picture' field
                'credits': 10,  # Initial credits
                'created_at': datetime.utcnow(),
                'last_login': datetime.utcnow(),
                'is_active': True
            }
            
            # print(f"🔧 Creating user: {user_data['email']}")
            result = self.users_collection.insert_one(user_doc)
            user_id = str(result.inserted_id)
            
            # Log initial credit transaction
            self.log_credit_transaction(
                user_id=user_id,
                transaction_type='initial',
                amount=10,
                description='Initial credits upon account creation'
            )
            return user_id
            
        except Exception as e:
            # print(f"❌ Error creating user: {str(e)}")
            raise e
    
    def get_user_by_email(self, email):
        """Get user by email"""
        try:
            user = self.users_collection.find_one({'email': email})
            if user:
                user['_id'] = str(user['_id'])
            else:
                print(f"ℹ️ User not found: {email}")
            return user
        except Exception as e:
            print(f"❌ Error getting user by email: {str(e)}")
            return None
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        try:
            user = self.users_collection.find_one({'_id': ObjectId(user_id)})
            if user:
                user['_id'] = str(user['_id'])
            return user
        except:
            return None
    
    def update_user_login(self, user_id):
        """Update user's last login time"""
        try:
            self.users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'last_login': datetime.utcnow()}}
            )
            return True
        except:
            return False
    
    def update_user_profile(self, user_id, profile_data):
        """Update user profile information"""
        try:
            update_data = {}
            if 'name' in profile_data:
                update_data['name'] = profile_data['name']
            if 'avatar' in profile_data:
                update_data['avatar'] = profile_data['avatar']
            
            if update_data:
                self.users_collection.update_one(
                    {'_id': ObjectId(user_id)},
                    {'$set': update_data}
                )
            return True
        except:
            return False
    
    # Credit Management Methods
    def get_user_credits(self, user_id):
        """Get user's current credit balance"""
        try:
            user = self.users_collection.find_one({'_id': ObjectId(user_id)})
            return user.get('credits', 0) if user else 0
        except:
            return 0
    
    def deduct_credits(self, user_id, amount=2, description='Requirement generation'):
        """Deduct credits from user account"""
        try:
            # Check if user has sufficient credits
            current_credits = self.get_user_credits(user_id)
            if current_credits < amount:
                return False, f"Insufficient credits. Required: {amount}, Available: {current_credits}"
            
            # Deduct credits
            result = self.users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$inc': {'credits': -amount}}
            )
            
            if result.modified_count > 0:
                # Log the transaction
                self.log_credit_transaction(
                    user_id=user_id,
                    transaction_type='deduction',
                    amount=-amount,
                    description=description
                )
                return True, f"Successfully deducted {amount} credits"
            else:
                return False, "Failed to deduct credits"
                
        except Exception as e:
            return False, f"Error deducting credits: {str(e)}"
    
    def add_credits(self, user_id, amount, description='Credit purchase'):
        """Add credits to user account"""
        try:
            result = self.users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$inc': {'credits': amount}}
            )
            
            if result.modified_count > 0:
                # Log the transaction
                self.log_credit_transaction(
                    user_id=user_id,
                    transaction_type='addition',
                    amount=amount,
                    description=description
                )
                return True, f"Successfully added {amount} credits"
            else:
                return False, "Failed to add credits"
                
        except Exception as e:
            return False, f"Error adding credits: {str(e)}"
    
    def log_credit_transaction(self, user_id, transaction_type, amount, description):
        """Log a credit transaction for audit trail"""
        try:
            transaction_doc = {
                'user_id': user_id,
                'transaction_type': transaction_type,  # 'initial', 'deduction', 'addition'
                'amount': amount,
                'description': description,
                'created_at': datetime.utcnow()
            }
            
            self.credit_transactions_collection.insert_one(transaction_doc)
            # print(f"✅ Credit transaction logged: {transaction_type} {amount} credits for user {user_id}")
            
        except Exception as e:
            print(f"❌ Error logging credit transaction: {str(e)}")
    
    def get_user_transactions(self, user_id, limit=20):
        """Get user's credit transaction history"""
        try:
            transactions = list(self.credit_transactions_collection.find(
                {'user_id': user_id}
            ).sort('created_at', -1).limit(limit))
            
            # Convert ObjectId to string
            for transaction in transactions:
                transaction['_id'] = str(transaction['_id'])
            
            return transactions
        except:
            return []
    
    # Chat Session Management Methods
    def create_chat_session(self, user_id, title="New Chat", idea_summary=""):
        """Create a new chat session"""
        try:
            session_data = {
                'user_id': user_id,
                'title': title,
                'idea_summary': idea_summary,
                'status': 'active',
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            result = self.chat_sessions_collection.insert_one(session_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating chat session: {str(e)}")
            return None

    def get_user_chat_sessions(self, user_id, limit=50):
        """Get all chat sessions for a user"""
        try:
            sessions = list(self.chat_sessions_collection.find(
                {'user_id': user_id},
                {'_id': 1, 'title': 1, 'idea_summary': 1, 'status': 1, 'created_at': 1, 'updated_at': 1}
            ).sort('updated_at', -1).limit(limit))
            
            # Convert ObjectId to string for JSON serialization
            for session in sessions:
                session['_id'] = str(session['_id'])
                session['created_at'] = session['created_at'].isoformat()
                session['updated_at'] = session['updated_at'].isoformat()
            
            return sessions
        except Exception as e:
            print(f"Error getting user chat sessions: {str(e)}")
            return []

    def get_chat_session(self, session_id):
        """Get a specific chat session by ID"""
        try:
            from bson import ObjectId
            session = self.chat_sessions_collection.find_one({'_id': ObjectId(session_id)})
            if session:
                session['_id'] = str(session['_id'])
                session['created_at'] = session['created_at'].isoformat()
                session['updated_at'] = session['updated_at'].isoformat()
            return session
        except Exception as e:
            print(f"Error getting chat session: {str(e)}")
            return None

    def update_chat_session(self, session_id, updates):
        """Update a chat session"""
        try:
            from bson import ObjectId
            updates['updated_at'] = datetime.utcnow()
            result = self.chat_sessions_collection.update_one(
                {'_id': ObjectId(session_id)},
                {'$set': updates}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating chat session: {str(e)}")
            return False

    def delete_chat_session(self, session_id):
        """Delete a chat session and all its messages"""
        try:
            from bson import ObjectId
            # Delete all messages first
            self.chat_messages_collection.delete_many({'session_id': session_id})
            # Delete the session
            result = self.chat_sessions_collection.delete_one({'_id': ObjectId(session_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting chat session: {str(e)}")
            return False

    def add_chat_message(self, session_id, role, content, round_number=1):
        """Add a new message to a chat session"""
        try:
            message_data = {
                'session_id': session_id,
                'role': role,
                'content': content,
                'round_number': round_number,
                'timestamp': datetime.utcnow()
            }
            result = self.chat_messages_collection.insert_one(message_data)
            
            # Update session's updated_at timestamp
            self.update_chat_session(session_id, {})
            
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding chat message: {str(e)}")
            return None

    def get_chat_messages(self, session_id, limit=100):
        """Get all messages for a chat session"""
        try:
            messages = list(self.chat_messages_collection.find(
                {'session_id': session_id},
                {'_id': 1, 'role': 1, 'content': 1, 'round_number': 1, 'timestamp': 1}
            ).sort('timestamp', 1).limit(limit))
            
            # Convert ObjectId to string for JSON serialization
            for message in messages:
                message['_id'] = str(message['_id'])
                message['timestamp'] = message['timestamp'].isoformat()
            
            return messages
        except Exception as e:
            print(f"Error getting chat messages: {str(e)}")
            return []

    def get_session_message_count(self, session_id):
        """Get the count of messages in a session"""
        try:
            return self.chat_messages_collection.count_documents({'session_id': session_id})
        except Exception as e:
            print(f"Error getting session message count: {str(e)}")
            return 0
    
    def close(self):
        """Close MongoDB connection"""
        try:
            self.client.close()
            # print("🔌 MongoDB connection closed")
        except:
            pass
