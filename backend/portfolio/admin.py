from django.contrib import admin
from .models import Habit, HabitLog
# Register your models here.
admin.site.register(Habit)
admin.site.register(HabitLog)
