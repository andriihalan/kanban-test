import graphene


class CardType(graphene.ObjectType):
    id = graphene.ID()
    column_id = graphene.ID()
    title = graphene.String()
    description = graphene.String()
    position = graphene.Int()
    created_at = graphene.String()


class ColumnType(graphene.ObjectType):
    id = graphene.ID()
    title = graphene.String()
    position = graphene.Int()
    created_at = graphene.String()
    cards = graphene.List(CardType)


class ColumnPositionType(graphene.InputObjectType):
    id = graphene.String(required=True)
    position = graphene.Int(required=True)


class CardPositionType(graphene.InputObjectType):
    column_id = graphene.String(required=True)
    previous_column_id = graphene.String()
    id = graphene.String(required=True)
    position = graphene.Int(required=True)
