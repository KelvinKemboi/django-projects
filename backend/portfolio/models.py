from django.db import models

# Create your models here.

# PROFILE MODEL
class profile(models.Model):
    name=models.TextField()
    age=models.IntegerField()
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Hello {self.name}"
    
# HABITS MODEL
class habit(models.Model):
    name=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
