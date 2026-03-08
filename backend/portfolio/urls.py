from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns 
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [

]
urlpatterns=[
    path("", views.api_root, name="api-root"),
    path("habits/", views.HabitList.as_view(), name="habits-list"),
    path('habits/<int:pk>', views.HabitDetail.as_view(), name="habits-detail"),
    path("goals/", views.GoalsList.as_view(), name="goals-list"),
    path('goals/<int:pk>', views.GoalsDetail.as_view(), name="goals-detail"),
    path("reminders/", views.RemindersList.as_view(), name="reminders-list"),
    path('reminders/<int:pk>', views.RemindersDetail.as_view(), name="reminders-detail"),
    path("user/", views.UserList.as_view(), name="user-list"),
    path('user/<int:pk>', views.UserDetail.as_view(), name="user-detail"),
    path("register/", views.Register.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

urlpatterns=format_suffix_patterns(urlpatterns) # have DRF handle my url patterns 