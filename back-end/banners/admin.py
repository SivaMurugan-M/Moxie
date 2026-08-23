from django.contrib import admin
from .models import Banner


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'display_order',
        'is_active',
        'created_at',
        'updated_at',
    )

    list_filter = (
        'is_active',
    )

    search_fields = (
        'title',
        'subtitle',
    )

    ordering = (
        'display_order',
        '-created_at',
    )