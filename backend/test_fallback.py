#!/usr/bin/env python3
"""
Test script to verify the fallback system works correctly.
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'focalai_backend.settings')
django.setup()

from api.services.multi_agent import MultiAgentSystem

def test_fallback_system():
    """Test the fallback system"""
    
    print("🧪 Testing Fallback System")
    print("=" * 50)
    
    # Create a test idea
    test_idea = "A mobile app that helps people find and book local fitness classes"
    
    # Initialize the multi-agent system
    agent_system = MultiAgentSystem()
    
    # Force quota exhaustion by setting max calls to 0
    agent_system.max_api_calls = 0
    agent_system.api_calls_made = 0
    
    print(f"📝 Test Idea: {test_idea}")
    print(f"🔧 Max API calls: {agent_system.max_api_calls}")
    print(f"📊 Current API calls: {agent_system.api_calls_made}")
    
    # Test the refinement
    print("\n🔄 Running refinement...")
    result = agent_system.refine_requirements(test_idea)
    
    print(f"\n✅ Result success: {result['success']}")
    print(f"🔄 Used fallback: {result.get('used_fallback', False)}")
    print(f"📊 API calls made: {result.get('api_calls_made', 0)}")
    
    if result['success']:
        print(f"\n📋 Refined Requirements:")
        print(result['refined_requirements'][:500] + "..." if len(result['refined_requirements']) > 500 else result['refined_requirements'])
        
        print(f"\n🤖 Debate Log ({len(result['debate_log'])} entries):")
        for i, debate in enumerate(result['debate_log'][:3]):  # Show first 3
            print(f"  {i+1}. {debate['agent']}: {debate['response'][:100]}...")
            if debate.get('fallback'):
                print(f"     (Fallback response)")
    else:
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
    
    print("\n🎯 Test completed!")

if __name__ == "__main__":
    test_fallback_system()
