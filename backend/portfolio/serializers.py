from rest_framework import serializers

from .models import habit

# convert data to JSON
class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = habit
        fields = ['urls', 'id', 'name', 'category', 'streak', 'created_at', 'description']
