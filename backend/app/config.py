import os


class BaseSettings:
    DEBUG = True


class LocalSettings(BaseSettings):
    SECRET_KEY = os.environ.get("SECRET_KEY")
