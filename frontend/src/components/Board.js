import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@material-tailwind/react';

import Column from './Column';
import { GET_COLUMNS, CREATE_COLUMN, UPDATE_COLUMNS_POSITIONS, UPDATE_CARDS_POSITIONS } from '../graphql';


const Board = () => {
  const {loading, error, data} = useQuery(GET_COLUMNS);
  const [createColumn, {loading: isCreating}] = useMutation(CREATE_COLUMN);
  const [updatePositions] = useMutation(UPDATE_COLUMNS_POSITIONS);
  const [updateCardPositions] = useMutation(UPDATE_CARDS_POSITIONS);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (data) {
      setColumns(data.columns);
    }
  }, [data]);

  const handleCreate = async () => {
    await createColumn({
      variables: {title: 'New Column'},
      update: (cache, {data: {createColumn}}) => {
        const {columns} = cache.readQuery({query: GET_COLUMNS});
        cache.writeQuery({
          query: GET_COLUMNS,
          data: {columns: columns.concat([createColumn])},
        });
      },
    });
  };
const handleOnDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;

    if (type === 'COLUMN') {
      const reorderedItems = Array.from(columns);
      const [reorderedItem] = reorderedItems.splice(source.index, 1);
      reorderedItems.splice(destination.index, 0, reorderedItem);

      setColumns(reorderedItems);

      const updatedItems = reorderedItems.map((item, index) => ({
        id: item.id,
        position: index,
      }));

      await updatePositions({
        variables: { items: updatedItems },
        update: (cache) => {
          cache.writeQuery({
            query: GET_COLUMNS,
            data: { columns: reorderedItems },
          });
        },
      });
    } else if (type === 'CARD') {
      const sourceColumnIndex = columns.findIndex(column => column.id === source.droppableId);
      const destinationColumnIndex = columns.findIndex(column => column.id === destination.droppableId);
      const sourceColumn = columns[sourceColumnIndex];
      const destinationColumn = columns[destinationColumnIndex];

      const sourceCards = Array.from(sourceColumn.cards);
      const destinationCards = Array.from(destinationColumn.cards);

      const [movedCard] = sourceCards.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceCards.splice(destination.index, 0, movedCard);
        const newSourceColumn = { ...sourceColumn, cards: sourceCards };
        const newColumns = [...columns];
        newColumns[sourceColumnIndex] = newSourceColumn;
        setColumns(newColumns);
      } else {
        destinationCards.splice(destination.index, 0, { ...movedCard, columnId: destinationColumn.id });
        const newSourceColumn = { ...sourceColumn, cards: sourceCards };
        const newDestinationColumn = { ...destinationColumn, cards: destinationCards };
        const newColumns = [...columns];
        newColumns[sourceColumnIndex] = newSourceColumn;
        newColumns[destinationColumnIndex] = newDestinationColumn;
        setColumns(newColumns);
      }

      const updatedSourceCards = sourceCards.map((item, index) => ({
        id: item.id,
        columnId: sourceColumn.id,
        position: index,
      }));

      const updatedDestinationCards = destinationCards.map((item, index) => ({
        id: item.id,
        columnId: destinationColumn.id,
        position: index,
        ...(
          movedCard.id === item.id
          && movedCard.columnId !== destinationColumn.id
          && {previousColumnId: movedCard.columnId}
        ),
      }));

      await updateCardPositions({
        variables: {
          items: [...updatedSourceCards, ...updatedDestinationCards],
        },
      });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable
        droppableId="board"
        type="COLUMN"
        direction="horizontal"
      >
        {provided => (
          <div
            className="flex gap-4 overflow-x-auto mb-4"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {columns.map((column, index) => (
              <Draggable key={column.id} draggableId={column.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} >
                    <Column key={column.id} column={column} dragHandleProps={provided.dragHandleProps}  />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="w-60 pt-6 h-14 m-auto">
        <Button variant="outlined" onClick={handleCreate} disabled={isCreating} fullWidth>
          Add Column
        </Button>
      </div>
    </DragDropContext>
  );
};

export default Board;
