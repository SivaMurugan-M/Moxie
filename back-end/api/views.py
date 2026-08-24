from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from banners.models import Banner
from categories.models import Category
from products.models import Product, Review

from .serializers import (
    BannerSerializer,
    CategorySerializer,
    ProductSerializer,
    ReviewSerializer,
)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(
        is_active=True
    )

    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(
        is_active=True
    ).select_related(
        'category'
    ).prefetch_related(
        'images'
    )

    serializer_class = ProductSerializer


class BannerListView(generics.ListAPIView):
    queryset = Banner.objects.filter(
        is_active=True
    ).order_by(
        'display_order'
    )

    serializer_class = BannerSerializer


class ReviewListView(generics.ListAPIView):
    queryset = Review.objects.filter(
        is_active=True
    )

    serializer_class = ReviewSerializer


class HealthCheckView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)


from django.db import transaction
from django.conf import settings
import uuid
from .serializers import OrderCreateSerializer
from .models import Order, OrderItem
from products.models import Product
from .razorpay_service import RazorpayService

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
                razorpay_order_id=rzp_order['id']
            )

            for item_info in order_items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product=item_info['product'],
                    quantity=item_info['quantity'],
                    price=item_info['price']
                )

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

        # Avoid double-processing already verified orders
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
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.save()

            for item in order.items.all():
                product = item.product
                product.stock = max(0, product.stock - item.quantity)
                product.save()

        return Response({
            'message': 'Payment signature verified successfully.',
            'order_id': order.id
        }, status=status.HTTP_200_OK)


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature') or request.META.get('HTTP_X_RAZORPAY_SIGNATURE')
        if not signature:
            return Response(
                {'error': 'Webhook signature header missing.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        body_str = request.body.decode('utf-8')
        rzp_service = RazorpayService()
        is_valid = rzp_service.verify_webhook_signature(
            body_str=body_str,
            signature=signature,
            secret=settings.RAZORPAY_WEBHOOK_SECRET
        )

        if not is_valid:
            return Response(
                {'error': 'Webhook signature verification failed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
                            if rzp_payment_id:
                                order.razorpay_payment_id = rzp_payment_id
                            order.save()

                            for item in order.items.all():
                                product = item.product
                                product.stock = max(0, product.stock - item.quantity)
                                product.save()
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