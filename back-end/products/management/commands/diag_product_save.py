from django.core.management.base import BaseCommand
import json

class Command(BaseCommand):
    help = "Diagnose product admin save failure"

    def handle(self, *args, **options):
        from django.test import Client
        from django.contrib.auth.models import User
        from products.models import Product
        from products.admin import ProductAdmin
        from django.contrib.admin.sites import AdminSite
        from django.test import RequestFactory
        import re

        admin_user = User.objects.filter(is_superuser=True).first()
        self.stdout.write("Admin: " + (admin_user.username if admin_user else "NONE"))
        if not admin_user:
            return

        vpayload = json.dumps([{"temp_id":"v-1","id":None,"color_name":"Black","color_code":"#000000","price":"599","discount_price":"499","stock":10,"is_active":True,"new_images":[],"existing_images":[]}])
        post_data = {"name":"TEST Debug","category":"21","subcategory":"1","price":"599","discount_price":"499","stock":"10","is_active":"on","description":"test desc","productimage_set-TOTAL_FORMS":"3","productimage_set-INITIAL_FORMS":"0","productimage_set-MIN_NUM_FORMS":"0","productimage_set-MAX_NUM_FORMS":"3","variant_payload_json":vpayload,"_save":"Save Product"}

        # Direct form validation
        factory = RequestFactory()
        request = factory.post("/admin/products/product/add/", post_data)
        request.user = admin_user
        request._dont_enforce_csrf_checks = True
        site = AdminSite()
        pa = ProductAdmin(Product, site)
        form_class = pa.get_form(request)
        form = form_class(data=post_data, files={})
        self.stdout.write("form.is_valid(): " + str(form.is_valid()))
        self.stdout.write("form.errors: " + str(dict(form.errors)))

        # Full test client post
        before = Product.objects.count()
        self.stdout.write("Products before: " + str(before))
        c = Client()
        c.force_login(admin_user)
        resp = c.post("/admin/products/product/add/", post_data, follow=False)
        self.stdout.write("POST status: " + str(resp.status_code))
        if resp.status_code == 302:
            after = Product.objects.count()
            if after > before:
                p = Product.objects.order_by("-created_at").first()
                self.stdout.write("SUCCESS! ID=" + str(p.id) + " Name=" + p.name)
                vs = list(p.variants.values("id","color_name","price","stock"))
                self.stdout.write("Variants: " + str(vs))
                p.delete()
                self.stdout.write("Test product deleted.")
            else:
                self.stdout.write("FAIL: redirect but no new product!")
        elif resp.status_code == 200:
            rc = resp.content.decode("utf-8", errors="replace")
            m = re.search(r"hasErrors:\s*(true|false)", rc)
            if m:
                self.stdout.write("hasErrors: " + m.group(1))
            for field in ["name","category","subcategory","price","discount_price","stock","description"]:
                marker = 'id="source-field-' + field + '"'
                idx = rc.find(marker)
                if idx > 0:
                    chunk = rc[idx:idx+600]
                    if "errorlist" in chunk:
                        err_start = chunk.find("errorlist")
                        self.stdout.write("ERROR in field " + field + ":")
                        self.stdout.write(chunk[max(0,err_start-50):err_start+300])
            ctx_s = rc.find("window.DJANGO_CONTEXT")
            if ctx_s >= 0:
                ctx_e = rc.find("</script>", ctx_s)
                self.stdout.write("CONTEXT:")
                self.stdout.write(rc[ctx_s:min(ctx_e, ctx_s+2000)])
