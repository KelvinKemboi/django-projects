from rest_framework import serializers

from .models import Habit, HabitLog, HabitReminder, HabitGoal, HabitAnalyse

class HabitLogSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitLog
        fields= ["id",'habit',"completed", "completed_at", "notes"]


class HabitReminderSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitReminder
        fields= ["id","habit","reminder_time", "active"]

class HabitGoalsSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitGoal
        fields= ["id","habit","weekly_target"]


class HabitAnalysisSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitAnalyse
        fields= ["id","habit","completion_rate", "last_active"]

# convert data to JSON
class HabitSerializer(serializers.HyperlinkedModelSerializer):
    # Hyperlinked field with habits detail
    url = serializers.HyperlinkedIdentityField(view_name='habits-detail') #generates link for each habit
    logs= HabitLogSerializer(many=True, read_only=True)
    analysis= HabitAnalysisSerializer(read_only=True)
    class Meta:
        model = Habit
        fields = ['url', 'id', 'name', 'category', 'streak', 'created_at', 'description', 'logs', 'analysis']

    