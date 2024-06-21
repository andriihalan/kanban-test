from .fields import DynamoField
from .indexes import GlobalSecondaryIndex
from .manager import DynamoManager


class DynamoModelMeta(type):
    def __new__(cls, name, bases, attrs):
        fields = {
            key: value for key, value in attrs.items()
            if isinstance(value, DynamoField)
        }
        indexes = [
            value for key, value in attrs.items()
            if isinstance(value, GlobalSecondaryIndex)
        ]
        cls_obj = super().__new__(cls, name, bases, attrs)
        cls_obj._fields = fields
        cls_obj._indexes = indexes

        return cls_obj


class DynamoModel(metaclass=DynamoModelMeta):
    table_name = None
    provisioned_throughput = {
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }

    def __init__(self, **kwargs):
        self._meta = self._fields
        self.manager = self.get_manager()

        for field in self._fields.keys():
            setattr(self, field, kwargs.get(field))

    def save(self):
        self.set_default_values()
        self.manager.save(self)
        return self

    def set_default_values(self):
        for field, attrs in self._fields.items():
            if attrs.default is not None:
                setattr(self, field, attrs.default())

    @classmethod
    def get_manager(cls):
        return DynamoManager(model=cls)

    @classmethod
    def create_table(cls, connection):
        attributes = []
        key_schema = []
        attribute_definitions = []

        # Prepare key schema and attribute definitions
        for field_name, attrs in cls._fields.items():
            if attrs.partition_key or attrs.sort_key:
                key_type = 'HASH' if attrs.partition_key else 'RANGE'
                key_schema.append({
                    'AttributeName': field_name,
                    'KeyType': key_type,
                })
                attribute_definitions.append({
                    'AttributeName': field_name,
                    'AttributeType': attrs.attribute_type
                })
                attributes.append(field_name)

        # Prepare global secondary indexes
        global_secondary_indexes = []
        for index in cls._indexes:
            gsi_key_schema = []
            for field_name, attrs in index.key_schema.items():
                if attrs.partition_key or attrs.sort_key:
                    key_type = 'HASH' if attrs.partition_key else 'RANGE'
                    gsi_key_schema.append({
                        'AttributeName': field_name,
                        'KeyType': key_type,
                    })

                # Add attribute definitions if not present
                if field_name not in attributes:
                    attribute_definitions.append({
                        'AttributeName': field_name,
                        'AttributeType': attrs.attribute_type
                    })
                    attributes.append(field_name)

            global_secondary_indexes.append({
                'IndexName': index.index_name,
                'KeySchema': gsi_key_schema,
                'Projection': {
                    'ProjectionType': index.projection_type
                },
                'ProvisionedThroughput': {
                    'ReadCapacityUnits': index.read_capacity_units,
                    'WriteCapacityUnits': index.write_capacity_units
                }
            })

        table_params = {
            'TableName': cls.table_name,
            'KeySchema': key_schema,
            'AttributeDefinitions': attribute_definitions,
            'ProvisionedThroughput': cls.provisioned_throughput,
        }
        if global_secondary_indexes:
            table_params['GlobalSecondaryIndexes'] = global_secondary_indexes

        table = connection.create_table(**table_params)
        table.meta.client.get_waiter('table_exists').wait(TableName=cls.table_name)
