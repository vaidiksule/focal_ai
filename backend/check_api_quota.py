#!/usr/bin/env python3
"""
Utility script to check Google Gemini API quota status and provide helpful information.
"""

import os
import sys
from datetime import datetime, timedelta
import pytz

def check_quota_status():
    """Check and display API quota information"""
    
    print("🔍 Google Gemini API Quota Status")
    print("=" * 50)
    
    # Check if API key is set
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        print("   Please set your API key in your .env file")
        return
    
    print("✅ API key is configured")
    
    # Display quota information
    print("\n📊 Free Tier Quota Limits:")
    print("   • 50 requests per day per project per model")
    print("   • Model: gemini-1.5-flash")
    print("   • Resets daily at midnight Pacific Time")
    
    # Calculate reset time
    pacific_tz = pytz.timezone('US/Pacific')
    now = datetime.now(pacific_tz)
    
    # Find next midnight
    tomorrow = now + timedelta(days=1)
    next_reset = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
    
    time_until_reset = next_reset - now
    
    print(f"\n🕐 Quota Reset Time:")
    print(f"   Next reset: {next_reset.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print(f"   Time until reset: {time_until_reset}")
    
    print("\n💡 Recommendations:")
    print("   • Each requirement refinement uses ~6 API calls")
    print("   • You can process ~8 ideas per day with free tier")
    print("   • Consider upgrading to paid tier for more usage")
    print("   • The system now uses fallback responses when quota is exceeded")
    
    print("\n🔧 Current System Features:")
    print("   ✅ Automatic fallback responses when quota exceeded")
    print("   ✅ API call tracking and quota management")
    print("   ✅ User-friendly error messages")
    print("   ✅ Graceful degradation to continue working")

def show_usage_tips():
    """Show tips for managing API usage"""
    
    print("\n🎯 Usage Optimization Tips:")
    print("=" * 50)
    
    print("1. **Batch Processing**:")
    print("   • Process multiple ideas in one session")
    print("   • Avoid making single requests throughout the day")
    
    print("\n2. **Fallback Mode**:")
    print("   • System automatically switches to fallback responses")
    print("   • Fallback responses provide basic analysis")
    print("   • No API calls are made in fallback mode")
    
    print("\n3. **Quota Management**:")
    print("   • Monitor your usage with the API call counter")
    print("   • Plan your usage around the daily reset")
    print("   • Consider upgrading for production use")
    
    print("\n4. **Alternative Solutions**:")
    print("   • Use different API keys for different environments")
    print("   • Implement caching for repeated requests")
    print("   • Consider using other AI providers as backup")

if __name__ == "__main__":
    try:
        check_quota_status()
        show_usage_tips()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
