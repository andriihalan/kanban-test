import graphene

from app.models import Card
from ..schemas import CardType, CardPositionType


class AddCard(graphene.Mutation):
    class Arguments:
        column_id = graphene.String(required=True)
        title = graphene.String(required=True)
        description = graphene.String()

    card = graphene.Field(lambda: CardType)

    def mutate(root, info, column_id, **card_data):
        position = Card.get_last_position(column_id=column_id)
        card = Card(column_id=column_id, position=position + 1, **card_data)
        card = card.save()
        return AddCard(card=card)


class RemoveCard(graphene.Mutation):
    class Arguments:
        column_id = graphene.String(required=True)
        card_id = graphene.String(required=True)

    success = graphene.Boolean()

    def mutate(root, info, column_id, card_id):
        manager = Card.get_manager()
        card = manager.get_item(column_id=column_id, id=card_id)
        if card:
            manager.delete_item(column_id=column_id, id=card_id)
            return RemoveCard(success=True)
        return RemoveCard(success=False)


class UpdateCard(graphene.Mutation):
    class Arguments:
        column_id = graphene.String(required=True)
        card_id = graphene.String(required=True)
        title = graphene.String()
        description = graphene.String()

    card = graphene.Field(lambda: CardType)

    def mutate(root, info, column_id, card_id, **card_data):
        manager = Card.get_manager()
        manager.update_item(column_id=column_id, id=card_id, data=card_data)
        card = manager.get_item(column_id=column_id, id=card_id)
        return UpdateCard(card=card)


class UpdateCardsPositions(graphene.Mutation):
    class Arguments:
        items = graphene.List(CardPositionType)

    success = graphene.Boolean()

    def mutate(self, info, items):
        manager = Card.get_manager()

        for item in items:
            if item.previous_column_id:
                old_key = {
                    'column_id': item.previous_column_id,
                    'id': item.id
                }
                card = manager.get_item(**old_key)
                new_item_data = card.serialize()
                new_item_data['column_id'] = item.column_id
                manager.replace_item(
                    old_key=old_key,
                    new_item_data=new_item_data
                )
            else:
                manager.update_item(
                    id=item.id,
                    column_id=item.column_id,
                    data={'position': item.position}
                )
        return UpdateCardsPositions(success=True)
