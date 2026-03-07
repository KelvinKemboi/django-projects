# from django.contrib.auth import get_user_model
# from django.contrib.auth.backends import ModelBackend

# class EmailBackend(ModelBackend):
#     def authenticate(self, request, username = ..., password = ..., **kwargs):
#         userModel= get_user_model()
#         try: # check if the user exists
#             user=userModel.objects.get(email=username) # can log in with email instead
#         except userModel.DoesNotExist:
#             return None
#         else: # if exists check password
#             if user.check_password(password):
#                 return user
#             return None
        
        
            

