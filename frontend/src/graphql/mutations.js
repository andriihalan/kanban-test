import { gql } from '@apollo/client';


export const ADD_CARD = gql`
  mutation AddCard($columnId: String!, $title: String!) {
    addCard(columnId: $columnId, title: $title) {
      card {
        id
        columnId
        title
        description
        position
      }
    }
  }
`;


export const REMOVE_CARD = gql`
  mutation RemoveCard($columnId: String!, $cardId: String!) {
    removeCard(columnId: $columnId, cardId: $cardId) {
      success
    }
  }
`;


export const UPDATE_CARD = gql`
  mutation UpdateCard($columnId: String!, $cardId: String!, $title: String, $description: String) {
    updateCard(columnId: $columnId, cardId: $cardId, title: $title, description: $description) {
      card {
        id
        title
        description
      }
    }
  }
`;


export const UPDATE_CARDS_POSITIONS = gql`
  mutation UpdateCardsPositions($items: [CardPositionType!]!) {
    updateCardsPositions(items: $items)  {
      success
    }
  }
`;

export const CREATE_COLUMN = gql`
  mutation CreateColumn($title: String!) {
    createColumn(title: $title) {
      column {
        id
        title
        position
      }
    }
  }
`;


export const UPDATE_COLUMN = gql`
  mutation UpdateColumn($id: String!, $title: String) {
    updateColumn(id: $id, title: $title) {
      column {
        id
        title
      }
    }
  }
`;

export const UPDATE_COLUMNS_POSITIONS = gql`
  mutation UpdateColumnsPositions($items: [ColumnPositionType!]!) {
    updateColumnsPositions(items: $items)  {
      success
    }
  }
`;

export const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: String!) {
    deleteColumn(id: $id) {
      success
    }
  }
`;
