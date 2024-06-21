import graphene


class CardType(graphene.ObjectType):
    id = graphene.ID()
    column_id = graphene.ID()
    title = graphene.String()
    description = graphene.String()
    order = graphene.Int()
    created_at = graphene.String()


class ColumnType(graphene.ObjectType):
    id = graphene.ID()
    title = graphene.String()
    order = graphene.Int()
    created_at = graphene.String()
