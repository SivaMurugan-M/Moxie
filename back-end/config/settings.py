"""
Django settings for Moxie project.
"""

from pathlib import Path
import os
import dj_database_url


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# LOAD .ENV FILE
# ============================================================

env_file = BASE_DIR / ".env"

if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()

            if (
                line
                and not line.startswith("#")
                and "=" in line
            ):
                key, value = line.split("=", 1)

                os.environ.setdefault(
                    key.strip(),
                    value.strip()
                )


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = (
    os.environ.get("DJANGO_SECRET_KEY")
    or os.environ.get("SECRET_KEY")
)

if not SECRET_KEY:
    raise ValueError(
        "DJANGO_SECRET_KEY is not configured"
    )


# ============================================================
# DEBUG
# ============================================================

DEBUG_VALUE = os.environ.get(
    "DJANGO_DEBUG",
    os.environ.get("DEBUG", "False")
)

DEBUG = DEBUG_VALUE.lower() in (
    "true",
    "1",
    "yes",
    "on",
)


# ============================================================
# ALLOWED HOSTS
# ============================================================

raw_allowed_hosts = (
    os.environ.get("DJANGO_ALLOWED_HOSTS")
    or os.environ.get("ALLOWED_HOSTS")
    or "localhost,127.0.0.1"
)

ALLOWED_HOSTS = [
    host.strip()
    for host in raw_allowed_hosts.split(",")
    if host.strip()
]


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",

    # Third Party
    "rest_framework",
    "corsheaders",

    # Moxie Apps
    "categories",
    "products",
    "banners",
    "api",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL / WSGI
# ============================================================

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [
            BASE_DIR / "templates"
        ],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    ""
).strip()

DB_ENGINE = os.environ.get(
    "DB_ENGINE",
    ""
).strip()

DB_NAME = os.environ.get(
    "DB_NAME",
    ""
).strip()


# ------------------------------------------------------------
# Render PostgreSQL / DATABASE_URL
# ------------------------------------------------------------

if DATABASE_URL and "://" in DATABASE_URL:

    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }



# ------------------------------------------------------------
# Manual PostgreSQL
# ------------------------------------------------------------

elif DB_ENGINE and DB_NAME:

    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,

            "NAME": DB_NAME,

            "USER": os.environ.get(
                "DB_USER",
                ""
            ),

            "PASSWORD": os.environ.get(
                "DB_PASSWORD",
                ""
            ),

            "HOST": os.environ.get(
                "DB_HOST",
                "localhost"
            ),

            "PORT": os.environ.get(
                "DB_PORT",
                "5432"
            ),
        }
    }


# ------------------------------------------------------------
# Local SQLite
# ------------------------------------------------------------

else:

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",

            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME":
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.MinimumLengthValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.CommonPasswordValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

static_dir = BASE_DIR / "static"

if static_dir.exists():

    STATICFILES_DIRS = [
        static_dir
    ]


# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# WHITENOISE
# ============================================================

STORAGES = {

    "default": {
        "BACKEND":
            "django.core.files.storage.FileSystemStorage",
    },

    "staticfiles": {
        "BACKEND":
            "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}


# ============================================================
# CORS
# ============================================================

CORS_ALLOW_ALL_ORIGINS = False

raw_cors_origins = os.environ.get(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)

CORS_ALLOWED_ORIGINS = [

    origin.strip().rstrip("/")

    for origin in raw_cors_origins.split(",")

    if origin.strip()
]


CORS_ALLOW_HEADERS = [

    "accept",

    "accept-encoding",

    "authorization",

    "content-type",

    "dnt",

    "origin",

    "user-agent",

    "x-csrftoken",

    "x-requested-with",
]


# ============================================================
# CSRF
# ============================================================

raw_csrf_trusted = os.environ.get(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)

CSRF_TRUSTED_ORIGINS = [

    origin.strip().rstrip("/")

    for origin in raw_csrf_trusted.split(",")

    if origin.strip()
]


# ============================================================
# RAZORPAY
# ============================================================

RAZORPAY_KEY_ID = os.environ.get(
    "RAZORPAY_KEY_ID",
    ""
)

RAZORPAY_KEY_SECRET = os.environ.get(
    "RAZORPAY_KEY_SECRET",
    ""
)

RAZORPAY_WEBHOOK_SECRET = os.environ.get(
    "RAZORPAY_WEBHOOK_SECRET",
    ""
)


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {

    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}


# ============================================================
# PRODUCTION SECURITY
# ============================================================

if not DEBUG:

    # --------------------------------------------------------
    # HTTPS REDIRECT
    # --------------------------------------------------------

    SECURE_SSL_REDIRECT = (
        os.environ.get(
            "SECURE_SSL_REDIRECT",
            "True"
        ).lower()
        in ("true", "1", "yes", "on")
    )


    # --------------------------------------------------------
    # HSTS
    # --------------------------------------------------------

    SECURE_HSTS_SECONDS = int(
        os.environ.get(
            "SECURE_HSTS_SECONDS",
            "31536000"
        )
    )

    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

    SECURE_HSTS_PRELOAD = True


    # --------------------------------------------------------
    # SECURE COOKIES
    # --------------------------------------------------------

    SESSION_COOKIE_SECURE = (
        os.environ.get(
            "SESSION_COOKIE_SECURE",
            "True"
        ).lower()
        in ("true", "1", "yes", "on")
    )

    CSRF_COOKIE_SECURE = (
        os.environ.get(
            "CSRF_COOKIE_SECURE",
            "True"
        ).lower()
        in ("true", "1", "yes", "on")
    )


    # --------------------------------------------------------
    # BROWSER SECURITY
    # --------------------------------------------------------

    SECURE_CONTENT_TYPE_NOSNIFF = True

    X_FRAME_OPTIONS = "DENY"


    # --------------------------------------------------------
    # RENDER HTTPS PROXY
    # --------------------------------------------------------

    SECURE_PROXY_SSL_HEADER = (
        "HTTP_X_FORWARDED_PROTO",
        "https",
    )


# ============================================================
# SESSION
# ============================================================

SESSION_EXPIRE_AT_BROWSER_CLOSE = True

SESSION_COOKIE_AGE = 900

SESSION_SAVE_EVERY_REQUEST = True


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"