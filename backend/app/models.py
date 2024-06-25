from uuid import uuid4
from db import DynamoModel, StringField, NumberField, GlobalSecondaryIndex, TimestampField


class Column(DynamoModel):
    table_name = 'columns'

    id = StringField(partition_key=True, default=lambda: str(uuid4()))
    position = NumberField()
    title = StringField(required=True, max_length=120)
    created_at = TimestampField()

    def __repr__(self):
        return f'<Column {self.id}>'

    def __str__(self):
        return f'Column #{self.position}: {self.title}'

    @classmethod
    def get_last_position(cls):
        columns = cls.get_manager().all()
        if columns:
            last_column = max(columns, key=lambda column: int(column.position))
            return int(last_column.position)
        return 0


class Card(DynamoModel):
    table_name = 'cards'

    column_id = StringField(partition_key=True)
    id = StringField(sort_key=True, default=lambda: str(uuid4()))
    title = StringField(required=True, max_length=120)
    description = StringField(default=str)
    position = NumberField(required=True)
    created_at = TimestampField()

    index_by_position = GlobalSecondaryIndex(
        index_name='position_index',
        key_schema={
            'column_id': StringField(partition_key=True),
            'position': NumberField(sort_key=True)
        }
    )

    def __repr__(self):
        return f'<Card {self.id}>'

    def __str__(self):
        return f'Card #{self.position}: {self.title}'

    @classmethod
    def get_last_position(cls, column_id):
        manager = cls.get_manager()
        cards = manager.query(
            column_id=column_id,
            index_name='position_index',
            sort_ascending=False
        )
        if cards:
            return int(cards[0].position)
        return 0
