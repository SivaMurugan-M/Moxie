from django.contrib import admin
from .models import Category, Subcategory


class SubcategoryInline(admin.TabularInline):
    model = Subcategory
    extra = 1
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'slug',
        'is_active',
        'created_at',
        'updated_at',
    )

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        categories = Category.objects.all()
        subcategories = Subcategory.objects.all()
        extra_context['total_categories_count'] = categories.count()
        extra_context['active_categories_count'] = categories.filter(is_active=True).count()
        extra_context['inactive_categories_count'] = categories.filter(is_active=False).count()
        extra_context['total_subcategories_count'] = subcategories.count()
        return super().changelist_view(request, extra_context=extra_context)

    prepopulated_fields = {'slug': ('name',)}

    list_filter = (
        'is_active',
    )

    search_fields = (
        'name',
        'description',
    )

    inlines = [SubcategoryInline]


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'slug',
        'category',
        'is_active',
        'created_at',
    )

    prepopulated_fields = {'slug': ('name',)}

    list_filter = (
        'category',
        'is_active',
    )

    search_fields = (
        'name',
        'description',
    )