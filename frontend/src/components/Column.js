import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Card as MTCard, CardBody, CardFooter, IconButton, Input, Typography } from '@material-tailwind/react';
import { Droppable } from 'react-beautiful-dnd';

import { DELETE_COLUMN, UPDATE_COLUMN, GET_COLUMNS } from '../graphql';
import AddCardAction from './AddCard';
import Card from './Card';


const Column = ({column, dragHandleProps}) => {
  const [deleteColumn] = useMutation(DELETE_COLUMN);
  const [updateColumn] = useMutation(UPDATE_COLUMN);

  const [title, setTitle] = useState(column.title);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    await deleteColumn({
      variables: {id: column.id},
      update: (cache) => {
        const {columns} = cache.readQuery({query: GET_COLUMNS});
        cache.writeQuery({
          query: GET_COLUMNS,
          data: {columns: columns.filter(c => c.id !== column.id)},
        });
      },
    });
  };

  const handleChange = async () => {
    await updateColumn({
      variables: {id: column.id, title},
      update: (cache) => {
        const {columns} = cache.readQuery({query: GET_COLUMNS});
        const updatedColumns = columns.map(c =>
          c.id === column.id ? {...c, title} : c
        );
        cache.writeQuery({
          query: GET_COLUMNS,
          data: {columns: updatedColumns},
        });
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full min-w-80">
      <MTCard key={column.id} className="shadow-md bg-gray-100">
        <CardBody className="p-4 space-y-4">
          <div className="flex justify-between items-center" {...dragHandleProps}>
            {isEditing ? (
              <Input
                value={title}
                variant="static"
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleChange}
                autoFocus
              />
            ) : (
              <>
                <Typography variant="h5" color="blue-gray" className="mb-2" onClick={() => setIsEditing(true)}>
                  {column.title}
                </Typography>
                <IconButton variant="text" onClick={handleDelete}>
                  {'X'}
                </IconButton>
              </>
            )}
          </div>

          <Droppable droppableId={column.id} type="CARD">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {column.cards.map((card, index) => (
                  <Card key={card.id} card={card} index={index}/>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CardBody>
        <CardFooter className="pt-0 w-full px-4">
          <AddCardAction columnId={column.id}/>
        </CardFooter>
      </MTCard>
    </div>
  );
};

export default Column;
