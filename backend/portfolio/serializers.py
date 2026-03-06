from rest_framework import serializers

from .models import Habit, HabitLog

class HabitLogSerializer(serializers.ModelSerializer):
    habit= serializers.HyperlinkedRelatedField(view_name='habits-detail',
                                               queryset= Habit.objects.all()
                                               )
    class Meta:
        model= HabitLog
        fields= ["id",'habit',"completion_rate", "last_active", "completed_at", "notes"]

# convert data to JSON
class HabitSerializer(serializers.HyperlinkedModelSerializer):
    # Hyperlinked field with habits detail
    url = serializers.HyperlinkedIdentityField(view_name='habits-detail') #generates link for each habit
    logs= HabitLogSerializer(many=True, read_only=True)
    class Meta:
        model = Habit
        fields = ['url', 'id', 'name', 'category', 'streak', 'created_at', 'description', 'logs']