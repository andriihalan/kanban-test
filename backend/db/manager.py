from boto3.dynamodb.conditions import Attr, Key
from flask import current_app


class DynamoManager:
    def __init__(self, model):
        self.model = model
        self.connection = self._get_connection()
        self.table = self._get_table(self.connection, self.model)

    def get_item(self, **kwargs):
        response = self.table.get_item(Key=kwargs)
        item = response.get('Item')
        if item:
            return self.model(**item)
        return None

    def save_item(self, instance):
        item = instance.serialize()
        self.model.validate_fields(data=item)
        self.table.put_item(Item=item)

    def update_item(self, data, **kwargs):
        # Validate and serialize the data
        serialized_data = {}
        for field_name, value in data.items():
            field = self.model._fields[field_name]
            field.validate(field_name, value)
            serialized_data[field_name] = field.prep_value_to_db(value)

        # Prepare the update expression and attribute dictionaries
        update_expression = "SET " + ", ".join(f"#{field} = :{field}" for field in serialized_data.keys())
        expression_attribute_values = {f":{field}": value for field, value in serialized_data.items()}
        expression_attribute_names = {f"#{field}": field for field in serialized_data.keys()}

        # Perform the update operation
        self.table.update_item(
            Key=kwargs,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
        )

    def delete_item(self, **kwargs):
        self.table.delete_item(Key=kwargs)

    def replace_item(self, old_key, new_item_data):
        self.model.validate_fields(data=new_item_data)
        transact_items = [
            {
                'Put': {
                    'TableName': self.model.table_name,
                    'Item': new_item_data
                }
            },
            {
                'Delete': {
                    'TableName': self.model.table_name,
                    'Key': old_key
                }
            }
        ]
        print(transact_items)
        self.connection.meta.client.transact_write_items(TransactItems=transact_items)

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
