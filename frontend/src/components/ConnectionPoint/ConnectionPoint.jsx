import { Box } from '@mui/material';

import { useGlobalRefMap } from '../../hooks';
import { getDragHandleId } from '../../util';

export function ConnectionPoint({
  circular,
  color,
  id,
  isDragging,
  radius,
  sx,
  ...rest
}) {
  const refMap = useGlobalRefMap(id);
  const dragHandleId = getDragHandleId(id);

  return (
    <Box
      {...rest}
      ref={refMap.get(dragHandleId)}
      sx={{
        backgroundColor: color,
        borderRadius: circular && '50%',
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'auto',

        position: 'relative',
        left: -radius,
        top: -radius,
        width: radius * 2,
        height: radius * 2,
        ...sx,
      }}
    >
      <Box
        ref={refMap.get(id)}
        sx={{
          position: 'absolute',
          left: 'calc(50% - 1px)',
          top: 'calc(50% - 1px)',
          width: 2,
          height: 2,
        }}
      />
    </Box>
  );
}
