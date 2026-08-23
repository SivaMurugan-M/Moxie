import razorpay
from django.conf import settings

class RazorpayService:
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    def create_order(self, amount_in_paise, receipt_id, notes=None):
        """
        Creates a Razorpay order.
        amount_in_paise: amount to pay in paise (e.g. 50000 paise for Rs. 500)
        receipt_id: a unique order/receipt reference ID
        """
        data = {
            'amount': amount_in_paise,
            'currency': 'INR',
            'receipt': receipt_id,
            'payment_capture': 1  # 1 means auto-capture payment on success
        }
        if notes:
            data['notes'] = notes
        
        try:
            order = self.client.order.create(data=data)
            return order
        except Exception as e:
            raise RuntimeError(f"Razorpay order creation failed: {str(e)}")

    def verify_payment_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """
        Verifies the signature returned by Razorpay Checkout.
        Returns True if signature is valid, False otherwise.
        """
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        try:
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except Exception:
            return False

    def verify_webhook_signature(self, body_str, signature, secret):
        """
        Verifies the Razorpay webhook signature.
        body_str: raw string payload from the request body.
        signature: signature from X-Razorpay-Signature header.
        secret: webhook secret.
        """
        try:
            self.client.utility.verify_webhook_signature(body_str, signature, secret)
            return True
        except Exception:
            return False
