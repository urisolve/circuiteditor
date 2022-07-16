import { v4 as uuidv4 } from 'uuid';
import { constants } from '../constants';

const WIRE_CENTER_OFFSET = 50;
const WIRE_DEFAULT_CENTER = {
  x: WIRE_CENTER_OFFSET,
  y: WIRE_CENTER_OFFSET,
};

export const Wire = ({ x, y } = WIRE_DEFAULT_CENTER) => {
  const [id1, id2] = [uuidv4(), uuidv4()];

  return {
    type: 'Wire',
    fullName: 'Wire',
    components: [],
    connections: [
      {
        start: id1,
        end: id2,
        label: {
          isValueHidden: true,
          isNameHidden: true,
        },
        properties: {
          dashedAnimationSpeed: constants.DEFAULT_DASHED_ANIMATION_SPEED,
          color: constants.DEFAULT_WIRE_COLOR,
          dashed: false,
          strokeWidth: constants.DEFAULT_STROKE_WIDTH,
          vertexRadius: constants.DEFAULT_VERTEX_RADIUS,
        },
        vertices: [],
      },
    ],
    nodes: [
      {
        id: id1,
        label: {
          unit: 'V',
          isValueHidden: true,
        },
        position: {
          x: x - WIRE_CENTER_OFFSET,
          y: y - WIRE_CENTER_OFFSET,
        },
        properties: {
          color: constants.DEFAULT_WIRE_COLOR,
          radius: constants.DEFAULT_NODE_RADIUS,
        },
      },
      {
        id: id2,
        label: {
          unit: 'V',
          isValueHidden: true,
        },
        position: {
          x: x + WIRE_CENTER_OFFSET,
          y: y + WIRE_CENTER_OFFSET,
        },
        properties: {
          color: constants.DEFAULT_WIRE_COLOR,
          radius: constants.DEFAULT_NODE_RADIUS,
        },
      },
    ],
  };
};
