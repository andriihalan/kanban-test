from uuid import uuid4
from db import DynamoModel, StringField, NumberField, GlobalSecondaryIndex, TimestampField


class Column(DynamoModel):
    table_name = 'columns'

    id = StringField(partition_key=True, default=lambda: str(uuid4()))
    title = StringField()
    order = NumberField()
    created_at = TimestampField()


class Card(DynamoModel):
    table_name = 'cards'

    column_id = StringField(partition_key=True)
    id = StringField(sort_key=True, default=lambda: str(uuid4()))
    title = StringField()
    description = StringField()
    order = NumberField()
    created_at = TimestampField()

    index_by_order = GlobalSecondaryIndex(
        index_name='order_index',
        key_schema={
            'column_id': StringField(partition_key=True),
            'order': NumberField(sort_key=True)
        }
    )
