import { useMemo } from 'react';

import { Portal, Typography } from '@mui/material';

import { DraggableComponent } from '..';
import { useBoolean, useGlobalRefMap } from '../../hooks';
import { formatLabel } from '../../util';
import { DraggableType } from '../../enums';

export function Label({
  owner,
  id,
  schematicRef,
  position,
  name,
  value,
  unit,
  onDoubleClick,
  isNameHidden,
  isValueHidden,
  ...rest
}) {
  const refMap = useGlobalRefMap(id);
  const isDragging = useBoolean(false);

  const formattedLabel = useMemo(() => {
    let labelArgs = { name, value, unit };

    if (isNameHidden) {
      labelArgs = { ...labelArgs, name: '' };
    }

    if (isValueHidden) {
      labelArgs = { ...labelArgs, value: '', unit: '' };
    }

    return formatLabel(labelArgs);
  }, [isNameHidden, isValueHidden, name, value, unit]);

  return (
    <Portal container={schematicRef.current}>
      <DraggableComponent
        onStart={isDragging.on}
        onStop={isDragging.off}
        owner={owner}
        position={position}
        type={DraggableType.LABEL}
        {...rest}
      >
        <Typography
          onDoubleClick={onDoubleClick}
          ref={refMap.get(id)}
          sx={{
            cursor: isDragging.value ? 'grabbing' : 'grab',
            fontWeight: 'bold',
            lineHeight: '70%',
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {formattedLabel}
        </Typography>
      </DraggableComponent>
    </Portal>
  );
}
