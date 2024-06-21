import graphene

from app.models import Column
from ..schemas import ColumnType


class CreateColumn(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        order = graphene.Int(required=True)

    column = graphene.Field(lambda: ColumnType)

    def mutate(self, info, title, order):
        manager = Column(title=title, order=order)
        column = manager.save()
        return CreateColumn(column=column)


class UpdateColumn(graphene.Mutation):
    class Arguments:
        id = graphene.String(required=True)
        title = graphene.String()
        order = graphene.Int()

    column = graphene.Field(lambda: ColumnType)

    def mutate(self, info, id, title=None, order=None):
        manager = Column.get_manager()

        manager.update(key={'id': id}, title=title, order=order)
        column = manager.get({'id': id})

        return UpdateColumn(column=column)


class DeleteColumn(graphene.Mutation):
    class Arguments:
        id = graphene.String(required=True)

    success = graphene.String()

    def mutate(self, info, id):
        manager = Column.get_manager()
        manager.delete_item(id=id)
        return DeleteColumn(success="Column deleted successfully")
