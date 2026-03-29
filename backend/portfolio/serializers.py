from rest_framework import serializers
from django.contrib.auth.hashers import make_password # hashes the password for security

from .models import Habit, HabitLog, HabitReminder, HabitGoal, HabitAnalyse, User

#have logs converted to json format
class HabitLogSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitLog
        fields= ["id", "user", 'habit',"completed", "completed_at", "notes"]

#have reminders converted to json format
class HabitReminderSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitReminder
        fields= ["id", "user","habit","reminder_time", "active"]

#have goals converted to json format
class HabitGoalsSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitGoal
        fields= ["id","user","habit","weekly_target"]

#have analysis converted to json format
class HabitAnalysisSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitAnalyse
        fields= ["id","user","habit","completion_rate", "last_active"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model= User
        fields= ["id", "username", "email" ,"password"]

    #hashing
    def validate_password(self, value):
        return make_password(value)


class RegisterSerializer(serializers.ModelSerializer):
    password= serializers.CharField(write_only=True)

    class Meta:
        model= User
        fields= ["id", "username", "email" ,"password"]

    #creating the user
    def create(self, data):
        return User.objects.create_user(**data)

# convert data to JSON
class HabitSerializer(serializers.HyperlinkedModelSerializer):
    # Hyperlinked field with habits detail
    url = serializers.HyperlinkedIdentityField(view_name='habits-detail') #generates link for each habit
    logs= HabitLogSerializer(many=True, read_only=True)
    analysis= HabitAnalysisSerializer(read_only=True)

    # Frontend-friendly aliases.
    completedToday = serializers.BooleanField(source="completed_today")
    progressPercent = serializers.IntegerField(source="progress_percent")

    class Meta:
        model = Habit
        fields = [
            'url',
            'id',
            'user',
            'name',
            'category',
            'frequency',
            'streak',
            'completedToday',
            'progressPercent',
            'created_at',
            'description',
            'logs',
            'analysis',
        ]
        read_only_fields = ['user', 'created_at', 'logs', 'analysis']

    def validate_progressPercent(self, value):
        return max(0, min(100, value))
