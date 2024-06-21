import graphene

from app.models import Card
from ..schemas import CardType


class AddCard(graphene.Mutation):
    class Arguments:
        column_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String(required=True)
        order = graphene.Int(required=True)

    card = graphene.Field(lambda: CardType)

    def mutate(root, info, column_id, **card_data):
        card = Card(column_id=column_id, **card_data)
        card = card.save()
        return AddCard(card=card)


class RemoveCard(graphene.Mutation):
    class Arguments:
        card_id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(root, info, card_id):
        manager = Card.get_manager()
        card = manager.get({'id': card_id})

        if card:
            manager.delete_item(id=card_id)
            return RemoveCard(success=True)

        return RemoveCard(success=False)


class UpdateCard(graphene.Mutation):
    class Arguments:
        card_id = graphene.ID(required=True)
        card_data = graphene.String(required=True)

    card = graphene.Field(lambda: CardType)

    def mutate(root, info, card_id, card_data):
        manager = Card.get_manager()
        card = manager.get({'id': card_id})

        for key, value in card_data.items():
            setattr(card, key, value)
        card = manager.save(card)

        return UpdateCard(card=card)


class Mutation(graphene.ObjectType):
    # drag_drop_card = DragDropCard.Field()
    add_card = AddCard.Field()
    remove_card = RemoveCard.Field()
    update_card = UpdateCard.Field()
