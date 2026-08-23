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