from api.models import get_user_admin_permissions

def admin_permissions_context(request):
    """
    Context processor providing granted admin permissions for template rendering.
    """
    if hasattr(request, 'user') and request.user.is_authenticated and request.user.is_staff and request.user.is_active:
        perms = get_user_admin_permissions(request.user)
        is_super = request.user.is_superuser
        return {
            'user_admin_permissions': perms,
            'is_superuser': is_super,
            'has_perm_dashboard': is_super or 'Dashboard' in perms,
            'has_perm_products': is_super or 'Products' in perms,
            'has_perm_categories': is_super or 'Categories' in perms,
            'has_perm_offers': is_super or 'Offers' in perms,
            'has_perm_banners': is_super or 'Banners' in perms,
            'has_perm_messages': is_super or 'Messages' in perms,
            'has_perm_reviews': is_super or 'Reviews' in perms,
            'has_perm_admin_users': is_super or 'Admin Users' in perms,
            'has_perm_customers': is_super or 'Customers' in perms,
            'has_perm_orders': is_super or 'Orders' in perms,
            'has_perm_settings': is_super or 'Settings' in perms,
        }
    return {
        'user_admin_permissions': [],
        'is_superuser': False,
    }
