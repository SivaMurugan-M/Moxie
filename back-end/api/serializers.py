from rest_framework import serializers

from banners.models import Banner
from categories.models import Category, Subcategory
from products.models import Product, ProductImage, Review


class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'is_active',
        ]


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'is_active',
            'subcategories',
            'created_at',
            'updated_at',
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            'id',
            'image',
            'is_primary',
        ]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(
        many=True,
        read_only=True
    )

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    category_slug = serializers.CharField(
        source='category.slug',
        read_only=True
    )

    subcategory_name = serializers.CharField(
        source='subcategory.name',
        read_only=True
    )

    subcategory_slug = serializers.CharField(
        source='subcategory.slug',
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'category',
            'category_name',
            'category_slug',
            'subcategory',
            'subcategory_name',
            'subcategory_slug',
            'price',
            'discount_price',
            'stock',
            'is_active',
            'images',
            'created_at',
            'updated_at',
        ]


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = [
            'id',
            'title',
            'subtitle',
            'image',
            'button_text',
            'button_link',
            'display_order',
            'is_active',
            'created_at',
            'updated_at',
        ]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id',
            'name',
            'rating',
            'image',
            'text',
            'is_active',
            'created_at',
        ]


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    shipping_name = serializers.CharField(max_length=255)
    shipping_phone = serializers.CharField(max_length=20)
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(max_length=100)
    shipping_pincode = serializers.CharField(max_length=20)
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        for item in value:
            try:
                prod = Product.objects.get(id=item['product_id'], is_active=True)
                if prod.stock < item['quantity']:
                    raise serializers.ValidationError(f"Insufficient stock for product: {prod.name}")
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with id {item['product_id']} does not exist.")
        return value