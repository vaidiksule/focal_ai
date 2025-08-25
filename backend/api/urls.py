from django.urls import path
from . import views
from . import user_views

urlpatterns = [
    # Test endpoints
    path('test/', views.test_connection, name='test_connection'),
    path('test-auth/', views.test_auth, name='test_auth'),
    
    # Main functionality
    path('refine/', views.refine_requirements, name='refine_requirements'),
    path('refine-feedback/', views.refine_requirements_with_feedback, name='refine_requirements_with_feedback'),
    path('history/', views.get_history, name='get_history'),
    path('idea/<int:idea_id>/', views.get_idea_details, name='get_idea_details'),
    
    # User Management URLs (now require authentication)
    path('users/profile/', user_views.get_user_profile, name='get_user_profile'),
    path('users/deduct-credits/', user_views.deduct_credits, name='deduct_credits'),
    path('users/transactions/', user_views.get_user_transactions, name='get_user_transactions'),
    
    # Chat Session Management URLs
    path('chat/sessions/', views.create_chat_session, name='create_chat_session'),
    path('chat/sessions/list/', views.get_chat_sessions, name='get_chat_sessions'),
    path('chat/sessions/<str:session_id>/', views.get_chat_session, name='get_chat_session'),
    path('chat/sessions/<str:session_id>/update/', views.update_chat_session, name='update_chat_session'),
    path('chat/sessions/<str:session_id>/delete/', views.delete_chat_session, name='delete_chat_session'),
]
