from django.db import models
from django.contrib.auth import get_user_model

#user model
User=get_user_model()

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

    frequency_choices = [
        ('Daily', 'Daily'),
        ('Weekly', 'Weekly'),
    ]

    # habit columns for my db
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_habits", null=True, blank=True)
    name=models.CharField(max_length=100, blank=True, default='')
    category=models.CharField(max_length=100, choices=categories, default='other')
    streak=models.IntegerField(default=0)
    frequency=models.CharField(max_length=20, choices=frequency_choices, default='Daily')
    completed_today=models.BooleanField(default=False)
    progress_percent=models.PositiveIntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    description=models.TextField(max_length=100, default='')
    isActive=models.CharField(max_length=100,choices=activity, default='inactive')

    def __str__(self):
        return f"{self.name} ({self.category})"


class HabitLog(models.Model):
    # individual habit logs
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_logs", null=True, blank=True)
    habit=models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="logs") # CONNECT THIS TO PREVIOUS HABIT MODEL
    completed=models.BooleanField(default=False)
    completed_at=models.DateField(null=True, blank=True)
    notes=models.TextField(max_length=100, default="")

    def __str__(self):
        return f"{self.habit}, Completion Rate: {self.completed}"
    
class HabitReminder(models.Model):
    # for habit remainders
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_reminders", null=True, blank=True)
    habit= models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="reminders") # ONE HABIT- multiple remainders
    reminder_time=models.TimeField(null=True)
    active=models.BooleanField(default=True)

class HabitGoal(models.Model):
    # for habit goals
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_goals", null=True, blank=True)
    habit= models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="goals") # ONE HABIT- SAME ID, MULTIPLE GOALS
    weekly_target= models.IntegerField(default=0)

class HabitAnalyse(models.Model):
    # completion rate/ last active for habits
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_analysis", null=True, blank=True)
    habit= models.OneToOneField(Habit, on_delete=models.CASCADE, related_name="analysis") # ONE HABIT-OWN ANALYSIS
    completion_rate= models.FloatField(default=0.00)
    last_active= models.DateField(null=True)
