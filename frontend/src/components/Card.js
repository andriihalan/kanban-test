import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea
} from '@material-tailwind/react'

import { UPDATE_CARD, REMOVE_CARD, GET_CARDS } from '../graphql';


const Card = ({card}) => {
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
        const {cards} = cache.readQuery({
          query: GET_CARDS,
          variables: {columnId: card.columnId},
        });
        cache.writeQuery({
          query: GET_CARDS,
          variables: {columnId: card.columnId},
          data: {
            cards: cards.filter(c => c.id !== card.id),
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
        const {cards} = cache.readQuery({
          query: GET_CARDS,
          variables: {columnId: card.columnId},
        });
        const updatedCards = cards.map(c =>
          c.id === card.id ? {...c, title, description} : c
        );
        cache.writeQuery({
          query: GET_CARDS,
          variables: {columnId: card.columnId},
          data: {cards: updatedCards},
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
    <div className="bg-white p-4 rounded-md shadow-sm mb-4">
      <h3 className="text-md font-medium cursor-pointer" onClick={handleToggle}>
        {card.title}
      </h3>

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
    </div>
  );
};

export default Card;
