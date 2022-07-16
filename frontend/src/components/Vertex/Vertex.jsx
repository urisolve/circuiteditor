import { ConnectionPoint, ContextMenu, DraggableComponent } from '..';
import { useBoolean, useContextMenu, useDoubleTap } from '../../hooks';
import { DraggableType } from '../../enums';
import { shadeColor } from '../../util';
import { useMemo } from 'react';

export function Vertex({
  id,
  isSelected,
  onOpenProperties,
  owner,
  position,
  properties,
  schematicRef,
  ...rest
}) {
  const isDragging = useBoolean(false);

  const contextMenu = useContextMenu();
  const holdHandlers = useDoubleTap(contextMenu.open);

  const vertexColor = useMemo(
    () => (isSelected ? shadeColor(properties?.color, -40) : properties?.color),
    [isSelected, properties?.color],
  );

  return (
    <DraggableComponent
      handle='.handle'
      id={id}
      onStart={isDragging.on}
      onStop={isDragging.off}
      owner={owner}
      position={position}
      type={DraggableType.VERTEX}
      {...rest}
    >
      <ConnectionPoint
        {...holdHandlers}
        className='handle'
        color={vertexColor}
        id={id}
        isDragging={isDragging.value}
        onContextMenu={contextMenu.open}
        radius={properties?.vertexRadius}
      />

      <ContextMenu id={id} openProperties={onOpenProperties} {...contextMenu} />
    </DraggableComponent>
  );
}
