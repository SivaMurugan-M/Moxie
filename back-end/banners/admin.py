from django.contrib import admin
from django.db.models import Sum
from api.permissions_utils import has_admin_permission
from .models import Banner


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    def has_module_permission(self, request):
        return has_admin_permission(request.user, 'banners')

    def has_view_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'banners')

    def has_add_permission(self, request):
        return has_admin_permission(request.user, 'banners')

    def has_change_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'banners')

    def has_delete_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'banners')

    list_display = (
        'title',
        'display_order',
        'click_count',
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
        extra_context['total_clicks_count'] = banners.aggregate(total=Sum('click_count'))['total'] or 0
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