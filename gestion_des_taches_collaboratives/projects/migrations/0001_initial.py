# Generated by Django 5.1.6 on 2025-03-04 23:52

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Projet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('date_creation', models.DateField(auto_now_add=True)),
                ('date_fin', models.DateField()),
                ('etat', models.CharField(choices=[('EN_ATTENTE', 'En attente'), ('EN_COURS', 'En cours'), ('TERMINE', 'Terminé')], default='EN_ATTENTE', max_length=10)),
                ('membres', models.ManyToManyField(related_name='projets', to=settings.AUTH_USER_MODEL)),
                ('proprietaire', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'projets',
            },
        ),
    ]
