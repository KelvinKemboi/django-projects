from django.db import models

# Create your models here.

# HABITS MODEL
class Habit(models.Model):
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
    # habit columns for my db
    name=models.CharField(max_length=100, blank=True, default='')
    category=models.CharField(max_length=100, choices=categories, default='other')
    streak=models.IntegerField(default=0)
    created_at=models.DateTimeField(auto_created=True)
    description=models.TextField(max_length=100, default='')
    isActive=models.CharField(max_length=100,choices=activity, default='Inactive')

    def __str__(self):
        return f"{self.name} ({self.category})"


class HabitLog(models.Model):
    # individual habit logs
    habit=models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="logs") # CONNECT THIS TO PREVIOUS HABIT MODEL
    completion_rate=models.IntegerField(default=0)
    last_active=models.DateTimeField(auto_now_add=True)
    completed_at=models.DateField(null=True, blank=True)
    notes=models.TextField(max_length=100, default="")

    def __str__(self):
        return f"{self.habit}, Completion Rate: {self.completion_rate}"

    
    