import os
from flask import Flask

from db import Dynamo
from app.models import Card, Column


def create_app():
    app = Flask(__name__)

    app_settings = os.getenv("APP_SETTINGS")
    app.config.from_object(app_settings)

    db = Dynamo()
    db.init_app(app)
    db.init_models(models=[Card, Column], reset_table=False)

    return app
