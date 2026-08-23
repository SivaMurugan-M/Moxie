from django.db import migrations

def seed_banners(apps, schema_editor):
    Banner = apps.get_model('banners', 'Banner')
    # Clear existing to prevent duplicates
    Banner.objects.all().delete()

    banners = [
        {
            "title": "UPGRADE YOUR STYLE SHOP THE LATEST",
            "subtitle": "TRENDING TECH",
            "image": "banners/banner2.png",
            "button_text": "Shop Now",
            "button_link": "/products/watches",
            "display_order": 1
        },
        {
            "title": "UPGRADE YOUR STYLE SHOP THE LATEST",
            "subtitle": "TRENDING TECH",
            "image": "banners/banner2.png",
            "button_text": "Shop Now",
            "button_link": "/products/watches",
            "display_order": 2
        },
        {
            "title": "PREMIUM TECH. BETTER LIFESTYLE.",
            "subtitle": "EXCLUSIVE OFFER",
            "image": "banners/banner2.png",
            "button_text": "Explore Deals",
            "button_link": "/products/deals",
            "display_order": 3
        },
        {
            "title": "PRODUCTS YOU'LL LOVE BEST QUALITY",
            "subtitle": "DISCOVER MORE",
            "image": "banners/banner2.png",
            "button_text": "Explore Now",
            "button_link": "/products/accessories",
            "display_order": 4
        }
    ]

    for b in banners:
        Banner.objects.create(
            title=b["title"],
            subtitle=b["subtitle"],
            image=b["image"],
            button_text=b["button_text"],
            button_link=b["button_link"],
            display_order=b["display_order"],
            is_active=True
        )

class Migration(migrations.Migration):
    dependencies = [
        ('banners', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(seed_banners),
    ]
