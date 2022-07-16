import { isFunction } from 'lodash';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useXarrow } from 'react-xarrows';
import Draggable from 'react-draggable';
import Vector from 'victor';

import { Box } from '@mui/material';

import { constants } from '../../constants';
import { SchematicContext } from '../../contexts';
import { DraggableType } from '../../enums';
import { snapPosToGrid } from '../../util';

const gridSize = constants.DEFAULT_GRID_SIZE;

export function DraggableComponent({
  children,
  handle,
  id,
  isDragging,
  isHandle,
  onDrag,
  onStart,
  onStop,
  owner,
  selectedItems,
  sx,
  type,
  ...rest
}) {
  const draggableRef = useRef();
  const updateXarrow = useXarrow();

  const { data: schematic, editById, itemsMap } = useContext(SchematicContext);
  const [startSchematic, setStartSchematic] = useState(schematic);
  const [startItemsMap, setStartItemsMap] = useState(itemsMap);

  const [originalPosition, setOriginalPosition] = useState(new Vector());
  const [dragDirection, setDragDirection] = useState(new Vector());

  const selectedIds = useMemo(
    () => [...new Set([id, ...(selectedItems ?? [])])],
    [id, selectedItems],
  );

  const calcMovedElement = useCallback(
    (element, direction) => {
      const originalElement = startItemsMap[element.id];
      const originalPosition = Vector.fromObject(originalElement?.position);
      const newPosition = originalPosition.add(direction);

      return newPosition.toObject();
    },
    [startItemsMap],
  );

  const genericMove = useCallback(
    (calcMovedElement, ids, pos, options) =>
      editById(
        ids,
        (element) => {
          const position = isFunction(pos) ? pos(element) : pos;
          const snappedPosition = snapPosToGrid(position);

          return calcMovedElement(element, snappedPosition);
        },
        options,
      ),
    [editById],
  );

  const moveItem = useCallback(
    ({ save } = {}) =>
      genericMove(
        (element, newPosition) => ({
          ...element,
          position: { ...element?.position, ...newPosition },
          label: {
            ...element?.label,
            position: {
              ...element?.label?.position,
              x:
                element?.label?.position.x +
                newPosition?.x -
                element?.position?.x,
              y:
                element?.label?.position.y +
                newPosition?.y -
                element?.position?.y,
            },
          },
        }),
        selectedIds,
        (element) => calcMovedElement(element, dragDirection),
        { startSchematic, save },
      ),
    [calcMovedElement, dragDirection, genericMove, selectedIds, startSchematic],
  );

  const moveLabel = useCallback(
    (position, { save } = {}) =>
      genericMove(
        (element, newPosition) => ({
          ...element,
          label: {
            ...element?.label,
            position: { ...element.label.position, ...newPosition },
          },
        }),
        [owner],
        position,
        { startSchematic, save },
      ),
    [genericMove, owner, startSchematic],
  );

  const moveVertex = useCallback(
    (position, { save } = {}) =>
      genericMove(
        (connection, newPosition) => ({
          ...connection,
          vertices: connection?.vertices?.map((vertex) =>
            vertex?.id === id ? { ...vertex, position: newPosition } : vertex,
          ),
        }),
        [owner],
        position,
        { startSchematic, save, context: { vertexId: id } },
      ),
    [id, genericMove, owner, startSchematic],
  );

  const itemHandlers = useMemo(
    () => ({
      onDrag: (_e, { x, y }) => {
        onDrag?.();
        updateXarrow();

        const dragPosition = new Vector(x, y);
        const dragDirection = dragPosition.subtract(originalPosition);

        setDragDirection(dragDirection);
        moveItem({ save: false });
      },

      onStart: () => {
        onStart?.();

        setDragDirection(new Vector());
        setOriginalPosition(Vector.fromObject(itemsMap[id].position));
        setStartItemsMap(itemsMap);
        setStartSchematic(schematic);
      },

      onStop: () => {
        onStop?.();
        moveItem({ save: true });
      },
    }),
    [
      id,
      itemsMap,
      moveItem,
      onDrag,
      onStart,
      onStop,
      originalPosition,
      schematic,
      updateXarrow,
    ],
  );

  const labelHandlers = useMemo(
    () => ({
      onDrag: (_e, { x, y }) => {
        onDrag?.();
        updateXarrow();

        moveLabel({ x, y }, { save: false });
      },

      onStart: () => {
        onStart?.();

        setStartSchematic(schematic);
      },

      onStop: (_e, { x, y }) => {
        onStop?.();

        moveLabel({ x, y }, { save: true });
      },
    }),
    [moveLabel, onDrag, onStart, onStop, schematic, updateXarrow],
  );

  const vertexHandlers = useMemo(
    () => ({
      onDrag: (_e, { x, y }) => {
        onDrag?.();
        updateXarrow();

        moveVertex({ x, y }, { save: false });
      },

      onStart: () => {
        onStart?.();

        setStartSchematic(schematic);
      },

      onStop: (_e, { x, y }) => {
        onStop?.();

        moveVertex({ x, y }, { save: true });
      },
    }),
    [moveVertex, onDrag, onStart, onStop, schematic, updateXarrow],
  );

  const moveHandlers = useMemo(() => {
    switch (type) {
      case DraggableType.COMPONENT:
      case DraggableType.NODE:
        return itemHandlers;

      case DraggableType.LABEL:
        return labelHandlers;

      case DraggableType.VERTEX:
        return vertexHandlers;

      default:
        return {};
    }
  }, [itemHandlers, labelHandlers, type, vertexHandlers]);

  return (
    <Draggable
      bounds='.schematic'
      grid={[gridSize, gridSize]}
      handle={handle}
      nodeRef={draggableRef}
      positionOffset={{ x: 5, y: 5 }}
      {...moveHandlers}
      {...rest}
    >
      <Box
        ref={draggableRef}
        sx={{
          position: 'absolute',
          userSelect: 'none',
          top: 0,
          left: 0,
          ...sx,
        }}
      >
        {children}
      </Box>
    </Draggable>
  );
}
