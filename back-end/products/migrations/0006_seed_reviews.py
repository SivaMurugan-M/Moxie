from django.db import migrations

def seed_reviews(apps, schema_editor):
    Review = apps.get_model('products', 'Review')

    # Clear existing to prevent duplicates
    Review.objects.all().delete()

    reviews_data = [
        {
            "id": 1,
            "name": "Kavin",
            "rating": 4.5,
            "image": "reviews/profile1.png",
            "text": "Buying our first home felt overwhelming, but the entire process was handled professionally. Every question was answered promptly, and we found the perfect home within our budget!."
        },
        {
            "id": 2,
            "name": "Vishnu",
            "rating": 5.0,
            "image": "reviews/profile2.png",
            "text": "Their market knowledge and investment advice helped us make the right decision. We received excellent support from property selection to registration and we found the perfect home within our budget!."
        },
        {
            "id": 3,
            "name": "Ganesh",
            "rating": 4.5,
            "image": "reviews/profile3.png",
            "text": "Buying our first home felt overwhelming, but the entire process was handled professionally. Every question was answered promptly, and we found the perfect home within our budget!."
        },
        {
            "id": 4,
            "name": "Ananya Sharma",
            "rating": 5.0,
            "image": "reviews/profile1.png",
            "text": "I am absolutely thrilled with the product! The design is extremely sleek, and it exceeded my expectations in every way. The support team was also incredibly helpful throughout."
        },
        {
            "id": 5,
            "name": "Harish",
            "rating": 4.5,
            "image": "reviews/profile3.png",
            "text": "Top-notch build quality and excellent value for money. The delivery was fast, and the packaging was excellent. I will definitely be a returning customer."
        }
    ]

    for r_data in reviews_data:
        Review.objects.create(
            id=r_data["id"],
            name=r_data["name"],
            rating=r_data["rating"],
            image=r_data["image"],
            text=r_data["text"],
            is_active=True
        )

class Migration(migrations.Migration):
    dependencies = [
        ('products', '0005_review'),
    ]
    operations = [
        migrations.RunPython(seed_reviews),
    ]
