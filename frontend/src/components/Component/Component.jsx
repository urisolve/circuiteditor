import { Avatar } from '@mui/material';

import {
  ContextMenu,
  DraggableComponent,
  Label,
  Port,
  PropertiesMenu,
} from '..';
import {
  useBoolean,
  useContextMenu,
  useGlobalRefMap,
  useDoubleTap,
  usePropertiesMenu,
} from '../../hooks';
import { symbols } from '../../assets/electrical';
import { DraggableType } from '../../enums';

export function Component({
  schematicRef,
  id,
  type,
  position,
  ports,
  label,
  properties,
  width,
  height,
  isSelected,
  selectedItems,
  ...rest
}) {
  const contextMenu = useContextMenu();
  const propertiesMenu = usePropertiesMenu();

  const holdHandlers = useDoubleTap(contextMenu.open);
  const isDragging = useBoolean(false);
  const refMap = useGlobalRefMap(id);

  return (
    <DraggableComponent
      handle='.handle'
      id={id}
      onStart={isDragging.on}
      onStop={isDragging.off}
      position={position}
      selectedItems={selectedItems}
      type={DraggableType.COMPONENT}
      {...rest}
    >
      <Avatar
        alt={type}
        className='handle'
        {...holdHandlers}
        onContextMenu={contextMenu.open}
        onDoubleClick={() => propertiesMenu.openTab(0)}
        ref={refMap.get(id)}
        src={symbols[type]}
        sx={{
          cursor: isDragging.value ? 'grabbing' : 'grab',
          filter: isSelected && `drop-shadow(3px 2px 0px #888)`,
          height: height ?? 100,
          pointerEvents: 'auto',
          transform: `rotate(${position?.angle ?? 0}deg)`,
          width: width ?? 100,
        }}
        variant='square'
      />

      {ports?.map((port) => {
        return (
          <Port
            key={port.id}
            bounds={{ width: width ?? 100, height: height ?? 100 }}
            rotation={position?.angle ?? 0}
            {...port}
            {...rest}
          />
        );
      })}

      {label && (
        <Label
          schematicRef={schematicRef}
          onDoubleClick={() => propertiesMenu.openTab(1)}
          {...label}
        />
      )}

      <ContextMenu
        id={id}
        openProperties={() => propertiesMenu.openTab(0)}
        {...contextMenu}
      />

      <PropertiesMenu
        contextKey='components'
        id={id}
        label={label}
        properties={properties}
        menu={propertiesMenu}
      />
    </DraggableComponent>
  );
}
