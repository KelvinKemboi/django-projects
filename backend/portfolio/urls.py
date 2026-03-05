from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns 
from . import views

urlpatterns=[
    path("", views.api_root, name="api-root"),
    path("habits/", views.habitList.as_view(), name="habits-list"),
]

urlpatterns=format_suffix_patterns(urlpatterns) # have DRF handle my url patterns