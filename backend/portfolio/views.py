from django.shortcuts import render # html tester
from rest_framework import generics 
from rest_framework.decorators import api_view # for GET/ POST/ PUT/ DELETE functionalities
from rest_framework.reverse import reverse
from rest_framework.response import Response

from .models import Habit, HabitGoal, HabitReminder
from .serializers import HabitSerializer, HabitGoalsSerializer, HabitReminderSerializer

# Create your views here.

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'habits': reverse('habits-list', request=request, format=format)
    })

# habits list & details
class HabitList(generics.ListCreateAPIView):
    queryset=Habit.objects.all()
    serializer_class=HabitSerializer

class HabitDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset=Habit.objects.all()
    serializer_class=HabitSerializer

# goals list and details
class GoalsList(generics.ListCreateAPIView):
    queryset=HabitGoal.objects.all()
    serializer_class=HabitGoalsSerializer

class GoalsDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset=HabitGoal.objects.all()
    serializer_class=HabitGoalsSerializer

# Remainders list and details
class RemaindersList(generics.ListCreateAPIView):
    queryset=HabitReminder.objects.all()
    serializer_class=HabitReminderSerializer

class ReamindersDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset=HabitReminder.objects.all()
    serializer_class=HabitReminderSerializer