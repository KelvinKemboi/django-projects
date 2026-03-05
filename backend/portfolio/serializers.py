from rest_framework import serializers

from .models import habit

# convert data to JSON
class HabitSerializer(serializers.ModelSerializer):
    # Hyperlinked field with habits detail
    url = serializers.HyperlinkedIdentityField(view_name='habits-detail')

    class Meta:
        model = habit
        fields = ['url', 'id', 'name', 'category', 'streak', 'created_at', 'description']
