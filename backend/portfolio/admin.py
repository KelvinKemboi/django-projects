from django.contrib import admin
from .models import Habit, HabitLog, HabitGoal, HabitAnalyse, HabitReminder
# Registering my models

admin.site.register(Habit)
admin.site.register(HabitLog)
admin.site.register(HabitGoal)
admin.site.register(HabitAnalyse)
admin.site.register(HabitReminder)
