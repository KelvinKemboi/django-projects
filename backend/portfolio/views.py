from django.shortcuts import render # html tester
from rest_framework import generics 
from .serializers import HabitSerializer # serialiser
from rest_framework.decorators import api_view # for GET/ POST/ PUT/ DELETE functionalities
from rest_framework.reverse import reverse
from rest_framework.response import Response

from .models import habit

# Create your views here.

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'habits': reverse('habits-list', request=request, format=format)
    })

class HabitList(generics.ListCreateAPIView):
    queryset=habit.objects.all()
    serializer_class=HabitSerializer

class HabitDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset=habit.objects.all()
    serializer_class=HabitSerializer