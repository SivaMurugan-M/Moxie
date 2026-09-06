import json
import logging
from django.contrib import admin
from categories.models import Category, Subcategory
from django.db.models import Avg
from api.permissions_utils import has_admin_permission
from .models import Product, ProductImage, ProductVariant, VariantImage, Review

logger = logging.getLogger(__name__)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    max_num = 3


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    def has_module_permission(self, request):
        return has_admin_permission(request.user, 'products')

    def has_view_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'products')

    def has_add_permission(self, request):
        return has_admin_permission(request.user, 'products')

    def has_change_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'products')

    def has_delete_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'products')

    list_display = (
        'name',
        'category',
        'subcategory',
        'price',
        'discount_price',
        'stock',
        'is_active',
        'created_at',
    )

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        products = Product.objects.all()
        extra_context['total_products_count'] = products.count()
        extra_context['active_products_count'] = products.filter(is_active=True).count()
        extra_context['out_of_stock_count'] = products.filter(stock=0).count()
        extra_context['total_inventory_value'] = sum(p.price * p.stock for p in products)
        extra_context['categories_list'] = Category.objects.all()
        return super().changelist_view(request, extra_context=extra_context)

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        categories = list(Category.objects.filter(is_active=True).values('id', 'name', 'slug'))
        subcategories = list(Subcategory.objects.filter(is_active=True).values('id', 'name', 'slug', 'category_id'))
        for s in subcategories:
            s['categoryId'] = s.pop('category_id')

        extra_context['categories_json'] = json.dumps(categories)
        extra_context['subcategories_json'] = json.dumps(subcategories)

        if object_id:
            obj = self.get_object(request, object_id)
            if obj:
                initial_data = {
                    'name': obj.name,
                    'category': obj.category_id,
                    'subcategory': obj.subcategory_id or '',
                    'description': obj.description or '',
                }
                existing_variants = []
                for v in obj.variants.all().prefetch_related('images'):
                    imgs = []
                    for img in v.images.all():
                        if img.image:
                            imgs.append({
                                'id': img.id,
                                'url': img.image.url,
                                'is_primary': img.is_primary
                            })
                    existing_variants.append({
                        'id': v.id,
                        'temp_id': f'v-{v.id}',
                        'color_name': v.color_name,
                        'color_code': v.color_code,
                        'price': str(v.price),
                        'discount_price': str(v.discount_price) if v.discount_price is not None else '',
                        'stock': str(v.stock),
                        'sizes': v.sizes or [],
                        'is_active': v.is_active,
                        'images': imgs,
                        'existing_images': imgs,
                    })
                extra_context['initial_data_json'] = json.dumps(initial_data)
                extra_context['existing_variants_json'] = json.dumps(existing_variants)
        else:
            extra_context['initial_data_json'] = json.dumps({})
            extra_context['existing_variants_json'] = json.dumps([])

        return super().changeform_view(request, object_id=object_id, form_url=form_url, extra_context=extra_context)

    def save_model(self, request, obj, form, change):
        # Suppress preliminary post_save signal when variants will be synced in save_related
        if request.POST.get('variant_payload_json'):
            obj._suppress_notification = True
        super().save_model(request, obj, form, change)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        product = form.instance
        variant_payload = request.POST.get('variant_payload_json')
        if variant_payload:
            try:
                variants_data = json.loads(variant_payload)
                current_variant_ids = []
                total_stock = 0
                first_variant_price = None
                first_variant_disc = None
                first_variant_img = None

                for v_idx, v_data in enumerate(variants_data):
                    v_id = v_data.get('id')
                    color_name = v_data.get('color_name', '').strip()
                    color_code = v_data.get('color_code', '#000000').strip()
                    price = v_data.get('price', 0)
                    discount_price = v_data.get('discount_price') or None
                    stock = int(v_data.get('stock') or 0)
                    sizes = v_data.get('sizes', [])
                    is_active = v_data.get('is_active', True)

                    if v_idx == 0:
                        first_variant_price = price
                        first_variant_disc = discount_price
                    total_stock += stock

                    if v_id:
                        variant = ProductVariant.objects.filter(id=v_id, product=product).first()
                        if not variant:
                            variant = ProductVariant(product=product)
                    else:
                        variant = ProductVariant(product=product)

                    variant.color_name = color_name
                    variant.color_code = color_code
                    variant.price = price
                    variant.discount_price = discount_price
                    variant.stock = stock
                    variant.sizes = sizes
                    variant.is_active = is_active
                    variant._suppress_notification = True
                    variant.save()
                    current_variant_ids.append(variant.id)

                    # Handle deleted images
                    del_ids = v_data.get('deleted_image_ids', [])
                    if del_ids:
                        VariantImage.objects.filter(variant=variant, id__in=del_ids).delete()

                    # Handle primary image id update
                    primary_id = v_data.get('primary_image_id')
                    if primary_id:
                        VariantImage.objects.filter(variant=variant).update(is_primary=False)
                        VariantImage.objects.filter(variant=variant, id=primary_id).update(is_primary=True)

                    # Handle new image uploads from request.FILES
                    primary_idx = v_data.get('primary_image_index', 0)
                    f_idx = 0
                    while True:
                        key = f"variant_img_{v_idx}_{f_idx}"
                        if key in request.FILES:
                            file_obj = request.FILES[key]
                            is_primary = (f_idx == primary_idx and not primary_id)
                            v_img = VariantImage.objects.create(
                                variant=variant,
                                image=file_obj,
                                is_primary=is_primary
                            )
                            if not first_variant_img:
                                first_variant_img = v_img.image
                            f_idx += 1
                        else:
                            break

                # Delete variants not in current_variant_ids
                if current_variant_ids:
                    product.variants.exclude(id__in=current_variant_ids).delete()

                # Sync product top level price & stock
                if first_variant_price is not None:
                    product.price = first_variant_price
                    product.discount_price = first_variant_disc
                    product.stock = total_stock
                    product._suppress_notification = True
                    product.save(update_fields=['price', 'discount_price', 'stock'])

                # Ensure product has at least one ProductImage if variant has images
                if first_variant_img and not product.images.exists():
                    ProductImage.objects.create(product=product, image=first_variant_img, is_primary=True)

                # Now create unified Notification with accurate final variant & stock values
                from api.models import Notification
                cat_name = product.category.name if product.category else "Uncategorized"
                subcat_name = f" > {product.subcategory.name}" if product.subcategory else ""
                status_str = "Active" if product.is_active else "Inactive"
                v_count = len(current_variant_ids)

                if not change:
                    Notification.objects.create(
                        title=f"Product Added: {product.name}",
                        sender="Catalog Admin",
                        sender_initial="P",
                        sender_color="#10b981",
                        body=f"New product '{product.name}' was created with {v_count} variant(s) and {total_stock} total units.",
                        full_body=(
                            f"Product Name: {product.name}\n"
                            f"Product ID: {product.id}\n"
                            f"Category: {cat_name}{subcat_name}\n"
                            f"Starting Price: ₹{first_variant_price or product.price}\n"
                            f"Total Stock: {total_stock} units\n"
                            f"Variants Count: {v_count}\n"
                            f"Status: {status_str}"
                        ),
                        recipients="Admin Team",
                        department="Catalog Management",
                        category_badge="Products",
                        notification_type="product_created",
                        target_url=f"/admin/products/product/{product.id}/change/",
                    )
                else:
                    Notification.objects.create(
                        title=f"Product Updated: {product.name}",
                        sender="Catalog Admin",
                        sender_initial="P",
                        sender_color="#6366f1",
                        body=f"Product '{product.name}' details were updated ({v_count} variant(s), {total_stock} total units).",
                        full_body=(
                            f"Product Name: {product.name}\n"
                            f"Product ID: {product.id}\n"
                            f"Category: {cat_name}{subcat_name}\n"
                            f"Starting Price: ₹{first_variant_price or product.price}\n"
                            f"Total Stock: {total_stock} units\n"
                            f"Variants Count: {v_count}\n"
                            f"Status: {status_str}"
                        ),
                        recipients="Admin Team",
                        department="Catalog Management",
                        category_badge="Products",
                        notification_type="product_updated",
                        target_url=f"/admin/products/product/{product.id}/change/",
                    )
            except Exception as e:
                logger.error(f"Error saving product variants: {e}")

    list_filter = (
        'category',
        'subcategory',
        'is_active',
    )

    search_fields = (
        'name',
        'description',
    )

    inlines = [
        ProductImageInline,
        ProductVariantInline,
    ]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    def has_module_permission(self, request):
        return has_admin_permission(request.user, 'reviews')

    def has_view_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'reviews')

    def has_add_permission(self, request):
        return has_admin_permission(request.user, 'reviews')

    def has_change_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'reviews')

    def has_delete_permission(self, request, obj=None):
        return has_admin_permission(request.user, 'reviews')

    list_display = (
        'name',
        'rating',
        'status',
        'is_active',
        'created_at',
    )

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        reviews = Review.objects.all()
        extra_context['total_reviews_count'] = reviews.count()
        extra_context['pending_reviews_count'] = reviews.filter(status='Pending').count()
        extra_context['approved_reviews_count'] = reviews.filter(status='Approved').count()
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 5.0
        extra_context['avg_rating_value'] = round(float(avg_rating), 1)
        extra_context['products_list'] = Product.objects.all()
        return super().changelist_view(request, extra_context=extra_context)

    list_filter = (
        'rating',
        'status',
        'is_active',
    )

    search_fields = (
        'name',
        'text',
        'email',
    )


