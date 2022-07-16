import { useMemo } from 'react';

import { ConnectionPoint } from '..';
import { constants } from '../../constants';
import { rotateCoords } from '../../util';

export function Port({
  id,
  connection,
  position,
  bounds,
  properties,
  rotation,
  ...rest
}) {
  const realPos = useMemo(
    () => rotateCoords(position, rotation),
    [position, rotation],
  );

  const color = useMemo(() => {
    let color = properties?.color ?? constants.DEFAULT_PORT_COLOR;

    if (!connection) {
      color = constants.ERROR_COLOR;
    }

    return color;
  }, [connection, properties?.color]);

  const radius = properties?.radius ?? constants.DEFAULT_PORT_RADIUS;

  return (
    <ConnectionPoint
      circular
      color={color}
      id={id}
      radius={radius}
      sx={{
        position: 'absolute',
        left: realPos.x * bounds?.width - radius,
        top: realPos.y * bounds?.height - radius,
      }}
      {...rest}
    />
  );
}
