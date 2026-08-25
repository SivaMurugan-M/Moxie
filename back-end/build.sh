#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Automatically ensure superuser admin exists on Render database
python manage.py shell -c "from django.contrib.auth.models import User; u, created = User.objects.get_or_create(username='admin', defaults={'email':'admin2026@gmail.com', 'is_staff':True, 'is_superuser':True}); u.set_password('admin123'); u.is_staff=True; u.is_superuser=True; u.save(); print('Superuser admin created/updated successfully')"
