import json
import uuid
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Avg, DecimalField, ExpressionWrapper, F, Q, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from banners.models import Banner
from categories.models import Category, Subcategory
from products.models import Product, ProductImage, ProductVariant, Review, VariantImage

from .models import (
    AdminPasswordResetOTP,
    AdminPasswordResetToken,
    AdminProfile,
    CustomerProfile,
    Notification,
    Offer,
    Order,
    OrderItem,
    StoreSettings,
)
from .razorpay_service import RazorpayService
from .serializers import (
    BannerSerializer,
    CategorySerializer,
    OrderCreateSerializer,
    ProductSerializer,
    ReviewSerializer,
    SubcategorySerializer,
)


# ==============================================================================
# Health Check
# ==============================================================================
class HealthCheckView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)


# ==============================================================================
# Categories & Subcategories
# ==============================================================================
class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Category.objects.all().order_by('-id')
        return Category.objects.filter(is_active=True).order_by('name')


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SubcategoryListCreateView(generics.ListCreateAPIView):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer

    def get_queryset(self):
        cat_id = self.request.query_params.get('category_id')
        if cat_id:
            return Subcategory.objects.filter(category_id=cat_id)
        return Subcategory.objects.all().order_by('-id')


class SubcategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer


# ==============================================================================
# Products & Variants
# ==============================================================================
class ProductListView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Product.objects.all().select_related('category', 'subcategory').prefetch_related('images', 'variants__images').order_by('-created_at')
        return Product.objects.filter(is_active=True).select_related('category', 'subcategory').prefetch_related('images', 'variants__images').order_by('-created_at')


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductVariantDetailView(APIView):
    def patch(self, request, pk):
        try:
            variant = ProductVariant.objects.get(pk=pk)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'Variant not found'}, status=status.HTTP_404_NOT_FOUND)

        for field in ['color_name', 'color_code', 'price', 'discount_price', 'stock', 'is_active', 'sizes']:
            if field in request.data:
                setattr(variant, field, request.data[field])
        variant.save()
        return Response({'success': True, 'id': variant.id}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            variant = ProductVariant.objects.get(pk=pk)
            variant.delete()
            return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'Variant not found'}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# Banners
# ==============================================================================
class BannerListView(generics.ListCreateAPIView):
    serializer_class = BannerSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Banner.objects.all().order_by('display_order', '-created_at')
        return Banner.objects.filter(is_active=True).order_by('display_order', '-created_at')


class BannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer


# ==============================================================================
# Reviews
# ==============================================================================
class ReviewListView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Review.objects.all().order_by('-created_at')
        return Review.objects.filter(is_active=True, status='Approved').order_by('-created_at')


class ReviewDetailView(APIView):
    def patch(self, request, pk):
        try:
            rev = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'status' in request.data:
            rev.status = request.data['status']
        if 'is_active' in request.data:
            rev.is_active = bool(request.data['is_active'])
        rev.save()
        return Response({'success': True, 'status': rev.status, 'is_active': rev.is_active})

    def delete(self, request, pk):
        try:
            rev = Review.objects.get(pk=pk)
            rev.delete()
            return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# Razorpay Checkout & Webhooks
# ==============================================================================
class CreateRazorpayOrderView(APIView):
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        items_data = data['items']

        with transaction.atomic():
            subtotal = 0
            total_quantity = 0
            order_items_to_create = []

            for item in items_data:
                product = Product.objects.get(id=item['product_id'])
                price = product.discount_price if product.discount_price is not None else product.price
                subtotal += price * item['quantity']
                total_quantity += item['quantity']
                order_items_to_create.append({
                    'product': product,
                    'quantity': item['quantity'],
                    'price': price
                })

            delivery_fee = total_quantity * 100
            total_amount = subtotal + delivery_fee
            amount_in_paise = int(total_amount * 100)

            rzp_service = RazorpayService()
            try:
                receipt_id = f"mox_{uuid.uuid4().hex[:10]}"
                rzp_order = rzp_service.create_order(
                    amount_in_paise=amount_in_paise,
                    receipt_id=receipt_id
                )
            except Exception as e:
                return Response(
                    {'error': f"Payment provider order creation failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                shipping_name=data['shipping_name'],
                shipping_phone=data['shipping_phone'],
                shipping_address=data['shipping_address'],
                shipping_city=data['shipping_city'],
                shipping_pincode=data['shipping_pincode'],
                total_amount=total_amount,
                payment_status='Pending',
                order_status='Pending',
                razorpay_order_id=rzp_order['id']
            )

            for item_info in order_items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product=item_info['product'],
                    quantity=item_info['quantity'],
                    price=item_info['price']
                )

            # Create Notification
            try:
                Notification.objects.create(
                    title=f"New Order #{order.id}",
                    sender=order.shipping_name,
                    sender_initial=order.shipping_name[:1].upper() if order.shipping_name else 'C',
                    body=f"New order placed for ₹{order.total_amount:.2f}",
                    notification_type='order',
                    order=order,
                    user=order.user,
                    target_url='/admin/orders/'
                )
            except Exception:
                pass

        return Response({
            'razorpay_order_id': order.razorpay_order_id,
            'razorpay_key_id': settings.RAZORPAY_KEY_ID,
            'amount': amount_in_paise,
            'currency': 'INR'
        }, status=status.HTTP_201_CREATED)


class VerifyRazorpayPaymentView(APIView):
    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {'error': 'Missing required payment verification fields.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found for the provided Razorpay order ID.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if order.payment_status == 'Paid':
            return Response({
                'message': 'Payment already verified and captured.',
                'order_id': order.id
            }, status=status.HTTP_200_OK)

        rzp_service = RazorpayService()
        is_valid = rzp_service.verify_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature
        )

        if not is_valid:
            order.payment_status = 'Failed'
            order.save()
            return Response(
                {'error': 'Signature verification failed. Potential tampering detected.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order.payment_status = 'Paid'
            order.order_status = 'Confirmed'
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.save()

            if not order.stock_decremented:
                for item in order.items.all():
                    if item.product:
                        item.product.stock = max(0, item.product.stock - item.quantity)
                        item.product.save()
                    if item.variant:
                        item.variant.stock = max(0, item.variant.stock - item.quantity)
                        item.variant.save()
                order.stock_decremented = True
                order.save()

        return Response({
            'message': 'Payment signature verified successfully.',
            'order_id': order.id
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature') or request.META.get('HTTP_X_RAZORPAY_SIGNATURE')
        if not signature:
            return Response({'error': 'Webhook signature header missing.'}, status=status.HTTP_400_BAD_REQUEST)

        body_str = request.body.decode('utf-8')
        rzp_service = RazorpayService()
        is_valid = rzp_service.verify_webhook_signature(
            body_str=body_str,
            signature=signature,
            secret=settings.RAZORPAY_WEBHOOK_SECRET
        )

        if not is_valid:
            return Response({'error': 'Webhook signature verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

        event = request.data.get('event')
        payload = request.data.get('payload', {})

        if event in ('payment.captured', 'order.paid'):
            payment_entity = payload.get('payment', {}).get('entity', {})
            order_entity = payload.get('order', {}).get('entity', {})
            rzp_order_id = order_entity.get('id') or payment_entity.get('order_id')
            rzp_payment_id = payment_entity.get('id')

            if rzp_order_id:
                try:
                    order = Order.objects.get(razorpay_order_id=rzp_order_id)
                    if order.payment_status != 'Paid':
                        with transaction.atomic():
                            order.payment_status = 'Paid'
                            order.order_status = 'Confirmed'
                            if rzp_payment_id:
                                order.razorpay_payment_id = rzp_payment_id
                            order.save()

                            if not order.stock_decremented:
                                for item in order.items.all():
                                    if item.product:
                                        item.product.stock = max(0, item.product.stock - item.quantity)
                                        item.product.save()
                                    if item.variant:
                                        item.variant.stock = max(0, item.variant.stock - item.quantity)
                                        item.variant.save()
                                order.stock_decremented = True
                                order.save()
                except Order.DoesNotExist:
                    pass

        elif event == 'payment.failed':
            payment_entity = payload.get('payment', {}).get('entity', {})
            rzp_order_id = payment_entity.get('order_id')
            if rzp_order_id:
                try:
                    order = Order.objects.get(razorpay_order_id=rzp_order_id)
                    if order.payment_status == 'Pending':
                        order.payment_status = 'Failed'
                        order.save()
                except Order.DoesNotExist:
                    pass

        return Response({'status': 'Webhook processed successfully.'}, status=status.HTTP_200_OK)


# ==============================================================================
# Admin Auth APIs
# ==============================================================================
class AdminCheckAuthView(APIView):
    def get(self, request):
        if request.user.is_authenticated and request.user.is_staff:
            return Response({
                'authenticated': True,
                'username': request.user.username,
                'email': request.user.email,
                'is_superuser': request.user.is_superuser
            }, status=status.HTTP_200_OK)
        return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)


class AdminApiLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_staff:
            django_login(request, user)
            return Response({
                'message': 'Login successful',
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials or non-staff account.'}, status=status.HTTP_401_UNAUTHORIZED)


class AdminApiLogoutView(APIView):
    def post(self, request):
        django_logout(request)
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


# ==============================================================================
# Admin Notifications & Messages API
# ==============================================================================
class AdminNotificationsView(APIView):
    def get(self, request):
        category = request.query_params.get('category', 'all')
        query = request.query_params.get('q', '').strip()

        qs = Notification.objects.all().order_by('-created_at')

        if category and category != 'all':
            if category == 'order':
                qs = qs.filter(notification_type__in=['order', 'order_status'])
            elif category == 'customer':
                qs = qs.filter(notification_type__in=['registration', 'login', 'contact_message'])
            elif category == 'product':
                qs = qs.filter(notification_type__in=['product_created', 'product_updated', 'low_stock', 'out_of_stock', 'review'])
            elif category == 'system':
                qs = qs.filter(notification_type__in=['system', 'admin_user_created', 'admin_user_updated', 'admin_user_deleted'])

        if query:
            qs = qs.filter(Q(title__icontains=query) | Q(body__icontains=query) | Q(sender__icontains=query))

        notifications_data = []
        for n in qs[:50]:
            notifications_data.append({
                'id': n.id,
                'title': n.title,
                'sender': n.sender,
                'senderInitial': n.sender_initial,
                'senderColor': n.sender_color,
                'body': n.body,
                'fullBody': n.full_body or n.body,
                'recipients': n.recipients,
                'department': n.department,
                'categoryBadge': n.category_badge,
                'type': n.notification_type,
                'isRead': n.is_read,
                'timeAgo': n.created_at.strftime('%d %b, %I:%M %p') if n.created_at else '',
                'createdAt': n.created_at.isoformat() if n.created_at else '',
            })

        unread_count = Notification.objects.filter(is_read=False).count()

        return Response({
            'notifications': notifications_data,
            'unreadCount': unread_count,
            'totalCount': Notification.objects.count()
        }, status=status.HTTP_200_OK)


class AdminNotificationReadView(APIView):
    def post(self, request, pk):
        try:
            n = Notification.objects.get(pk=pk)
            n.is_read = True
            n.save()
            return Response({'success': True, 'id': n.id})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminNotificationMarkAllReadView(APIView):
    def post(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'success': True})


class AdminNotificationDeleteView(APIView):
    def post(self, request, pk):
        try:
            n = Notification.objects.get(pk=pk)
            n.delete()
            return Response({'success': True})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        return self.post(request, pk)


# ==============================================================================
# Admin Offers API
# ==============================================================================
class AdminOffersView(APIView):
    def get(self, request):
        offers = Offer.objects.prefetch_related('applicable_categories', 'applicable_products').all().order_by('-created_at')
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
        return Response(offers_data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        offer = Offer.objects.create(
            name=data.get('name', 'New Offer'),
            title=data.get('title', ''),
            description=data.get('description', ''),
            discount_type=data.get('discount_type', 'Percentage'),
            start_date=data.get('start_date') or None,
            end_date=data.get('end_date') or None,
            start_datetime=data.get('start_datetime') or None,
            end_datetime=data.get('end_datetime') or None,
            is_active=data.get('is_active', True)
        )
        if 'applicable_categories' in data:
            offer.applicable_categories.set(data['applicable_categories'])
        if 'applicable_products' in data:
            offer.applicable_products.set(data['applicable_products'])
        return Response({'id': offer.id, 'name': offer.name}, status=status.HTTP_201_CREATED)


class AdminOfferDetailView(APIView):
    def put(self, request, pk):
        try:
            offer = Offer.objects.get(pk=pk)
        except Offer.DoesNotExist:
            return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        for field in ['name', 'title', 'description', 'discount_type', 'start_date', 'end_date', 'start_datetime', 'end_datetime', 'is_active']:
            if field in data:
                setattr(offer, field, data[field])
        offer.save()

        if 'applicable_categories' in data:
            offer.applicable_categories.set(data['applicable_categories'])
        if 'applicable_products' in data:
            offer.applicable_products.set(data['applicable_products'])

        return Response({'success': True, 'id': offer.id})

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        try:
            offer = Offer.objects.get(pk=pk)
            offer.delete()
            return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)
        except Offer.DoesNotExist:
            return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# Admin Orders API
# ==============================================================================
class AdminOrdersView(APIView):
    def get(self, request):
        status_filter = request.query_params.get('status')
        search_query = request.query_params.get('search', '').strip()

        qs = Order.objects.prefetch_related('items__product').all().order_by('-created_at')

        if status_filter and status_filter != 'All':
            qs = qs.filter(order_status=status_filter)

        if search_query:
            qs = qs.filter(
                Q(shipping_name__icontains=search_query) |
                Q(shipping_phone__icontains=search_query) |
                Q(razorpay_order_id__icontains=search_query) |
                Q(id__icontains=search_query)
            )

        orders_list = []
        for o in qs:
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

        all_orders = Order.objects.all()
        total_rev = sum(float(o.total_amount) for o in all_orders if o.payment_status == 'Paid')

        return Response({
            'total_count': all_orders.count(),
            'pending_count': all_orders.filter(order_status='Pending').count(),
            'shipped_count': all_orders.filter(order_status='Shipped').count(),
            'delivered_count': all_orders.filter(order_status='Delivered').count(),
            'cancelled_count': all_orders.filter(order_status='Cancelled').count(),
            'total_revenue': total_rev,
            'results': orders_list
        }, status=status.HTTP_200_OK)


class AdminOrderDetailView(APIView):
    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'orderStatus' in request.data:
            order.order_status = request.data['orderStatus']
        if 'paymentStatus' in request.data:
            order.payment_status = request.data['paymentStatus']
        order.save()
        return Response({'success': True, 'id': order.id, 'orderStatus': order.order_status})

    def delete(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            order.delete()
            return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# Admin Customers API
# ==============================================================================
class AdminCustomersView(APIView):
    def get(self, request):
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

        return Response({
            'total_count': customers.count(),
            'active_count': customers.filter(is_active=True).count(),
            'inactive_count': customers.filter(is_active=False).count(),
            'total_spent_all': total_spent_all,
            'results': cust_list
        }, status=status.HTTP_200_OK)


class AdminCustomerStatusView(APIView):
    def post(self, request, pk):
        try:
            u = User.objects.get(pk=pk, is_staff=False)
            u.is_active = not u.is_active
            u.save()
            return Response({'success': True, 'isActive': u.is_active})
        except User.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminCustomerDeleteView(APIView):
    def post(self, request, pk):
        try:
            u = User.objects.get(pk=pk, is_staff=False)
            u.delete()
            return Response({'success': True})
        except User.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        return self.post(request, pk)


# ==============================================================================
# Admin Users API
# ==============================================================================
class AdminUsersView(APIView):
    def get(self, request):
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
                'isActive': u.is_active,
                'isSuperuser': u.is_superuser,
                'lastLogin': u.last_login.strftime('%d %b %Y, %I:%M %p') if u.last_login else 'Never',
                'createdAt': u.date_joined.strftime('%d %b %Y') if u.date_joined else '',
                'permissions': perms,
            })
        return Response({
            'total_count': staff_users.count(),
            'active_count': staff_users.filter(is_active=True).count(),
            'inactive_count': staff_users.filter(is_active=False).count(),
            'super_admins_count': staff_users.filter(is_superuser=True).count(),
            'results': admins_list
        }, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')
        email = data.get('email', '')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        role = data.get('role', 'Staff')
        permissions = data.get('permissions', [])

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=(role == 'Super Admin')
        )
        AdminProfile.objects.create(
            user=user,
            role=role,
            permissions=permissions,
            raw_password=password
        )
        return Response({'success': True, 'id': user.id}, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    def put(self, request, pk):
        try:
            u = User.objects.get(pk=pk, is_staff=True)
        except User.DoesNotExist:
            return Response({'error': 'Admin user not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'first_name' in data:
            u.first_name = data['first_name']
        if 'last_name' in data:
            u.last_name = data['last_name']
        if 'email' in data:
            u.email = data['email']
        if 'password' in data and data['password']:
            u.set_password(data['password'])
        u.save()

        profile, _ = AdminProfile.objects.get_or_create(user=u)
        if 'role' in data:
            profile.role = data['role']
            u.is_superuser = (data['role'] == 'Super Admin')
            u.save()
        if 'permissions' in data:
            profile.permissions = data['permissions']
        profile.save()

        return Response({'success': True, 'id': u.id})

    def delete(self, request, pk):
        try:
            u = User.objects.get(pk=pk, is_staff=True)
            if u.is_superuser and User.objects.filter(is_superuser=True).count() <= 1:
                return Response({'error': 'Cannot delete the only Super Admin.'}, status=status.HTTP_400_BAD_REQUEST)
            u.delete()
            return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'Admin user not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminUserToggleActiveView(APIView):
    def post(self, request, pk):
        try:
            u = User.objects.get(pk=pk, is_staff=True)
            u.is_active = not u.is_active
            u.save()
            return Response({'success': True, 'isActive': u.is_active})
        except User.DoesNotExist:
            return Response({'error': 'Admin user not found'}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# Store Settings & Admin Profile APIs
# ==============================================================================
class AdminSettingsView(APIView):
    def get(self, request):
        settings_obj, _ = StoreSettings.objects.get_or_create(id=1)
        fields = [f.name for f in settings_obj._meta.fields if f.name not in ['id', 'store_logo']]
        data = {f: getattr(settings_obj, f) for f in fields}
        if settings_obj.store_logo:
            data['store_logo'] = settings_obj.store_logo.url
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        settings_obj, _ = StoreSettings.objects.get_or_create(id=1)
        data = request.data
        for key, value in data.items():
            if hasattr(settings_obj, key) and key not in ['id', 'store_logo']:
                setattr(settings_obj, key, value)
        if 'store_logo' in request.FILES:
            settings_obj.store_logo = request.FILES['store_logo']
        settings_obj.save()
        return Response({'success': True, 'message': 'Settings saved successfully.'}, status=status.HTTP_200_OK)


class AdminProfileSettingsView(APIView):
    def get(self, request):
        u = request.user
        if not u.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        profile, _ = AdminProfile.objects.get_or_create(user=u)
        return Response({
            'id': u.id,
            'firstName': u.first_name,
            'lastName': u.last_name,
            'fullName': f"{u.first_name} {u.last_name}".strip() or u.username,
            'email': u.email,
            'username': u.username,
            'mobile': profile.phone or '',
            'role': profile.role,
            'profileImage': profile.profile_image.url if profile.profile_image else '',
            'dateJoined': u.date_joined.strftime('%d %b %Y') if u.date_joined else '',
            'lastLogin': u.last_login.strftime('%d %b %Y, %I:%M %p') if u.last_login else 'Never',
            'isActive': u.is_active,
            'isSuperuser': u.is_superuser,
        })

    def post(self, request):
        u = request.user
        if not u.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data
        if 'first_name' in data:
            u.first_name = data['first_name']
        if 'last_name' in data:
            u.last_name = data['last_name']
        if 'email' in data:
            u.email = data['email']
        u.save()

        profile, _ = AdminProfile.objects.get_or_create(user=u)
        if 'mobile' in data:
            profile.phone = data['mobile']
        if 'profile_image' in request.FILES:
            profile.profile_image = request.FILES['profile_image']
        profile.save()

        return Response({'success': True, 'message': 'Profile updated successfully.'})


class AdminChangePasswordView(APIView):
    def post(self, request):
        u = request.user
        if not u.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        curr_pwd = request.data.get('current_password')
        new_pwd = request.data.get('new_password')

        if not u.check_password(curr_pwd):
            return Response({'error': 'Current password does not match.'}, status=status.HTTP_400_BAD_REQUEST)

        u.set_password(new_pwd)
        u.save()
        django_login(request, u)
        return Response({'success': True, 'message': 'Password changed successfully.'})


class AdminTestEmailView(APIView):
    def post(self, request):
        to_email = request.data.get('to_email') or request.user.email or 'admin@moxie.com'
        try:
            send_mail(
                subject='Moxie Admin - SMTP Test Email',
                message='This is a test email sent from Moxie Admin Portal settings.',
                from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@moxie.com',
                recipient_list=[to_email],
                fail_silently=False
            )
            return Response({'success': True, 'message': f'Test email sent to {to_email}'})
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        try:
            user = User.objects.get(email=email, is_staff=True)
        except User.DoesNotExist:
            return Response({'error': 'No admin account found with that email.'}, status=status.HTTP_404_NOT_FOUND)

        otp_code = get_random_string(length=6, allowed_chars='0123456789')
        AdminPasswordResetOTP.objects.create(
            user=user,
            email=email,
            otp_code=otp_code,
            expires_at=timezone.now() + timedelta(minutes=15)
        )

        try:
            send_mail(
                subject='Moxie Admin - Password Reset Code',
                message=f'Your password reset OTP code is: {otp_code}. Valid for 15 minutes.',
                from_email='noreply@moxie.com',
                recipient_list=[email],
                fail_silently=True
            )
        except Exception:
            pass

        return Response({'success': True, 'message': 'Reset code sent to email.'})


class AdminVerifyResetCodeView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        otp = request.data.get('otp', '').strip()

        try:
            otp_obj = AdminPasswordResetOTP.objects.filter(
                email=email,
                otp_code=otp,
                used=False,
                expires_at__gte=timezone.now()
            ).latest('created_at')
        except AdminPasswordResetOTP.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj.used = True
        otp_obj.save()

        token_str = get_random_string(length=64)
        AdminPasswordResetToken.objects.create(
            user=otp_obj.user,
            token=token_str,
            expires_at=timezone.now() + timedelta(minutes=30)
        )

        return Response({'success': True, 'token': token_str})


class AdminResetPasswordView(APIView):
    def post(self, request):
        token_str = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '')

        try:
            token_obj = AdminPasswordResetToken.objects.get(
                token=token_str,
                used=False,
                expires_at__gte=timezone.now()
            )
        except AdminPasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        token_obj.user.set_password(new_password)
        token_obj.user.save()
        token_obj.used = True
        token_obj.save()

        return Response({'success': True, 'message': 'Password has been reset successfully.'})


# ==============================================================================
# Admin Dashboard Analytics API
# ==============================================================================
class AdminDashboardAnalyticsView(APIView):
    def get(self, request):
        range_param = request.query_params.get('range', '7d')
        days = 7
        if range_param == '30d':
            days = 30
        elif range_param == '90d':
            days = 90
        elif range_param == '1y':
            days = 365

        today = timezone.localdate()
        products = Product.objects.all()
        orders = Order.objects.all()

        inventory_expression = ExpressionWrapper(
            F('price') * F('stock'),
            output_field=DecimalField(max_digits=16, decimal_places=2),
        )
        inv_value = products.aggregate(
            total=Coalesce(Sum(inventory_expression), 0, output_field=DecimalField(max_digits=16, decimal_places=2))
        )['total']

        total_orders = orders.count()
        total_rev = sum(float(o.total_amount) for o in orders if o.payment_status == 'Paid')

        activity = []
        for offset in range(days - 1, -1, -1 if days <= 30 else int(days/10)):
            day = today - timedelta(days=offset)
            activity.append({
                'label': day.strftime('%d %b') if days > 7 else day.strftime('%a'),
                'products': products.filter(created_at__date=day).count(),
                'orders': orders.filter(created_at__date=day).count(),
            })

        return Response({
            'total_products': products.count(),
            'total_users': User.objects.count(),
            'total_orders': total_orders,
            'total_revenue': total_rev,
            'inventory_value': inv_value,
            'in_stock': products.filter(stock__gt=10).count(),
            'low_stock': products.filter(stock__gt=0, stock__lte=10).count(),
            'out_of_stock': products.filter(stock=0).count(),
            'activity': activity,
        })


class AdminDashboardSalesView(APIView):
    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        today = timezone.localdate()
        data_points = []

        if period == 'weekly':
            for i in range(6, -1, -1):
                day = today - timedelta(days=i)
                data_points.append({
                    'label': day.strftime('%a'),
                    'sales': sum(float(o.total_amount) for o in Order.objects.filter(created_at__date=day, payment_status='Paid')),
                    'orders': Order.objects.filter(created_at__date=day).count()
                })
        else:
            for i in range(5, -1, -1):
                # Monthly buckets
                month_start = today.replace(day=1) - timedelta(days=i * 30)
                data_points.append({
                    'label': month_start.strftime('%b'),
                    'sales': sum(float(o.total_amount) for o in Order.objects.filter(created_at__month=month_start.month, payment_status='Paid')),
                    'orders': Order.objects.filter(created_at__month=month_start.month).count()
                })

        return Response({'sales': data_points})