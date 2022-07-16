import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import XArrow from 'react-xarrows';

import { SchematicContext } from '../../contexts';
import { useGlobalRefMap } from '../../hooks';
import { snapPosToGrid } from '../../util';

const NULL_INDEX = -1;

export function ConnectionSegment({
  canvasRef,
  id,
  owner,
  start,
  end,
  properties,
  passProps,
  segments,
  ...rest
}) {
  const refMap = useGlobalRefMap();
  const { editById } = useContext(SchematicContext);

  function getVertexInsertionIndex(segment, vertices) {
    const back = vertices?.findIndex(({ id }) => id === segment?.start);
    const front = vertices?.findIndex(({ id }) => id === segment?.end);

    if (back !== NULL_INDEX) {
      return back + 1;
    }

    if (front !== NULL_INDEX) {
      return front;
    }

    return 0;
  }

  function addVertex(position) {
    editById([owner], (conn) => {
      const { vertices } = conn;

      const segment = segments?.find((segment) => segment?.id === id);
      const vertex = { id: uuidv4(), owner: id, position };
      const index = getVertexInsertionIndex(segment, vertices);

      vertices.splice(index, 0, vertex);

      return { ...conn, vertices };
    });
  }

  function handleAddVertex(event) {
    const { left, top } = canvasRef?.current?.getBoundingClientRect();
    const position = { x: event.clientX - left, y: event.clientY - top };
    const snappedPos = snapPosToGrid(position);

    addVertex(snappedPos);
  }

  const connectionPoints =
    properties?.dashedAnimationSpeed >= 0
      ? { end: refMap.get(end), start: refMap.get(start) }
      : { end: refMap.get(start), start: refMap.get(end) };

  const animation = {
    dashness: properties?.dashed
      ? { animation: properties?.dashedAnimationSpeed }
      : false,
  };

  return (
    <XArrow
      {...properties}
      {...connectionPoints}
      {...animation}
      divContainerStyle={{
        pointerEvents: 'none',
        zIndex: -1,
      }}
      passProps={{
        onClick: handleAddVertex,
        ...passProps,
      }}
      path='straight'
      showHead={false}
      {...rest}
    />
  );
}
