import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { Draggable } from 'react-beautiful-dnd';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea
} from '@material-tailwind/react'

import { UPDATE_CARD, REMOVE_CARD, GET_COLUMNS } from '../graphql';


const Card = ({card, index}) => {
  const [deleteCard] = useMutation(REMOVE_CARD);
  const [updateCard] = useMutation(UPDATE_CARD);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
  }, [card]);

  const handleDelete = async () => {
    await deleteCard({
      variables: {
        columnId: card.columnId,
        cardId: card.id,
      },
      update: (cache) => {
        const {columns} = cache.readQuery({
          query: GET_COLUMNS,
        });
        const updatedColumns = columns.map(column => {
          if (column.id === card.columnId) {
            return {
              ...column,
              cards: (column.cards || []).filter(c => c.id !== card.id),
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
    handleClose();
  };

  const handleSave = async () => {
    await updateCard({
      variables: {
        columnId: card.columnId,
        cardId: card.id,
        title,
        description,
      },
      update: (cache) => {
        const {columns} = cache.readQuery({
          query: GET_COLUMNS,
        });
        const updatedColumns = columns.map(column => {
          if (column.id === card.columnId) {
            return {
              ...column,
              cards: (column.cards || []).map(c =>
                c.id === card.id ? {...c, title, description} : c
              ),
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
    handleClose();
  };


  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided) => (
          <div
            className="bg-white p-4 rounded-md shadow-sm mb-4"
            {...provided.draggableProps}
            ref={provided.innerRef}
            {...provided.dragHandleProps}
          >
            <h3 className="text-md font-medium cursor-pointer" onClick={handleToggle}>
              {card.title}
            </h3>
          </div>
        )}
      </Draggable>

      <Dialog size="sm" open={open} handler={handleToggle}>
        <DialogHeader>Edit Card</DialogHeader>
        <DialogBody>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              outline={true}
              required
            />
          </div>
          <div className="mb-4">
            <Textarea
              label="Description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 "
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" size="sm" className="mr-2" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="red" variant="outlined" size="sm" className="mr-2" onClick={handleDelete}>
            Delete
          </Button>
          <Button color="blue" size="sm" className="mr-2" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Card;
