from django.db import models
from django.utils import timezone
import json


class Idea(models.Model):
    """Model for storing user input ideas"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title


class Debate(models.Model):
    """Model for storing round-by-round agent conversations"""
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='debates')
    round_number = models.IntegerField(default=1)
    agent_name = models.CharField(max_length=100)  # Business, Engineer, Designer, Customer, Product Manager
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['idea', 'round_number', 'timestamp']
    
    def __str__(self):
        return f"{self.idea.title} - Round {self.round_number} - {self.agent_name}"


class Requirement(models.Model):
    """Model for storing final refined outputs"""
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='requirements')
    refined_requirements = models.TextField()
    trade_offs = models.TextField()
    next_steps = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Requirements for {self.idea.title}"


class ChatSession(models.Model):
    """Model for storing chat sessions"""
    user_id = models.CharField(max_length=100)  # Store as string for MongoDB compatibility
    title = models.CharField(max_length=200, default="New Chat")
    idea_summary = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, 
        choices=[
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('archived', 'Archived')
        ],
        default='active'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} - {self.user_id}"


class ChatMessage(models.Model):
    """Model for storing individual chat messages"""
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(
        max_length=20,
        choices=[
            ('user', 'User'),
            ('product_manager', 'Product Manager'),
            ('design_lead', 'Design Lead'),
            ('engineering_lead', 'Engineering Lead'),
            ('marketing_sales_head', 'Marketing & Sales Head'),
            ('business_manager', 'Business Manager'),
            ('system', 'System')
        ]
    )
    content = models.TextField()
    round_number = models.IntegerField(default=1)
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['session', 'round_number', 'timestamp']
    
    def __str__(self):
        return f"{self.session.title} - {self.role} - Round {self.round_number}"
