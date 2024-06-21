from datetime import datetime


class DynamoField:
    def __init__(self, attribute_type, partition_key=False, sort_key=False, default=None):
        self.attribute_type = attribute_type
        self.partition_key = partition_key
        self.sort_key = sort_key
        self.default = default


class StringField(DynamoField):
    def __init__(self, **kwargs):
        super().__init__('S', **kwargs)


class NumberField(DynamoField):
    def __init__(self, **kwargs):
        super().__init__('N', **kwargs)


class TimestampField(StringField):
    def __init__(self, **kwargs):
        super().__init__(default=self._get_timestamp, **kwargs)

    def _get_timestamp(self):
        return datetime.utcnow().isoformat()
