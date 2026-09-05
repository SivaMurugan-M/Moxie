from django.contrib import admin

from .models import Product, ProductImage, Review


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    max_num = 3



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
    ]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'rating',
        'is_active',
        'created_at',
    )

    list_filter = (
        'rating',
        'is_active',
    )

    search_fields = (
        'name',
        'text',
    )

