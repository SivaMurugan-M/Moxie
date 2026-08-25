from django.urls import path

from .views import (
    BannerListView,
    CategoryListView,
    ProductListView,
    ReviewListView,
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView,
    RazorpayWebhookView,
    AdminCheckAuthView,
    AdminApiLoginView,
    AdminApiLogoutView,
)


urlpatterns = [
    path(
        'admin/check-auth/',
        AdminCheckAuthView.as_view(),
        name='admin-api-check-auth'
    ),
    path(
        'admin/login/',
        AdminApiLoginView.as_view(),
        name='admin-api-login'
    ),
    path(
        'admin/logout/',
        AdminApiLogoutView.as_view(),
        name='admin-api-logout'
    ),
    path(
        'categories/',
        CategoryListView.as_view(),
        name='category-list'
    ),

    path(
        'products/',
        ProductListView.as_view(),
        name='product-list'
    ),

    path(
        'banners/',
        BannerListView.as_view(),
        name='banner-list'
    ),

    path(
        'reviews/',
        ReviewListView.as_view(),
        name='review-list'
    ),

    path(
        'payment/order/create/',
        CreateRazorpayOrderView.as_view(),
        name='payment-order-create'
    ),

    path(
        'payment/verify/',
        VerifyRazorpayPaymentView.as_view(),
        name='payment-verify'
    ),

    path(
        'payment/webhook/',
        RazorpayWebhookView.as_view(),
        name='payment-webhook'
    ),
]