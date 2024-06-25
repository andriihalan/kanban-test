import { gql } from '@apollo/client';

export const GET_COLUMNS = gql`
  query GetColumns {
    columns {
      id
      title
      position
      cards {
        id
        columnId
        title
        description
        position
      }
    }
  }
`;

export const GET_CARDS = gql`
  query GetCards($columnId: String!) {
    cards(columnId: $columnId) {
      id
      columnId
      title
      description
      position
    }
  }
`;
