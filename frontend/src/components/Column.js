import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Card as MTCard, CardBody, CardFooter, IconButton, Input, Typography } from '@material-tailwind/react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';

import { DELETE_COLUMN, UPDATE_COLUMN, UPDATE_CARDS_POSITIONS, GET_CARDS, GET_COLUMNS } from '../graphql';
import AddCardAction from './AddCard';
import Card from './Card';


const Column = ({ column }) => {
  const {data} = useQuery(GET_CARDS, {
    variables: {columnId: column.id},
  });
  const [deleteColumn] = useMutation(DELETE_COLUMN);
  const [updateColumn] = useMutation(UPDATE_COLUMN);
  const [updateCardPositions] = useMutation(UPDATE_CARDS_POSITIONS);

  const [cards, setCards] = useState([]);
  const [title, setTitle] = useState(column.title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setCards(data.cards);
    }
  }, [data]);


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
      variables: { id: column.id, title },
      update: (cache) => {
        const { columns } = cache.readQuery({ query: GET_COLUMNS });
        const updatedColumns = columns.map(c =>
          c.id === column.id ? { ...c, title } : c
        );
        cache.writeQuery({
          query: GET_COLUMNS,
          data: { columns: updatedColumns },
        });
      },
    });
    setIsEditing(false);
  };

 const onDragEnd = async (result) => {
   const {destination, source, draggableId, type} = result;
   if (!destination || type !== 'CARD') return;

   const reorderedCards = Array.from(cards);

   const [reorderedCard] = reorderedCards.splice(source.index, 1);
   reorderedCards.splice(destination.index, 0, reorderedCard);

   // Update local state for immediate UI update
   setCards(reorderedCards);

   // Update positions on server
   const updatedItems = reorderedCards.map((item, index) => ({
     id: item.id,
     columnId: item.columnId,
     position: index,
   }));

   await updateCardPositions({
     variables: {items: updatedItems},
     update: (cache) => {
       cache.writeQuery({
         query: GET_CARDS,
         variables: {columnId: column.id},
         data: {
           cards: reorderedCards,
         },
       });
     },
   });
 };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={column.id} type="CARD">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="w-full shadow-md">
            <MTCard key={column.id} isDragging={snapshot.isDragging} className="bg-gray-100">
              <CardBody className="p-4 space-y-4">
                <div className="flex justify-between items-center">
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


                {cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <Card card={card} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </CardBody>
              <CardFooter className="pt-0 w-full px-4">
                <AddCardAction columnId={column.id} />
              </CardFooter>
            </MTCard>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Column;
