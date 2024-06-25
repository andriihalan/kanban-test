import React, { useState } from 'react'
import { useMutation } from '@apollo/client';
import { Button, Input } from '@material-tailwind/react';

import { ADD_CARD, GET_COLUMNS } from '../graphql';


const AddCardAction = ({columnId}) => {
  const [createCard, {loading}] = useMutation(ADD_CARD);

  const [editable, setEditable] = useState(false)
  const [title, setTitle] = useState('')


  const handleAddCard = async () => {
    if (!title) {
      setEditable(false);
      return;
    }

    await createCard({
      variables: {
        columnId: columnId,
        title: title,
      },
      update: (cache, {data: {addCard}}) => {
        const {columns} = cache.readQuery({
          query: GET_COLUMNS,
        });
        const updatedColumns = columns.map(column => {
          if (column.id === columnId) {
            return {
              ...column,
              cards: [...column.cards, addCard],
            };
          }
          return column;
        });
        cache.writeQuery({
          query: GET_COLUMNS,
          data: {
            columns: updatedColumns,
          },
        });
      },
    });
    setTitle('');
    setEditable(false);
  };

  return (
    <>
      {editable && (
        <div className="bg-white px-4 pb-2 rounded-md shadow-sm mb-4">
          <Input
            value={title}
            variant="static"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleAddCard}
            placeholder="Enter a title for this card"
            disabled={loading}
            autoFocus
          />
        </div>
      )}
      <Button onClick={() => setEditable(true)} variant="outlined" size="sm" fullWidth>
        Add Card
      </Button>
    </>
  )
}

export default AddCardAction;
