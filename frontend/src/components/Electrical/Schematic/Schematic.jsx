import { useCallback, useRef, useEffect, useReducer } from 'react';

// Material-UI
import { Paper } from '@mui/material';

// Custom libraries
import { SelectionArea, Component, Connection, Node } from '../index';
import { snapValueToGrid } from '../../../util';
import { useGlobalRefMap } from '../../../hooks';

export function Schematic({
  schematic,
  selection,
  width,
  height,
  readOnly,
  gridSize,
  style,
  children,
  ...rest
}) {
  const refMap = useGlobalRefMap();
  const canvasRef = useRef();

  // Work-around for react-xarrows updating the connection.
  const [, reRender] = useReducer(() => ({}), {});
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    if (renderCount.current === 2) {
      reRender();
      renderCount.current = 0;
    }
  });

  /**
   * Update the coordinates of a Component.
   *
   * @param {String} id The id of the element that is dragged.
   * @param {Object} position The new coordinates of the element.
   * @param {Boolean} isLabel If you want to update the label's coordinates
   */
  const updatePosition = useCallback(
    (id, { x, y }, isLabel = false) => {
      // Snap the values to the grid
      x = snapValueToGrid(x ?? 0, gridSize ?? 10);
      y = snapValueToGrid(y ?? 0, gridSize ?? 10);

      // Apply the new position
      schematic.editById(id, (elem) => {
        const positionObject = isLabel ? elem.label.position : elem.position;
        positionObject.x = x;
        positionObject.y = y;
        return elem;
      });
    },
    [schematic, gridSize],
  );

  return (
    <Paper
      className='schematic'
      ref={canvasRef}
      elevation={3}
      sx={{
        width: '80%',
        height: '80%',
        position: 'relative',
        zIndex: 0,

        // Grid pattern
        backgroundSize: `${gridSize ?? 10}px ${gridSize ?? 10}px`,
        backgroundImage: `radial-gradient(circle, #0007 1px, transparent 1px)`,

        // Border styling
        boxShadow: '0px 0px 8px #0003',
        borderRadius: `${2 * (gridSize ?? 10)}px`,
      }}
      {...rest}
    >
      {children}

      <SelectionArea
        parentRef={canvasRef}
        selectableItems={schematic.items}
        setSelectedItems={selection?.setSelectedItems}
        disabled={readOnly}
      />

      {schematic?.data?.components?.map((comp) => {
        const portsRefMap = new Map();
        comp.ports.forEach((port) => {
          portsRefMap.set(port.id, refMap.set(port.id));
        });

        return (
          <Component
            key={comp.id}
            ref={refMap.set(comp.id)}
            canvasRef={canvasRef}
            portsRefMap={portsRefMap}
            gridSize={gridSize}
            updatePosition={updatePosition}
            reRender={reRender}
            isSelected={selection?.selectedItems.has(comp.id)}
            disabled={readOnly}
            {...comp}
          />
        );
      })}

      {schematic?.data?.nodes?.map((node) => (
        <Node
          {...node}
          key={node.id}
          ref={refMap.set(node.id)}
          gridSize={gridSize}
          updatePosition={updatePosition}
          reRender={reRender}
          isSelected={selection?.selectedItems.has(node.id)}
          disabled={readOnly}
        />
      ))}

      {schematic?.data?.connections?.map(
        (conn) =>
          conn.start &&
          conn.end && (
            <Connection
              {...conn}
              key={conn.id}
              ref={refMap.set(conn.id)}
              start={refMap.set(conn.start)}
              end={refMap.set(conn.end)}
              isSelected={selection?.selectedItems.has(conn.id)}
              disabled={readOnly}
            />
          ),
      )}
    </Paper>
  );
}
