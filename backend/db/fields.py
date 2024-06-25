from datetime import datetime


class DynamoField:
    def __init__(
        self,
        attribute_type,
        partition_key=False,
        sort_key=False,
        default=None,
        required=False,
    ):
        self.attribute_type = attribute_type
        self.partition_key = partition_key
        self.sort_key = sort_key
        self.default = default
        self.required = required

    def validate(self, fieldname, value):
        if self.required and value is None:
            raise ValueError(f"{fieldname} field is required.")
        return value

    def prep_value_to_db(self, value):
        return value


class StringField(DynamoField):
    def __init__(self, max_length=None, **kwargs):
        super().__init__('S', **kwargs)
        self.max_length = max_length

    def validate(self, fieldname, value):
        value = super().validate(fieldname, value)
        if self.max_length is not None and len(value) > self.max_length:
            raise ValueError(f"{fieldname} field must be at most {self.max_length} characters.")
        return value

    def prep_value_to_db(self, value):
        return value


class NumberField(DynamoField):
    def __init__(self, **kwargs):
        super().__init__('N', **kwargs)

    def validate(self, fieldname, value):
        value = super().validate(fieldname, value)
        if value is not None and not isinstance(value, (int, float)):
            raise ValueError(f"{fieldname} field must be a number.")
        return value

    def prep_value_to_db(self, value):
        if value is not None:
            return int(value)


class TimestampField(StringField):
    def __init__(self, **kwargs):
        super().__init__(default=self._get_timestamp, **kwargs)

    def _get_timestamp(self):
        return datetime.utcnow().isoformat()

    def validate(self, fieldname, value):
        value = super().validate(fieldname, value)
        if value is not None:
            try:
                datetime.fromisoformat(value)
            except ValueError:
                raise ValueError(f"{fieldname} field must be a valid ISO 8601 timestamp.")
        return value
