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

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        banners = Banner.objects.all()
        extra_context['total_banners_count'] = banners.count()
        extra_context['active_banners_count'] = banners.filter(is_active=True).count()
        extra_context['inactive_banners_count'] = banners.filter(is_active=False).count()
        return super().changelist_view(request, extra_context=extra_context)

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