from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'shipping_name', 'total_amount', 'payment_status', 'razorpay_order_id', 'created_at')
    list_filter = ('payment_status', 'created_at')
    search_fields = ('shipping_name', 'shipping_phone', 'razorpay_order_id', 'razorpay_payment_id')
    inlines = [OrderItemInline]
    readonly_fields = ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')
