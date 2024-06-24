import React, { useState, useEffect }  from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@material-tailwind/react';

import Column from './Column';
import { GET_COLUMNS, CREATE_COLUMN, UPDATE_COLUMNS_POSITIONS } from '../graphql';


const Board = () => {
  const {loading, error, data} = useQuery(GET_COLUMNS);
  const [createColumn, { loading: isCreating}] = useMutation(CREATE_COLUMN);
  const [updatePositions] = useMutation(UPDATE_COLUMNS_POSITIONS);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (data) {
      setColumns(data.columns);
    }
  }, [data]);

  const handleCreate = async () => {
    await createColumn({
      variables: { title: 'New Column' },
      update: (cache, { data: { createColumn } }) => {
        const { columns } = cache.readQuery({ query: GET_COLUMNS });
        cache.writeQuery({
          query: GET_COLUMNS,
          data: { columns: columns.concat([createColumn]) },
        });
      },
    });
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination || result.type !== 'COLUMN') return;

    const reorderedItems = Array.from(data.columns);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    // Update local state for immediate UI update
    setColumns(reorderedItems);

    // Update positions
    const updatedItems = reorderedItems.map((item, index) => ({
      id: item.id,
      position: Number(index),
    }));

    // Submit and update cache
    await updatePositions({
      variables: { items: updatedItems },
      update: (cache) => {
        cache.writeQuery({
          query: GET_COLUMNS,
          data: { columns: reorderedItems },
        });
      },
    });
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
            ref={provided.innerRef} {...provided.droppableProps}
            className="grid grid-cols-4 gap-4 overflow-x-scroll p-4"
          >
            {columns.map((column, index) => (
              <Draggable key={column.id} draggableId={column.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <Column column={column} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <Button className="w-auto h-14" variant="outlined" onClick={handleCreate} disabled={isCreating} fullWidth>
              Add Column
            </Button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;
