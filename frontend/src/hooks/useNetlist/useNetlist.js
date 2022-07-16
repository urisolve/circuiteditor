import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep, trimEnd } from 'lodash';

import {
  generateUniqueName,
  generateVirtualNode,
  isConnected,
  isConnectionRedundant,
  LabelOptions,
  moveConnection,
  numberPattern,
} from '../../util';
import { components } from '../../electrical';

// TODO: Add more info to the header (author, date, ...)
const version = process.env.REACT_APP_VERSION ?? '1.0.0';
const netlistHeader = `# CircuitEditor v${version}\n\n`;

const replaceMap = Object.freeze({ Ω: 'Ohm', µ: 'u' });

function applyGround(schematic) {
  for (const component of schematic.components) {
    // Ignore non-ground components
    if (component.type !== 'gnd') continue;

    // Find the ground node
    const [gndPort] = component.ports; // GND only has 1 port
    const gndNode = schematic.nodes.find((node) =>
      node.connections?.includes(gndPort.connection),
    );

    // Rename the node
    if (gndNode) {
      gndNode.label = { name: 'gnd' };
    }
  }
}

function condenseNodes(schematic) {
  for (const node of schematic.nodes) {
    // Grab all connections to this node
    const nodeConnections = schematic.connections.filter((connection) =>
      isConnected(node, connection),
    );

    // Grab all the nodes that are connected to this one
    const connectedNodes = schematic.nodes.filter((connectedNode) =>
      nodeConnections
        .map(
          (connection) =>
            isConnected(connectedNode, connection) && connectedNode !== node,
        )
        .some(Boolean),
    );

    // If there are no interconnected nodes, skip
    if (!connectedNodes.length) continue;

    for (const connectedNode of connectedNodes) {
      // Move connections to new node
      for (const connection of schematic.connections) {
        if (isConnected(connectedNode, connection) && connection.id) {
          moveConnection(connection, connectedNode, node);
          // TODO: Also move the label
        }
      }

      // Delete the now useless node
      const idx = schematic.nodes.indexOf(connectedNode);
      schematic.nodes.splice(idx, 1);
    }

    // Delete useless old connections
    for (const connection of schematic.connections) {
      if (!isConnectionRedundant(connection)) continue;

      const idx = schematic.connections.indexOf(connection);
      schematic.connections.splice(idx, 1);
    }
  }
}

function withVirtualNodes(schematic) {
  for (const connection of schematic.connections) {
    // Search for all components that share this connection
    const connectors = schematic.components.filter((component) =>
      component.ports.find((port) => isConnected(port, connection)),
    );

    // If the connection is shared between 2 components,
    // create a new virtual node between them.
    if (connectors.length === 2) {
      // Create virtual node
      const virtualNode = generateVirtualNode(schematic);
      schematic.nodes.push(virtualNode);

      // Create new connection
      schematic.connections.push({
        id: uuidv4(),
        start: virtualNode.id,
        end: connection.end,
      });

      // Update old connection
      connection.end = virtualNode.id;
    }
  }
}

function generateNameString({ type, label: { name } }) {
  return `${type}:${name}`;
}

function generateNodesString(component, schematic) {
  let nodeStr = '';

  for (const port of component.ports) {
    // Search for the node (virtual or real) that is connected to the port
    const conn = schematic.connections.find((conn) => isConnected(port, conn));
    const node = schematic.nodes.find((node) => isConnected(node, conn));

    if (!conn || !node) {
      throw new Error(
        `Component with ID "${component.id}" is not fully connected. Make sure all ports of the component are connected somewhere.`,
      );
    }

    // Generate a name if the node doesn't have one
    const uniqueName = generateUniqueName(
      schematic.nodes,
      LabelOptions.NUMERIC,
      '_net',
    );

    if (!node.label) node.label = { name: uniqueName };
    else if (!node.label.name) node.label.name = uniqueName;

    // Convert it into string
    nodeStr += node?.label.name + ' ';
  }

  // Trim the last space and return
  return trimEnd(nodeStr);
}

function generateValueString({ type, label: { value = '', unit = '' } }) {
  if (!value) return '';

  const defaultName = components[type]?.label?.name;
  const formattedValue = value.replace(new RegExp(numberPattern), '$& ');

  return `${defaultName}="${formattedValue}${unit}"`;
}

function buildNetlist(schematic) {
  let netlist = netlistHeader;

  for (const component of schematic.components) {
    if (component.type === 'gnd') continue;

    try {
      const nameStr = generateNameString(component);
      const nodesStr = generateNodesString(component, schematic);
      const valueStr = generateValueString(component);

      netlist += `${nameStr} ${nodesStr} ${valueStr}\n`;
    } catch (error) {
      if (process.env.REACT_APP_NETLIST_DEBUG) {
        console.error(error);
      }
    }
  }

  return replacePatterns(netlist, replaceMap);
}

const replacePatterns = (string, replaceMap) =>
  Object.entries(replaceMap).reduce(
    (string, [pattern, replacer]) => string.replaceAll(pattern, replacer),
    string,
  );

export function useNetlist(sch) {
  return useMemo(() => {
    const schematic = cloneDeep(sch);

    condenseNodes(schematic);
    applyGround(schematic);
    withVirtualNodes(schematic);

    return buildNetlist(schematic);
  }, [sch]);
};
