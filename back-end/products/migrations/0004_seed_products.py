from django.db import migrations

def seed_products(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    ProductImage = apps.get_model('products', 'ProductImage')
    Category = apps.get_model('categories', 'Category')
    Subcategory = apps.get_model('categories', 'Subcategory')

    # Clear existing to prevent duplicates
    ProductImage.objects.all().delete()
    Product.objects.all().delete()

    products_data = [
        {
            "name": "Classic Black Watch",
            "category_slug": "watches",
            "subcategory_slug": "mens-watches",
            "price": 6999,
            "discount_price": 4999,
            "image": "products/watch1.png",
            "stock": 10
        },
        {
            "name": "Premium Silver Watch",
            "category_slug": "watches",
            "subcategory_slug": "mens-watches",
            "price": 8999,
            "discount_price": 5999,
            "image": "products/watch2.png",
            "stock": 8
        },
        {
            "name": "Sport Black Watch",
            "category_slug": "watches",
            "subcategory_slug": "mens-watches",
            "price": 4999,
            "discount_price": 3999,
            "image": "products/watch3.png",
            "stock": 15
        },
        {
            "name": "Smart Watch Pro",
            "category_slug": "watches",
            "subcategory_slug": "smart-watches",
            "price": 9999,
            "discount_price": 6999,
            "image": "products/watch4.png",
            "stock": 20
        },
        {
            "name": "Rose Gold Series",
            "category_slug": "watches",
            "subcategory_slug": "womens-watches",
            "price": 11999,
            "discount_price": 7999,
            "image": "products/watch5.png",
            "stock": 0
        },
        {
            "name": "Active Fit Watch",
            "category_slug": "watches",
            "subcategory_slug": "smart-watches",
            "price": 3999,
            "discount_price": 2999,
            "image": "products/watch6.png",
            "stock": 12
        },
        {
            "name": "Elite Chronograph",
            "category_slug": "watches",
            "subcategory_slug": "mens-watches",
            "price": 12999,
            "discount_price": 8999,
            "image": "products/watch7.png",
            "stock": 5
        },
        {
            "name": "Titanium Sports Watch",
            "category_slug": "watches",
            "subcategory_slug": "mens-watches",
            "price": 15999,
            "discount_price": 11999,
            "image": "products/watch8.png",
            "stock": 6
        },
        {
            "name": "Minimalist Leather Watch",
            "category_slug": "watches",
            "subcategory_slug": "mens-watches",
            "price": 5999,
            "discount_price": 4599,
            "image": "products/watch9.png",
            "stock": 14
        },
        {
            "name": "Air Comfort Running Shoes",
            "category_slug": "footwear",
            "subcategory_slug": "mens-shoes",
            "price": 4999,
            "discount_price": 3499,
            "image": "products/shoe.svg",
            "stock": 25
        },
        {
            "name": "Urban Street Sneakers",
            "category_slug": "footwear",
            "subcategory_slug": "mens-shoes",
            "price": 5999,
            "discount_price": 4299,
            "image": "products/shoe.svg",
            "stock": 18
        },
        {
            "name": "FlexiFit Trainer Shoes",
            "category_slug": "footwear",
            "subcategory_slug": "mens-shoes",
            "price": 3499,
            "discount_price": 2799,
            "image": "products/shoe.svg",
            "stock": 10
        },
        {
            "name": "Outdoor Hiking Trail Shoes",
            "category_slug": "footwear",
            "subcategory_slug": "mens-shoes",
            "price": 6999,
            "discount_price": 4999,
            "image": "products/shoe.svg",
            "stock": 0
        },
        {
            "name": "BassBlast Air Buds Pro",
            "category_slug": "gadgets",
            "subcategory_slug": "airpods",
            "price": 3999,
            "discount_price": 2499,
            "image": "products/Buds.png",
            "stock": 30
        },
        {
            "name": "ActiveFit Earbuds Lite",
            "category_slug": "gadgets",
            "subcategory_slug": "airpods",
            "price": 2499,
            "discount_price": 1799,
            "image": "products/Buds.png",
            "stock": 22
        },
        {
            "name": "TWS True Wireless Buds",
            "category_slug": "gadgets",
            "subcategory_slug": "airpods",
            "price": 2999,
            "discount_price": 1999,
            "image": "products/Buds.png",
            "stock": 15
        },
        {
            "name": "Classic Athletics Cap",
            "category_slug": "fashion-bags",
            "subcategory_slug": "caps-for-men",
            "price": 999,
            "discount_price": 799,
            "image": "products/cap.png",
            "stock": 40
        },
        {
            "name": "Premium Streetwear Cap",
            "category_slug": "fashion-bags",
            "subcategory_slug": "caps-for-men",
            "price": 1499,
            "discount_price": 1199,
            "image": "products/cap.png",
            "stock": 35
        },
        {
            "name": "Minimalist Snapback",
            "category_slug": "fashion-bags",
            "subcategory_slug": "caps-for-men",
            "price": 1299,
            "discount_price": 999,
            "image": "products/cap.png",
            "stock": 15
        },
        {
            "name": "Comfort Foam Sliders",
            "category_slug": "footwear",
            "subcategory_slug": "sliders",
            "price": 1999,
            "discount_price": 1499,
            "image": "products/shoe.svg",
            "stock": 28
        },
        {
            "name": "Streetwear Sport Sliders",
            "category_slug": "footwear",
            "subcategory_slug": "sliders",
            "price": 2499,
            "discount_price": 1799,
            "image": "products/shoe.svg",
            "stock": 20
        },
        {
            "name": "Watch Silicone Strap Duo",
            "category_slug": "accessories",
            "subcategory_slug": "watch-straps",
            "price": 1499,
            "discount_price": 999,
            "image": "products/watch2.png",
            "stock": 10
        },
        {
            "name": "Smart Watch Charging Dock",
            "category_slug": "accessories",
            "subcategory_slug": "other-accessories",
            "price": 1999,
            "discount_price": 1299,
            "image": "products/watch4.png",
            "stock": 15
        },
        {
            "name": "Earbuds Protective Case",
            "category_slug": "accessories",
            "subcategory_slug": "other-accessories",
            "price": 799,
            "discount_price": 499,
            "image": "products/Buds.png",
            "stock": 50
        }
    ]

    for p_data in products_data:
        cat = Category.objects.get(slug=p_data["category_slug"])
        sub = Subcategory.objects.get(slug=p_data["subcategory_slug"], category=cat)
        
        prod = Product.objects.create(
            name=p_data["name"],
            description=f"Built for everyday use, {p_data['name']} combines dependable comfort, thoughtful details and Moxie's clean, modern style.",
            category=cat,
            subcategory=sub,
            price=p_data["price"],
            discount_price=p_data["discount_price"],
            stock=p_data["stock"],
            is_active=True
        )
        
        ProductImage.objects.create(
            product=prod,
            image=p_data["image"],
            is_primary=True
        )

class Migration(migrations.Migration):
    dependencies = [
        ('products', '0003_product_subcategory'),
        ('categories', '0005_seed_categories_subcategories'),
    ]
    operations = [
        migrations.RunPython(seed_products),
    ]
