from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Find inline formset management form prefix"

    def handle(self, *args, **options):
        from django.test import Client, RequestFactory
        from django.contrib.auth.models import User
        from products.models import Product
        from products.admin import ProductAdmin
        from django.contrib.admin.sites import AdminSite
        import re

        admin_user = User.objects.filter(is_superuser=True).first()
        c = Client()
        c.force_login(admin_user)

        # GET the page to find the actual management form fields
        resp = c.get("/admin/products/product/add/")
        rc = resp.content.decode("utf-8", errors="replace")

        # Find all name attributes in hidden inputs
        mgmt_fields = re.findall(r'name="([^"]*FORMS[^"]*)"', rc)
        self.stdout.write("Management form fields found in GET page:")
        for f in mgmt_fields:
            self.stdout.write("  " + f)

        # Also find any management_form blocks
        idx = rc.find("management_form")
        if idx < 0:
            idx = rc.find("TOTAL_FORMS")
        if idx > 0:
            self.stdout.write("Context around TOTAL_FORMS:")
            self.stdout.write(rc[max(0, idx-200):idx+400])
