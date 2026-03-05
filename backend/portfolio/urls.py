from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns 
from . import views

urlpatterns=[
    path("", views.api_root, name="api-root"),
    path("habits/", views.HabitList.as_view(), name="habits-list"),
    path('habits/<int:pk>', views.HabitDetail.as_view(), name="habits-detail"),
]

urlpatterns=format_suffix_patterns(urlpatterns) # have DRF handle my url patterns