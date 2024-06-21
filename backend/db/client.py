import boto3


class Dynamo:
    def __init__(self, app=None):
        self.app = app
        self.connection = None

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        config = app.config
        client_kwargs = {
            'region_name': config.get('AWS_REGION', 'us-east-1'),
            'aws_access_key_id': config.get('AWS_ACCESS_KEY_ID'),
            'aws_secret_access_key': config.get('AWS_SECRET_ACCESS_KEY'),
            'endpoint_url': config.get('DATABASE_URL'),
        }

        self.connection = boto3.resource('dynamodb', **client_kwargs)

        app.extensions['database'] = self

    def init_models(self, models, reset_table=False):
        for model in models:
            table_exists = self.table_exists(model.table_name)

            if reset_table and table_exists:
                table = self.connection.Table(model.table_name)
                table.delete()

            if not table_exists:
                model.create_table(connection=self.connection)

    def table_exists(self, table_name):
        return table_name in [table.name for table in self.connection.tables.all()]
