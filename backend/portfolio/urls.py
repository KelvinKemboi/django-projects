from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns 
from . import views

urlpatterns=[
    path("", views.api_root, name="api-root"),
    path("habits/", views.HabitList.as_view(), name="habits-list"),
    path('habits/<int:pk>', views.HabitDetail.as_view(), name="habits-detail"),
    path("goals/", views.GoalsList.as_view(), name="goals-list"),
    path('goals/<int:pk>', views.GoalsDetail.as_view(), name="goals-detail"),
    path("reminders/", views.RemaindersList.as_view(), name="reminders-list"),
    path('reminders/<int:pk>', views.ReamindersDetail.as_view(), name="reminders-detail"),
]

urlpatterns=format_suffix_patterns(urlpatterns) # have DRF handle my url patterns 