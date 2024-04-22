from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='Home'),
    path('about/', views.about, name='About'),
    path('contact/', views.contact, name='Contact'),
    path('services/', views.services, name='Services'),
    path('projects/', views.projects, name='Projects'),
    path('form/', views.form, name='form')
]