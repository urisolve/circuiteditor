import { useState } from 'react';

import {
  useArea,
  useConnections,
  useHistory,
  useNetlist,
  useSchematicParser,
  useSchematicTools,
  useSchematicItems,
} from '../';

const emptySchematic = { components: [], nodes: [], connections: [] };

export function useSchematic(initialSchematic = {}, maxHistoryLength = 20) {
  const sch = { ...emptySchematic, ...initialSchematic };
  const [schematic, setSchematic] = useState(sch);

  const history = useHistory(setSchematic, maxHistoryLength);
  const tools = useSchematicTools(setSchematic, history);

  useSchematicParser(schematic, setSchematic);
  const items = useSchematicItems(schematic);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useConnections(schematic, setSchematic, items.items);
  const netlist = useNetlist(schematic);

  const area = useArea(items.items);

  return {
    data: schematic,

    ...items,
    ...tools,

    history,
    netlist,
    area,

    selection: {
      selectedItems,
      setSelectedItems,
    },
  };
}
