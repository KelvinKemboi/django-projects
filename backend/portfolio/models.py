from django.db import models

# Create your models here.

# HABITS MODEL
class habit(models.Model):
    # list of categories of habits
    categories=[
        ('study', 'Study'),
        ('diet', 'Diet'),
        ('exercise', 'Exercise'),
        ('work', 'Work'),
        ('sleep', 'Sleep'),
        ('creative', 'Creative'),
        ('other', 'Other')
    ]

    activity=[
        ('active', 'Active'),
        ('inactive', 'Inactive')
    ]
    # columns for my db
    name=models.CharField(max_length=100, blank=True, default='')
    category=models.CharField(max_length=100, choices=categories, default='other')
    streak=models.IntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    description=models.TextField(max_length=100, default='')
    isActive=models.CharField(max_length=100,choices=activity, default='Inactive')

    def __str__(self):
        return f"{self.name} ({self.category})"


class habitLog(models.Model):
    habit=models.CharField(max_length=100, default='')
    completion_rate=models.IntegerField(default=0)
    last_active=models.DateTimeField()
    notes=models.TextField(max_length=100, default="")

    
    