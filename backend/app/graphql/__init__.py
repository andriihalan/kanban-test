import graphene

from app.models import Column, Card
from .mutations import (
    CreateColumn,
    UpdateColumn,
    DeleteColumn,
    AddCard,
    RemoveCard,
    UpdateCard,
    UpdateColumnsPositions,
    UpdateCardsPositions
)
from .schemas import ColumnType, CardType


class Query(graphene.ObjectType):
    columns = graphene.List(ColumnType)
    cards = graphene.List(CardType, column_id=graphene.String())

    def resolve_columns(self, info):
        manager = Column.get_manager()
        columns = sorted(manager.all(), key=lambda x: x.position)

        card_manager = Card.get_manager()
        for column in columns:
            column.cards = card_manager.query(
                index_name='position_index',
                column_id=column.id,
                sort_ascending=True
            )

        return columns

    def resolve_cards(self, info, column_id):
        manager = Card.get_manager()
        return manager.query(
            index_name='position_index',
            column_id=column_id,
            sort_ascending=True
        )


class Mutation(graphene.ObjectType):
    create_column = CreateColumn.Field()
    update_column = UpdateColumn.Field()
    delete_column = DeleteColumn.Field()
    update_columns_positions = UpdateColumnsPositions.Field()
    add_card = AddCard.Field()
    remove_card = RemoveCard.Field()
    update_card = UpdateCard.Field()
    update_cards_positions = UpdateCardsPositions.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
