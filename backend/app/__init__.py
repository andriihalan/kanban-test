import os

from flask import Flask


def create_app():
    app = Flask(__name__)

    app_settings = os.getenv("APP_SETTINGS")
    app.config.from_object(app_settings)

    @app.route('/')
    def hello():
        return '<div>Hello, World!<div>'

    return app
