import os


class Config(object):
    APP_DIR = os.path.abspath(os.path.dirname(__file__))

    # Application Secrets Configuration
    SECRET_KEY = os.environ.get("SECRET_KEY", "secret-key")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "secret-key")

    # Google OAuth Configuration
    CLIENT_ID = os.environ.get("CLIENT_ID", None)


    OCR_API_URL = os.environ.get("OCR_API_URL")

    CORS_ORIGIN_WHITELIST = "*"
