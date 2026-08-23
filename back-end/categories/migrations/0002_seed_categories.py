from django.db import migrations

def seed_categories(apps, schema_editor):
    Category = apps.get_model('categories', 'Category')
    # Delete existing categories to prevent duplicates
    Category.objects.all().delete()
    
    categories = [
        {"name": "Watches", "description": "Latest smart watches and wearables"},
        {"name": "Accessories", "description": "High-quality accessories and add-ons"},
        {"name": "Gadgets", "description": "Modern electronic gadgets and devices"},
        {"name": "Fashion & Bags", "description": "Stylish clothing, bags, and fashion wear"},
        {"name": "Die-Cast Cars", "description": "Detailed scale model vehicles"},
        {"name": "Footwear", "description": "Comfortable and stylish footwear"},
        {"name": "Clothing", "description": "Premium apparel and clothing"},
        {"name": "Electronics & Cameras", "description": "Advanced cameras and electronic items"},
    ]
    for cat in categories:
        Category.objects.create(name=cat["name"], description=cat["description"], is_active=True)

class Migration(migrations.Migration):
    dependencies = [
        ('categories', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(seed_categories),
    ]
