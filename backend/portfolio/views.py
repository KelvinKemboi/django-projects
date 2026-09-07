from rest_framework import generics, status # # for GET/ POST/ PUT/ DELETE functionalities
from rest_framework.decorators import api_view # for GET/ POST/ PUT/ DELETE functionalities
from rest_framework.reverse import reverse # for generating URLs for API endpoints
from rest_framework.response import Response # JSON responses
from rest_framework.permissions import IsAuthenticated, AllowAny # auth permissions
from rest_framework.views import APIView # view the login endpoint
from django.contrib.auth.tokens import default_token_generator # one-time tokens for password reset links
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail # send email for password reset
from django.conf import settings
from django.utils.encoding import force_bytes, force_str # encode/decode user id for password reset links
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode # encode/decode user id for password reset links
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

    # filter habits based on the authenticated user
    def get_queryset(self):
        user=self.request.user
        if user.is_authenticated and not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return Habit.objects.filter(user=user)
        return super().get_queryset()
    
    # save the authenticated user as the owner of the habit when creating a new habit
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
            return
        serializer.save()

# habit detail view for retrieving, updating, and deleting a habit
class HabitDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset=Habit.objects.all()
    serializer_class=HabitSerializer
    permission_classes=[AllowAny] # allow any user to view habit details

    # filter habits based on the authenticated user
    def get_queryset(self):
        user=self.request.user
        if user.is_authenticated and not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return Habit.objects.filter(user=user)
        return super().get_queryset()
    
    # save the authenticated user as the owner of the habit when creating a new habit
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

    # filter goals based on the authenticated user
    def get_queryset(self):
        user=self.request.user
        if not user.is_superuser and not user.is_staff: # normal users only see their own habits
            return HabitGoal.objects.filter(user=user)
        return super().get_queryset()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# goal detail view for retrieving, updating, and deleting a goal
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

# reminder detail view for retrieving, updating, and deleting a reminder
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

# User detail view for retrieving, updating, and deleting a user
class UserDetail(generics.RetrieveAPIView):
    queryset=User.objects.all()
    serializer_class=UserSerializer
    permission_classes=[IsAuthenticated]

    # filter users based on the authenticated user
    def get_object(self):
        user= self.request.user
        if not user.is_staff and not user.is_superuser:
            pass
        return super().get_object()


# Register
class Register(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=RegisterSerializer


# Forgot password: email a reset link containing a uid/token pair to whoever owns that address
class ResetPasswordView(APIView):
    permission_classes=[AllowAny]

    # handle POST requests to initiate the password reset process
    def post(self, request):
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"email": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first() # get the user with the provided email (case-insensitive)
        # if a user with the provided email exists, generate a password reset link and send it via email
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk)) # encode the user's primary key (id) to create a unique identifier for the password reset link
            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            send_mail(
                subject="Reset your Habit Tracker password",
                message=(
                    f"Click the link below to reset your password:\n\n{reset_link}\n\n"
                    "If you didn't request this, you can safely ignore this email or let us know."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL, # use the default from email address defined in settings.py
                recipient_list=[user.email], # send the email to the user's email address
            )

        # Same response whether or not the email is registered, so we don't leak account existence.
        return Response(
            {"detail": "If an account with that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


# Reset password: consume the uid/token from the emailed link and set a new password
class ResetPasswordConfirmView(APIView):
    permission_classes=[AllowAny]

    # handle POST requests to reset the user's password using the provided uid, token, and new password
    def post(self, request):
        uid = request.data.get("uid", "")
        token = request.data.get("token", "")
        password = request.data.get("password", "")

        # validate that all required fields are provided
        if not uid or not token or not password:
            return Response(
                {"detail": "uid, token and password are all required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid)) # decode the uid to get the user's primary key (id)
            user = User.objects.get(pk=user_id) # retrieve the user object based on the decoded primary key (id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "This reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(password, user) # validate the new password against Django's password validation rules
        except DjangoValidationError as error:
            return Response({"password": error.messages}, status=status.HTTP_400_BAD_REQUEST)

        # set the new password for the user and save the changes
        user.set_password(password)
        user.save()
        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)


