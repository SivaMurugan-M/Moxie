"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from django.db.models import DecimalField, ExpressionWrapper, F, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta

# Save original index view
original_index = admin.site.index

def custom_admin_index(request, extra_context=None):
    from django.contrib.auth.models import User
    from products.models import Product, Review
    from categories.models import Category
    from banners.models import Banner

    extra_context = extra_context or {}
    products = Product.objects.select_related('category').prefetch_related('images')
    inventory_expression = ExpressionWrapper(
        F('price') * F('stock'),
        output_field=DecimalField(max_digits=16, decimal_places=2),
    )
    inventory_value = products.aggregate(
        total=Coalesce(
            Sum(inventory_expression),
            0,
            output_field=DecimalField(max_digits=16, decimal_places=2),
        )
    )['total']

    today = timezone.localdate()
    activity = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        activity.append({
            'label': day.strftime('%a'),
            'value': products.filter(created_at__date=day).count(),
        })
    max_activity = max([point['value'] for point in activity] + [1])
    for point in activity:
        point['height'] = 16 + round((point['value'] / max_activity) * 74)

    category_stats = list(
        Category.objects.annotate(product_count=Sum('products__stock'))
        .order_by('-product_count', 'name')[:4]
    )
    category_total_stock = sum((item.product_count or 0) for item in category_stats) or 1
    for item in category_stats:
        item.share = round(((item.product_count or 0) / category_total_stock) * 100)

    stock_total = products.count() or 1
    in_stock = products.filter(stock__gt=10).count()
    low_stock = products.filter(stock__gt=0, stock__lte=10).count()
    out_of_stock = products.filter(stock=0).count()

    extra_context.update({
        'total_users': User.objects.count(),
        'total_products': products.count(),
        'total_categories': Category.objects.count(),
        'total_banners': Banner.objects.count(),
        'total_reviews': Review.objects.count(),
        'inventory_value': inventory_value,
        'active_products': products.filter(is_active=True).count(),
        'top_products': products.order_by('-stock', '-created_at')[:4],
        'recent_products': products.order_by('-created_at')[:5],
        'catalog_activity': activity,
        'category_stats': category_stats,
        'category_total_stock': category_total_stock,
        'in_stock': in_stock,
        'low_stock': low_stock,
        'out_of_stock': out_of_stock,
        'in_stock_percent': round((in_stock / stock_total) * 100),
        'low_stock_percent': round((low_stock / stock_total) * 100),
        'out_of_stock_percent': round((out_of_stock / stock_total) * 100),
        'dashboard_date': today,
    })
    
    response = original_index(request, extra_context=extra_context)
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response

admin.site.index = custom_admin_index

# Custom branding for Django Admin
admin.site.site_header = "Moxie Admin Portal"
admin.site.site_title = "Moxie Admin Portal"
admin.site.index_title = "Welcome to Moxie Admin Portal"

def custom_logout(request):
    from django.contrib.auth import logout as django_logout
    from django.shortcuts import redirect
    django_logout(request)
    response = redirect('admin:login')
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response

def custom_admin_login(request, extra_context=None):
    from django.contrib.auth.forms import AuthenticationForm
    from django.contrib.auth import login as auth_login
    from django.shortcuts import redirect, render

    if request.user.is_authenticated and request.user.is_staff:
        response = redirect('/admin/')
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        return response

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user.is_staff:
                auth_login(request, user)
                response = redirect('/admin/')
                response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
                return response
            else:
                form.add_error(None, "You do not have staff permissions to access the admin portal.")
    else:
        form = AuthenticationForm(request)

    context = {
        'form': form,
        'app_path': request.get_full_path(),
        'username': request.user.get_username() if request.user.is_authenticated else '',
        'title': 'Log in',
    }
    if extra_context:
        context.update(extra_context)

    response = render(request, 'admin/login.html', context)
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response



urlpatterns = [
    path('admin/login/', custom_admin_login, name='custom_admin_login'),
    path('admin/logout/', custom_logout, name='custom_logout'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]



if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
