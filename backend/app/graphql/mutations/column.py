import graphene

from app.models import Column, Card
from ..schemas import ColumnType, ColumnPositionType


class CreateColumn(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)

    column = graphene.Field(lambda: ColumnType)

    def mutate(self, info, title):
        last_position = Column.get_last_position()
        column = Column(title=title, position=last_position + 1)
        column = column.save()
        return CreateColumn(column=column)


class UpdateColumn(graphene.Mutation):
    class Arguments:
        id = graphene.String(required=True)
        title = graphene.String()

    column = graphene.Field(lambda: ColumnType)

    def mutate(self, info, id, title=None):
        manager = Column.get_manager()
        manager.update_item(id=id, data={'title': title})
        column = manager.get_item(id=id)
        return UpdateColumn(column=column)


class DeleteColumn(graphene.Mutation):
    class Arguments:
        id = graphene.String(required=True)

    success = graphene.String()

    def mutate(self, info, id):
        manager = Column.get_manager()
        manager.delete_item(id=id)

        manager = Card.get_manager()
        for card in manager.query(column_id=id):
            manager.delete_item(id=card.id, column_id=card.column_id)

        return DeleteColumn(success=True)


class UpdateColumnsPositions(graphene.Mutation):
    class Arguments:
        items = graphene.List(ColumnPositionType)

    success = graphene.Boolean()

    def mutate(self, info, items):
        manager = Column.get_manager()
        for item in items:
            manager.update_item(id=item.id, data={'position': item.position})
        return UpdateColumnsPositions(success=True)
