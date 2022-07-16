import { concat } from 'lodash';
import { useMemo } from 'react';

export function useSchematicItems(schematic) {
  const items = useMemo(() => {
    const { components, connections, nodes } = schematic;

    return Object.freeze(concat(components, connections, nodes));
  }, [schematic]);

  const itemsMap = useMemo(
    () =>
      Object.freeze(
        items.reduce((itemsMap, item) => {
          itemsMap[item?.id] = item;
          itemsMap[item?.label?.id] = item?.label;
          item?.ports?.forEach((port) => (itemsMap[port?.id] = port));
          item?.vertices?.forEach((vertex) => (itemsMap[vertex?.id] = vertex));

          return itemsMap;
        }, {}),
      ),
    [items],
  );

  const labels = useMemo(
    () => Object.freeze(items.map((item) => item.label)),
    [items],
  );

  const ports = useMemo(
    () =>
      Object.freeze(
        schematic.components.reduce(
          (ports, component) => concat(ports, component.ports),
          [],
        ),
      ),
    [schematic.components],
  );

  const vertices = useMemo(
    () =>
      Object.freeze(
        schematic.connections.reduce(
          (vertices, connection) => concat(vertices, connection.vertices),
          [],
        ),
      ),
    [schematic.connections],
  );

  return { items, itemsMap, labels, ports, vertices };
}
