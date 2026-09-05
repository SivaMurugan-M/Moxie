from django.urls import path

from .views import (
    AdminApiLoginView,
    AdminApiLogoutView,
    AdminChangePasswordView,
    AdminCheckAuthView,
    AdminCustomerDeleteView,
    AdminCustomersView,
    AdminCustomerStatusView,
    AdminDashboardAnalyticsView,
    AdminDashboardSalesView,
    AdminForgotPasswordView,
    AdminNotificationDeleteView,
    AdminNotificationMarkAllReadView,
    AdminNotificationReadView,
    AdminNotificationsView,
    AdminOfferDetailView,
    AdminOffersView,
    AdminOrderDetailView,
    AdminOrdersView,
    AdminProfileSettingsView,
    AdminResetPasswordView,
    AdminSettingsView,
    AdminTestEmailView,
    AdminUserDetailView,
    AdminUsersView,
    AdminUserToggleActiveView,
    AdminVerifyResetCodeView,
    BannerDetailView,
    BannerListView,
    CategoryDetailView,
    CategoryListView,
    CreateRazorpayOrderView,
    HealthCheckView,
    ProductDetailView,
    ProductListView,
    ProductVariantDetailView,
    RazorpayWebhookView,
    ReviewDetailView,
    ReviewListView,
    SubcategoryDetailView,
    SubcategoryListCreateView,
    VerifyRazorpayPaymentView,
)

urlpatterns = [
    # Health Check
    path('health/', HealthCheckView.as_view(), name='health-check'),

    # Admin Authentication
    path('admin/check-auth/', AdminCheckAuthView.as_view(), name='admin-api-check-auth'),
    path('admin/login/', AdminApiLoginView.as_view(), name='admin-api-login'),
    path('admin/logout/', AdminApiLogoutView.as_view(), name='admin-api-logout'),

    # Categories & Subcategories
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('subcategories/', SubcategoryListCreateView.as_view(), name='subcategory-list'),
    path('subcategories/<int:pk>/', SubcategoryDetailView.as_view(), name='subcategory-detail'),

    # Products & Variants
    path('products/', ProductListView.as_view(), name='product-list'),
    path('admin/products/', ProductListView.as_view(), name='admin-product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('variants/<int:pk>/', ProductVariantDetailView.as_view(), name='variant-detail'),

    # Banners
    path('banners/', BannerListView.as_view(), name='banner-list'),
    path('banners/<int:pk>/', BannerDetailView.as_view(), name='banner-detail'),

    # Reviews
    path('reviews/', ReviewListView.as_view(), name='review-list'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),

    # Payments & Razorpay
    path('payment/order/create/', CreateRazorpayOrderView.as_view(), name='payment-order-create'),
    path('payment/verify/', VerifyRazorpayPaymentView.as_view(), name='payment-verify'),
    path('payment/webhook/', RazorpayWebhookView.as_view(), name='payment-webhook'),

    # Admin Notifications / Messages
    path('notifications/', AdminNotificationsView.as_view(), name='admin-notifications'),
    path('notifications/<int:pk>/read/', AdminNotificationReadView.as_view(), name='admin-notification-read'),
    path('notifications/mark-all-read/', AdminNotificationMarkAllReadView.as_view(), name='admin-notification-mark-all-read'),
    path('notifications/<int:pk>/delete/', AdminNotificationDeleteView.as_view(), name='admin-notification-delete'),

    # Admin Offers
    path('offers/', AdminOffersView.as_view(), name='admin-offers'),
    path('offers/<int:pk>/', AdminOfferDetailView.as_view(), name='admin-offer-detail'),

    # Admin Orders
    path('admin-orders/', AdminOrdersView.as_view(), name='admin-orders'),
    path('admin-orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),

    # Admin Customers
    path('customers/', AdminCustomersView.as_view(), name='admin-customers'),
    path('customers/<int:pk>/status/', AdminCustomerStatusView.as_view(), name='admin-customer-status'),
    path('customers/<int:pk>/delete/', AdminCustomerDeleteView.as_view(), name='admin-customer-delete'),

    # Admin Users
    path('admin-users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin-users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin-users/<int:pk>/toggle-active/', AdminUserToggleActiveView.as_view(), name='admin-user-toggle-active'),

    # Admin Settings & Profile
    path('admin-settings/', AdminSettingsView.as_view(), name='admin-settings'),
    path('admin-settings/profile/', AdminProfileSettingsView.as_view(), name='admin-profile-settings'),
    path('admin-settings/change-password/', AdminChangePasswordView.as_view(), name='admin-change-password'),
    path('admin-settings/test-email/', AdminTestEmailView.as_view(), name='admin-test-email'),
    path('admin-settings/forgot-password/', AdminForgotPasswordView.as_view(), name='admin-forgot-password'),
    path('admin-settings/verify-reset-code/', AdminVerifyResetCodeView.as_view(), name='admin-verify-reset-code'),
    path('admin-settings/reset-password/', AdminResetPasswordView.as_view(), name='admin-reset-password'),

    # Admin Dashboard
    path('admin-dashboard/analytics/', AdminDashboardAnalyticsView.as_view(), name='admin-dashboard-analytics'),
    path('admin-dashboard/sales/', AdminDashboardSalesView.as_view(), name='admin-dashboard-sales'),
]