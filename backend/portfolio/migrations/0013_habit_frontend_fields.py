from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolio", "0002_habitanalyse_habitgoal_habitlog_habitreminder_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="habit",
            name="completed_today",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="habit",
            name="frequency",
            field=models.CharField(
                choices=[("Daily", "Daily"), ("Weekly", "Weekly")],
                default="Daily",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="habit",
            name="progress_percent",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
