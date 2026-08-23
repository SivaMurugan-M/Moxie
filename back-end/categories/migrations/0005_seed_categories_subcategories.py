from django.db import migrations

def seed_categories_and_subcategories(apps, schema_editor):
    Category = apps.get_model('categories', 'Category')
    Subcategory = apps.get_model('categories', 'Subcategory')

    # Clear existing to prevent duplicates
    Subcategory.objects.all().delete()
    Category.objects.all().delete()

    data = [
        {
            "name": "Watches",
            "slug": "watches",
            "description": "Latest watches and wearables",
            "subcategories": [
                { "name": "Smart Watches", "slug": "smart-watches" },
                { "name": "Men's Watches", "slug": "mens-watches" },
                { "name": "Women's Watches", "slug": "womens-watches" },
                { "name": "Kids Watches", "slug": "kids-watches" }
            ]
        },
        {
            "name": "Accessories",
            "slug": "accessories",
            "description": "High-quality accessories and add-ons",
            "subcategories": [
                { "name": "Headphones", "slug": "headphones" },
                { "name": "Bluetooth Speakers", "slug": "bluetooth-speakers" },
                { "name": "Neckbands", "slug": "neckbands" },
                { "name": "Pendrives", "slug": "pendrives" },
                { "name": "Memory Cards", "slug": "memory-cards" },
                { "name": "Card Readers", "slug": "card-readers" },
                { "name": "iPhone Charger Covers", "slug": "iphone-charger-covers" },
                { "name": "Watch Straps", "slug": "watch-straps" },
                { "name": "Other Accessories", "slug": "other-accessories" }
            ]
        },
        {
            "name": "Gadgets",
            "slug": "gadgets",
            "description": "Modern electronic gadgets and devices",
            "subcategories": [
                { "name": "AirPods", "slug": "airpods" },
                { "name": "Boom Headphones", "slug": "boom-headphones" },
                { "name": "Chargers", "slug": "chargers" },
                { "name": "Other Gadgets", "slug": "other-gadgets" }
            ]
        },
        {
            "name": "Fashion & Bags",
            "slug": "fashion-bags",
            "description": "Stylish clothing, bags, and fashion wear",
            "subcategories": [
                { "name": "Handbags", "slug": "handbags" },
                { "name": "Wallets", "slug": "wallets" },
                { "name": "Men's Belts", "slug": "mens-belts" },
                { "name": "Kids Belts", "slug": "kids-belts" },
                { "name": "Caps for Men", "slug": "caps-for-men" },
                { "name": "Caps for Kids", "slug": "caps-for-kids" }
            ]
        },
        {
            "name": "Die-Cast Cars",
            "slug": "die-cast-cars",
            "description": "Detailed scale model vehicles",
            "subcategories": [
                { "name": "Die-Cast Cars", "slug": "die-cast-cars" }
            ]
        },
        {
            "name": "Footwear",
            "slug": "footwear",
            "description": "Comfortable and stylish footwear",
            "subcategories": [
                { "name": "Men's Shoes", "slug": "mens-shoes" },
                { "name": "Women's Shoes", "slug": "womens-shoes" },
                { "name": "Men's Slippers", "slug": "mens-slippers" },
                { "name": "Women's Slippers", "slug": "womens-slippers" },
                { "name": "Sliders", "slug": "sliders" }
            ]
        },
        {
            "name": "Clothing",
            "slug": "clothing",
            "description": "Premium apparel and clothing",
            "subcategories": [
                { "name": "Men's T-Shirts", "slug": "mens-t-shirts" }
            ]
        },
        {
            "name": "Electronics & Cameras",
            "slug": "electronics-cameras",
            "description": "Advanced cameras and electronic items",
            "subcategories": [
                { "name": "Drone Cameras", "slug": "drone-cameras" }
            ]
        }
    ]

    for cat_data in data:
        cat = Category.objects.create(
            name=cat_data["name"],
            slug=cat_data["slug"],
            description=cat_data["description"],
            is_active=True
        )
        for sub_data in cat_data["subcategories"]:
            Subcategory.objects.create(
                category=cat,
                name=sub_data["name"],
                slug=sub_data["slug"],
                description=sub_data.get("description", ""),
                is_active=True
            )

class Migration(migrations.Migration):
    dependencies = [
        ('categories', '0004_category_slug_subcategory'),
    ]
    operations = [
        migrations.RunPython(seed_categories_and_subcategories),
    ]
