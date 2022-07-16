import { useContext } from 'react';
import { Xwrapper } from 'react-xarrows';

import { Box, Paper } from '@mui/material';

import { SelectionArea, Component, Connection, Node } from '..';
import { SchematicContext } from '../../contexts';
import { constants } from '../../constants';
import { useForceUpdate } from '../../hooks';

const gridSize = constants.DEFAULT_GRID_SIZE;

export function Schematic({
  canvasRef,
  schematicRef,
  selection,
  width,
  height,
  style,
  children,
  ...rest
}) {
  const {
    data: schematic,
    selection: { selectedItems, setSelectedItems },
  } = useContext(SchematicContext);

  useForceUpdate();

  return (
    <Xwrapper>
      <Paper
        className='schematic'
        elevation={3}
        onContextMenu={(e) => e.preventDefault()}
        ref={canvasRef}
        sx={{
          height: constants.CANVAS_RELATIVE_SIZE,
          width: constants.CANVAS_RELATIVE_SIZE,

          position: 'relative',
          zIndex: 0,

          // Grid pattern
          backgroundImage: `radial-gradient(circle, #0007 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
        {...rest}
      >
        <Box
          ref={schematicRef}
          sx={{ width: 1, height: 1, pointerEvents: 'none' }}
        >
          {children}

          {schematic?.components?.map((comp) => (
            <Component
              {...comp}
              isSelected={selectedItems.has(comp.id)}
              key={comp.id}
              selectedItems={selectedItems}
              schematicRef={schematicRef}
            />
          ))}

          {schematic?.nodes?.map((node) => (
            <Node
              {...node}
              isSelected={selectedItems.has(node.id)}
              key={node.id}
              schematicRef={schematicRef}
              selectedItems={selectedItems}
            />
          ))}

          {schematic?.connections?.map(
            (conn) =>
              conn.start &&
              conn.end && (
                <Connection
                  {...conn}
                  canvasRef={canvasRef}
                  isSelected={selectedItems.has(conn.id)}
                  key={conn.id}
                  schematicRef={schematicRef}
                  selectedItems={selectedItems}
                />
              ),
          )}

          <SelectionArea
            parentRef={canvasRef}
            setSelectedItems={setSelectedItems}
          />
        </Box>
      </Paper>
    </Xwrapper>
  );
}
