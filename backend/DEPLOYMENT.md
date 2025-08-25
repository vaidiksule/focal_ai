# Render Deployment Guide

## Quick Fix for Port Binding Error

The error `Detected service running on port 10000` means your Render configuration is wrong.

## ✅ Correct Render Settings:

### 1. Build Command:
```bash
pip install -r requirements.txt
```

### 2. Start Command:
```bash
gunicorn focalai_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

### 3. Environment Variables:
```
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=focal-ai-z53x.onrender.com,.onrender.com
CORS_ALLOW_ALL_ORIGINS=False
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB_NAME=focalai
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
PORT=8000
```

## ❌ What NOT to do:
- Don't use `gunicorn app:app` (wrong!)
- Don't hardcode port numbers
- Don't use Docker (not needed)

## 🔧 Why This Happened:
- Your backend was trying to run on port 10000
- Render expects it to use the `$PORT` environment variable
- The correct command binds to `0.0.0.0:$PORT`

## 🚀 After Fixing:
1. Update Render settings
2. Redeploy
3. Your backend will work on the correct port!
