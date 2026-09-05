"""
URL configuration for Moxie project.
"""
import json
from datetime import timedelta
from django.contrib import admin
from django.contrib.admin.views.decorators import staff_member_required
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from django.views.static import serve
from django.shortcuts import redirect, render
from django.db.models import Avg, DecimalField, ExpressionWrapper, F, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone

from django.contrib.auth.models import User
from banners.models import Banner
from categories.models import Category, Subcategory
from products.models import Product, Review
from api.models import AdminProfile, CustomerProfile, Notification, Offer, Order, StoreSettings

# Save original index view
original_index = admin.site.index

def custom_admin_index(request, extra_context=None):
    extra_context = extra_context or {}
    try:
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
    except Exception:
        pass
    
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
    django_logout(request)
    response = redirect('admin:login')
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response

def custom_admin_login(request, extra_context=None):
    from django.contrib.auth.forms import AuthenticationForm
    from django.contrib.auth import login as auth_login

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


# ==============================================================================
# Custom Admin Pages
# ==============================================================================
@staff_member_required(login_url='admin:login')
def custom_admin_offers(request):
    offers = Offer.objects.prefetch_related('applicable_categories', 'applicable_products').all()
    offers_data = []
    for o in offers:
        offers_data.append({
            'id': o.id,
            'name': o.name,
            'title': o.title or '',
            'description': o.description or '',
            'discount_type': o.discount_type,
            'start_date': str(o.start_date) if o.start_date else '',
            'end_date': str(o.end_date) if o.end_date else '',
            'start_datetime': o.start_datetime.isoformat() if o.start_datetime else '',
            'end_datetime': o.end_datetime.isoformat() if o.end_datetime else '',
            'is_active': o.is_active,
            'applicable_categories': [c.id for c in o.applicable_categories.all()],
            'applicable_products': [p.id for p in o.applicable_products.all()],
        })
    products = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
    products_data = []
    for p in products:
        img_url = p.images.first().image.url if p.images.exists() else ''
        products_data.append({
            'id': p.id,
            'name': p.name,
            'price': float(p.price),
            'category_id': p.category.id if p.category else None,
            'category_name': p.category.name if p.category else '',
            'image': img_url,
        })
    categories = Category.objects.filter(is_active=True)
    categories_data = [{'id': c.id, 'name': c.name, 'slug': c.slug} for c in categories]

    context = {
        'total_offers_count': offers.count(),
        'offers_list': json.dumps(offers_data),
        'products_list': json.dumps(products_data),
        'categories_list': json.dumps(categories_data),
        'title': 'Offers',
    }
    return render(request, 'admin/offers.html', context)


@staff_member_required(login_url='admin:login')
def custom_admin_orders(request):
    orders = Order.objects.prefetch_related('items__product').order_by('-created_at')
    orders_list = []
    for o in orders:
        orders_list.append({
            'id': o.id,
            'orderId': f"ORD-{o.id:04d}",
            'customer': {
                'name': o.shipping_name,
                'email': o.user.email if o.user and o.user.email else 'customer@example.com',
                'phone': o.shipping_phone,
                'initial': o.shipping_name[:1].upper() if o.shipping_name else 'C',
            },
            'date': o.created_at.strftime('%d %b %Y') if o.created_at else '',
            'fullDate': o.created_at.strftime('%b %d, %Y %I:%M %p') if o.created_at else '',
            'itemsCount': o.items.count(),
            'totalAmount': float(o.total_amount),
            'paymentStatus': o.payment_status,
            'orderStatus': o.order_status,
            'razorpayOrderId': o.razorpay_order_id or '',
            'razorpayPaymentId': o.razorpay_payment_id or '',
        })
    total_rev = sum(float(o.total_amount) for o in orders if o.payment_status == 'Paid')
    context = {
        'total_orders': orders.count(),
        'pending_orders': orders.filter(order_status='Pending').count(),
        'shipped_orders': orders.filter(order_status='Shipped').count(),
        'delivered_orders': orders.filter(order_status='Delivered').count(),
        'cancelled_orders': orders.filter(order_status='Cancelled').count(),
        'total_revenue': total_rev,
        'orders_list': orders_list,
        'title': 'Orders',
    }
    return render(request, 'admin/orders.html', context)


@staff_member_required(login_url='admin:login')
def custom_admin_customers(request):
    customers = User.objects.filter(is_staff=False).order_by('-date_joined')
    cust_list = []
    total_spent_all = 0.0
    for u in customers:
        user_orders = Order.objects.filter(user=u)
        orders_count = user_orders.count()
        completed_orders = user_orders.filter(order_status='Delivered').count()
        spent = sum(float(o.total_amount) for o in user_orders if o.payment_status == 'Paid')
        total_spent_all += spent
        mobile = ''
        if hasattr(u, 'customer_profile') and u.customer_profile.mobile:
            mobile = u.customer_profile.mobile
        cust_list.append({
            'id': u.id,
            'customerId': f"CUST-{u.id:04d}",
            'name': f"{u.first_name} {u.last_name}".strip() or u.username,
            'username': u.username,
            'email': u.email or 'customer@example.com',
            'mobile': mobile,
            'isActive': u.is_active,
            'lastLogin': u.last_login.strftime('%d %b %Y, %I:%M %p') if u.last_login else 'Never',
            'createdAt': u.date_joined.strftime('%d %b %Y') if u.date_joined else '',
            'orders_count': orders_count,
            'completed_orders_count': completed_orders,
            'total_spent': spent,
            'reviews_count': Review.objects.filter(user=u).count(),
        })
    context = {
        'total_customers_count': customers.count(),
        'active_customers_count': customers.filter(is_active=True).count(),
        'inactive_customers_count': customers.filter(is_active=False).count(),
        'total_spent_all': total_spent_all,
        'customers_list': cust_list,
        'title': 'Customers',
    }
    return render(request, 'admin/customers.html', context)


@staff_member_required(login_url='admin:login')
def custom_admin_users(request):
    staff_users = User.objects.filter(is_staff=True).order_by('-date_joined')
    admins_list = []
    for u in staff_users:
        role = 'Super Admin' if u.is_superuser else 'Staff Admin'
        perms = []
        if hasattr(u, 'admin_profile'):
            role = u.admin_profile.role or role
            perms = u.admin_profile.permissions or []
        admins_list.append({
            'id': u.id,
            'name': f"{u.first_name} {u.last_name}".strip() or u.username,
            'username': u.username,
            'email': u.email,
            'role': role,
            'is_active': u.is_active,
            'is_superuser': u.is_superuser,
            'last_login': u.last_login.strftime('%d %b %Y, %I:%M %p') if u.last_login else 'Never',
            'created_at': u.date_joined.strftime('%d %b %Y') if u.date_joined else '',
            'permissions': perms,
        })
    context = {
        'total_admins_count': staff_users.count(),
        'active_admins_count': staff_users.filter(is_active=True).count(),
        'inactive_admins_count': staff_users.filter(is_active=False).count(),
        'super_admins_count': staff_users.filter(is_superuser=True).count(),
        'admin_users_list': admins_list,
        'current_user_id': request.user.id,
        'title': 'Admin Users',
    }
    return render(request, 'admin/users.html', context)


@staff_member_required(login_url='admin:login')
def custom_admin_settings(request):
    u = request.user
    mobile = ''
    profile_img = ''
    if hasattr(u, 'admin_profile'):
        mobile = u.admin_profile.phone or ''
        if u.admin_profile.profile_image:
            profile_img = u.admin_profile.profile_image.url
    admin_info = {
        'id': u.id,
        'firstName': u.first_name or '',
        'lastName': u.last_name or '',
        'fullName': f"{u.first_name} {u.last_name}".strip() or u.username,
        'email': u.email or '',
        'username': u.username,
        'mobile': mobile,
        'profileImage': profile_img,
        'dateJoined': u.date_joined.strftime('%d %b %Y') if u.date_joined else '',
        'lastLogin': u.last_login.strftime('%d %b %Y, %I:%M %p') if u.last_login else 'Never',
        'isSuperuser': u.is_superuser,
    }
    context = {
        'admin_info': admin_info,
        'title': 'Settings',
    }
    return render(request, 'admin/settings.html', context)


@staff_member_required(login_url='admin:login')
def custom_admin_profile(request):
    u = request.user
    mobile = ''
    profile_img = ''
    role = 'Super Admin' if u.is_superuser else 'Staff Admin'
    if hasattr(u, 'admin_profile'):
        mobile = u.admin_profile.phone or ''
        role = u.admin_profile.role or role
        if u.admin_profile.profile_image:
            profile_img = u.admin_profile.profile_image.url
    admin_info = {
        'id': u.id,
        'firstName': u.first_name or '',
        'lastName': u.last_name or '',
        'fullName': f"{u.first_name} {u.last_name}".strip() or u.username,
        'email': u.email or '',
        'username': u.username,
        'mobile': mobile,
        'role': role,
        'profileImage': profile_img,
        'dateJoined': u.date_joined.strftime('%d %b %Y') if u.date_joined else '',
        'lastLogin': u.last_login.strftime('%d %b %Y, %I:%M %p') if u.last_login else 'Never',
        'isActive': u.is_active,
        'isSuperuser': u.is_superuser,
    }
    context = {
        'admin_info': admin_info,
        'title': 'My Profile',
    }
    return render(request, 'admin/profile.html', context)


@staff_member_required(login_url='admin:login')
def custom_admin_messages(request):
    context = {
        'title': 'Messages & Notifications',
    }
    return render(request, 'admin/messages.html', context)


urlpatterns = [
    path('admin/login/', custom_admin_login, name='custom_admin_login'),
    path('admin/logout/', custom_logout, name='custom_logout'),
    path('admin/offers/', custom_admin_offers, name='custom_admin_offers'),
    path('admin/orders/', custom_admin_orders, name='custom_admin_orders'),
    path('admin/customers/', custom_admin_customers, name='custom_admin_customers'),
    path('admin/users/', custom_admin_users, name='custom_admin_users'),
    path('admin/settings/', custom_admin_settings, name='custom_admin_settings'),
    path('admin/profile/', custom_admin_profile, name='custom_admin_profile'),
    path('admin/messages/', custom_admin_messages, name='custom_admin_messages'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
