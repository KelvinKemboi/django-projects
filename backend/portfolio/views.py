from django.shortcuts import render # html tester
from rest_framework import generics # # for GET/ POST/ PUT/ DELETE functionalities
from rest_framework.decorators import api_view # for GET/ POST/ PUT/ DELETE functionalities
from rest_framework.reverse import reverse
from rest_framework.response import Response # JSON responses
from rest_framework.permissions import IsAuthenticated, AllowAny # auth permissions
from rest_framework.views import APIView # view the login endpoint
from django.contrib.auth import authenticate # authenticate user
from rest_framework.exceptions import AuthenticationFailed # handling failed authentications
from .models import Habit, HabitGoal, HabitReminder, User
from .serializers import HabitSerializer, HabitGoalsSerializer, HabitReminderSerializer, UserSerializer, RegisterSerializer

# views 
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'habits': reverse('habits-list', request=request, format=format)
    })


# habits list & details
class HabitList(generics.ListCreateAPIView):
    queryset=Habit.objects.all()
    serializer_class=HabitSerializer
    permission_classes=[AllowAny]

    def get_queryset(self):
        user=self.request.user
        if user.is_authenticated and not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return Habit.objects.filter(user=user)
        return super().get_queryset()
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
            return
        serializer.save()


class HabitDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset=Habit.objects.all()
    serializer_class=HabitSerializer
    permission_classes=[AllowAny]

    def get_queryset(self):
        user=self.request.user
        if user.is_authenticated and not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return Habit.objects.filter(user=user)
        return super().get_queryset()
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
            return
        serializer.save()


# goals list and details
class GoalsList(generics.ListCreateAPIView):
    queryset=HabitGoal.objects.all()
    serializer_class=HabitGoalsSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        if not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return HabitGoal.objects.filter(user=user)
        return super().get_queryset()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalsDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset=HabitGoal.objects.all()
    serializer_class=HabitGoalsSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        if not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return HabitGoal.objects.filter(user=user)
        return super().get_queryset()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Remainders list and details
class RemindersList(generics.ListCreateAPIView):
    queryset=HabitReminder.objects.all()
    serializer_class=HabitReminderSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        if not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return HabitReminder.objects.filter(user=user)
        return super().get_queryset()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RemindersDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset=HabitReminder.objects.all()
    serializer_class=HabitReminderSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        if not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return HabitReminder.objects.filter(user=user)
        return super().get_queryset()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

 
# User list and details
class UserList(generics.ListCreateAPIView):
    queryset=User.objects.all()
    serializer_class=UserSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user= self.request.user
        if not user.is_superuser and not user.is_staff:
            return User.objects.all(id=user.id)
        return User.objects.all()

class UserDetail(generics.RetrieveAPIView):
    queryset=User.objects.all()
    serializer_class=UserSerializer
    permission_classes=[IsAuthenticated]

    def get_object(self):
        user= self.request.user
        if not user.is_staff and not user.is_superuser:
            pass
        return super().get_object()


# Register
class Register(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=RegisterSerializer


