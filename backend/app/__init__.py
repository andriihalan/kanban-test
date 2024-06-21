import os
from flask import Flask
from graphql_server.flask import GraphQLView

from db import Dynamo
from app.models import Card, Column
from app.graphql import schema


def create_app():
    app = Flask(__name__)

    app_settings = os.getenv("APP_SETTINGS")
    app.config.from_object(app_settings)

    db = Dynamo()
    db.init_app(app)
    db.init_models(models=[Card, Column], reset_table=False)

    app.add_url_rule('/graphql', view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True,
    ))

    return app
