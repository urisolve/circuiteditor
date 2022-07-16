import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, isEqual, isFunction, pick } from 'lodash';

import {
  generateUniqueName,
  isComponent,
  isConnection,
  isGround,
  isNode,
  isSchematic,
  LabelOptions,
  snapPosToGrid,
} from '../../util';
import { constants } from '../../constants';

export function useSchematicTools(setSchematic, history) {
  const getSchematicFromElement = useCallback(
    (elements) =>
      !isSchematic(elements)
        ? { components: [elements], nodes: [], connections: [] }
        : pick(elements, ['components', 'nodes', 'connections']),
    [],
  );

  const applyChanges = useCallback(
    (callback, { startSchematic = null, save = true } = {}) =>
      setSchematic((oldSchematic) => {
        const clonedSchematic = cloneDeep(oldSchematic);
        const modifiedSchematic = callback(clonedSchematic);

        const hasChanges = !isEqual(
          startSchematic ?? oldSchematic,
          modifiedSchematic,
        );

        if (save && hasChanges) {
          history.save(startSchematic ?? oldSchematic);
        }

        return modifiedSchematic;
      }),
    [history, setSchematic],
  );

  const applyDefaults = useCallback(
    (element, schematicKey) => ({
      ...element,

      ...(!isConnection(element) && {
        position: {
          ...snapPosToGrid(element?.position),
          angle: element?.position?.angle ?? 0,
        },
      }),

      ...(isComponent(element) && {
        ports: element?.ports?.map((port) => ({
          id: uuidv4(),
          owner: element?.id,
          ...port,
        })),
      }),

      label: {
        id: uuidv4(),
        owner: element?.id,
        ...element?.label,
        name:
          !isGround(element) &&
          generateUniqueName(
            schematicKey,
            isComponent(element)
              ? LabelOptions.NUMERIC
              : LabelOptions.ALPHABETIC,
            element?.label?.name ?? element?.type,
          ),
        position: {
          x: (element?.position?.x ?? 0) + constants.LABEL_POSITION_OFFSET.x,
          y: (element?.position?.y ?? 0) + constants.LABEL_POSITION_OFFSET.y,
          ...element.label?.position,
        },

        ...(isConnection(element) && {
          vertices: element.vertices ?? [],
        }),

        properties: {
          ...(isConnection(element) && {
            dashedAnimationSpeed: constants.DEFAULT_DASHED_ANIMATION_SPEED,
            color: constants.DEFAULT_WIRE_COLOR,
            dashed: false,
            strokeWidth: constants.DEFAULT_STROKE_WIDTH,
            vertexRadius: constants.DEFAULT_VERTEX_RADIUS,
          }),
          ...(isNode(element) && {
            color: constants.DEFAULT_WIRE_COLOR,
            radius: constants.DEFAULT_NODE_RADIUS,
          }),
          ...element.properties,
        },
      },
    }),
    [],
  );

  const add = useCallback(
    (elements) => {
      const schema = getSchematicFromElement(elements);

      applyChanges(
        (schematic) => {
          Object.entries(schema).forEach(([key, elementArr]) => {
            elementArr.forEach((element) => {
              const elementWithId = { ...element, id: element.id ?? uuidv4() };
              const fullElement = applyDefaults(elementWithId, schematic[key]);

              schematic[key].push(fullElement);
            });
          });

          return schematic;
        },
        { save: true },
      );
    },
    [applyChanges, applyDefaults, getSchematicFromElement],
  );

  const deleteById = useCallback(
    (ids) =>
      applyChanges(
        (schematic) => {
          // Delete each of the corresponding elements
          for (const id of ids) {
            for (const type in schematic) {
              // Find the item
              const elem = schematic[type].find((elem) => elem.id === id);
              const vertex = schematic[type].find(
                ({ vertices }) =>
                  !!vertices?.find((vertex) => vertex.id === id),
              );

              if (!elem && !vertex) {
                continue;
              }

              if (vertex) {
                schematic.connections = schematic.connections.map(
                  (connection) => ({
                    ...connection,
                    vertices: connection.vertices.filter(
                      (vertex) => vertex.id !== id,
                    ),
                  }),
                );

                break;
              }

              // Remove all connections if the element is a node
              if (isNode(elem)) {
                schematic.connections = schematic.connections.filter(
                  (conn) => conn.start !== id && conn.end !== id,
                );
              }

              // Remove all connections to the ports of the component
              else if (isComponent(elem)) {
                for (const port of elem.ports) {
                  schematic.connections = schematic.connections.filter(
                    (conn) => conn.start !== port.id && conn.end !== port.id,
                  );
                }
              }

              // Delete the element with the given id
              schematic[type] = schematic[type].filter(
                (elem) => elem.id !== id,
              );
            }
          }

          return schematic;
        },
        { save: true },
      ),
    [applyChanges],
  );

  const editById = useCallback(
    (ids, edits, options) =>
      applyChanges((schematic) => {
        ids.forEach((id) => {
          Object.values(schematic).forEach((elemGroup) =>
            elemGroup.forEach((element, index) => {
              const genEditedElement = () =>
                isFunction(edits) ? edits(element) : edits;

              const isItself = element?.id === id;
              const isOwnVertex = !!element?.vertices?.some(
                (vertex) => vertex?.id === options?.context?.vertexId,
              );

              elemGroup[index] =
                isItself || isOwnVertex ? genEditedElement() : element;
            }),
          );
        });

        return schematic;
      }, options),
    [applyChanges],
  );

  return { add, deleteById, editById };
}
