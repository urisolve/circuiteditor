import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Box } from '@mui/material';

import {
  useContextMenu,
  useGlobalRefMap,
  useDoubleTap,
  usePropertiesMenu,
} from '../../hooks';
import {
  ConnectionSegment,
  ContextMenu,
  Label,
  PropertiesMenu,
  Vertex,
} from '..';

export function Connection({
  id,
  start,
  end,
  label,
  properties,
  isSelected,
  schematicRef,
  canvasRef,
  selectedItems,
  vertices,
}) {
  useGlobalRefMap(id);

  const contextMenu = useContextMenu();
  const propertiesMenu = usePropertiesMenu();
  const holdHandlers = useDoubleTap(contextMenu.open);

  const segments = useMemo(() => {
    if (!vertices.length) {
      return [{ id: uuidv4(), start, end }];
    }

    const segments = [];
    let prevVertex = { id: start };

    vertices.forEach((vertex) => {
      segments.push({
        id: uuidv4(),
        owner: id,
        start: prevVertex.id,
        end: vertex.id,
      });

      prevVertex = vertex;
    });

    segments.push({
      id: uuidv4(),
      owner: id,
      start: vertices.at(-1).id,
      end,
    });

    return segments;
  }, [end, id, start, vertices]);

  return (
    <Box sx={{ pointerEvents: 'none' }}>
      {vertices.map((vertex) => (
        <Vertex
          key={vertex.id}
          onOpenProperties={() => propertiesMenu.openTab(0)}
          properties={properties}
          schematicRef={schematicRef}
          isSelected={selectedItems.has(vertex.id)}
          {...vertex}
        />
      ))}

      {segments.map((segment, index) => (
        <ConnectionSegment
          {...segment}
          canvasRef={canvasRef}
          labels={
            index === 0 ? (
              <Label
                schematicRef={schematicRef}
                onDoubleClick={() => propertiesMenu.openTab(1)}
                {...label}
              />
            ) : null
          }
          key={segment.id}
          owner={id}
          passProps={{
            onContextMenu: contextMenu.open,
            onDoubleClick: () => propertiesMenu.openTab(0),
            ...holdHandlers,
          }}
          properties={properties}
          segments={segments}
        />
      ))}

      <ContextMenu
        id={id}
        openProperties={() => propertiesMenu.openTab(0)}
        {...contextMenu}
      />

      <PropertiesMenu
        contextKey='connections'
        id={id}
        label={label}
        properties={properties}
        menu={propertiesMenu}
      />
    </Box>
  );
}
