from django.contrib import admin
from categories.models import Category
from django.db.models import Avg
from .models import Product, ProductImage, ProductVariant, VariantImage, Review


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    max_num = 3


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'category',
        'subcategory',
        'price',
        'discount_price',
        'stock',
        'is_active',
        'created_at',
    )

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        products = Product.objects.all()
        extra_context['total_products_count'] = products.count()
        extra_context['active_products_count'] = products.filter(is_active=True).count()
        extra_context['out_of_stock_count'] = products.filter(stock=0).count()
        extra_context['total_inventory_value'] = sum(p.price * p.stock for p in products)
        extra_context['categories_list'] = Category.objects.all()
        return super().changelist_view(request, extra_context=extra_context)

    list_filter = (
        'category',
        'subcategory',
        'is_active',
    )

    search_fields = (
        'name',
        'description',
    )

    inlines = [
        ProductImageInline,
        ProductVariantInline,
    ]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'rating',
        'status',
        'is_active',
        'created_at',
    )

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        reviews = Review.objects.all()
        extra_context['total_reviews_count'] = reviews.count()
        extra_context['pending_reviews_count'] = reviews.filter(status='Pending').count()
        extra_context['approved_reviews_count'] = reviews.filter(status='Approved').count()
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 5.0
        extra_context['avg_rating_value'] = round(float(avg_rating), 1)
        extra_context['products_list'] = Product.objects.all()
        return super().changelist_view(request, extra_context=extra_context)

    list_filter = (
        'rating',
        'status',
        'is_active',
    )

    search_fields = (
        'name',
        'text',
        'email',
    )


