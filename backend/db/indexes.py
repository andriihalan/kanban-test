class GlobalSecondaryIndex:
    def __init__(self, index_name, key_schema, projection_type='ALL', read_capacity_units=5, write_capacity_units=5):
        self.index_name = index_name
        self.key_schema = key_schema
        self.projection_type = projection_type
        self.read_capacity_units = read_capacity_units
        self.write_capacity_units = write_capacity_units
