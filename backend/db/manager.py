from boto3.dynamodb.conditions import Attr, Key
from flask import current_app


class DynamoManager:
    def __init__(self, model):
        self.model = model
        self.connection = self._get_connection()
        self.table = self._get_table(self.connection, self.model)

    def save(self, instance):
        item = {
            field_name: getattr(instance, field_name)
            for field_name, attrs in self.model._fields.items()
        }
        self.table.put_item(Item=item)

    def get(self, key):
        response = self.table.get_item(Key=key)
        item = response.get('Item')
        if item:
            return self.model(**item)
        return None

    def all(self):
        response = self.table.scan()
        items = response.get('Items', [])
        return [self.model(**item) for item in items]

    def query(self, index_name=None, sort_ascending=False, **kwargs):
        expression = None
        for key, value in kwargs.items():
            if expression is None:
                expression = Key(key).eq(value)
            else:
                expression &= Key(key).eq(value)

        query_params = {
            'KeyConditionExpression': expression
        }
        if index_name:
            query_params['IndexName'] = index_name
            query_params['ScanIndexForward'] = sort_ascending

        response = self.table.query(**query_params)
        items = response.get('Items', [])

        return [self.model(**item) for item in items]

    def filter(self, **kwargs):
        filter_expression = None
        for key, value in kwargs.items():
            if filter_expression is None:
                filter_expression = Attr(key).eq(value)
            else:
                filter_expression &= Attr(key).eq(value)

        response = self.table.scan(FilterExpression=filter_expression)
        items = response.get('Items', [])

        return [self.model(**item) for item in items]

    def update(self, key, **kwargs):
        update_expression = "SET " + ", ".join(f"{k} = :{k}" for k in kwargs.keys())
        expression_attribute_values = {f":{k}": v for k, v in kwargs.items()}

        self.table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

    def delete_item(self, **kwargs):
        self.table.delete_item(Key=kwargs)

    @staticmethod
    def _get_table(connection, model):
        if not model.table_name:
            raise ValueError("Table name not specified")
        return connection.Table(model.table_name)

    @staticmethod
    def _get_connection():
        if 'database' not in current_app.extensions:
            raise RuntimeError('Database is not initialized')
        return current_app.extensions['database'].connection
