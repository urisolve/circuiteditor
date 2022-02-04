import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import lodash from 'lodash';

import { isComponent, isConnection, isNode, snapPosToGrid } from '../../util';

export function useSchematicTools(setSchematic, history, gridSize) {
  /**
   * Adds an element to the schematic.
   *
   * Automatically detects if it is a Component, Node or Connection
   * by it's properties.
   *
   * @param {Object} element The element to be added.
   */
  const add = useCallback(
    (elements, where = 'components') => {
      setSchematic((oldSchematic) => {
        // Make a clone of the current schematic
        const newSchematic = lodash.cloneDeep(oldSchematic);

        // Force element into array format
        if (elements instanceof Set) elements = [...elements];
        if (!(elements instanceof Array)) elements = [elements];

        // Add all of the given elements to the schematic
        for (const element of elements) {
          // Lock the element's position to the grid
          if (!isConnection(element)) {
            element.position = snapPosToGrid(element.position, gridSize);
          }

          // Add IDs to the ports
          if (isComponent(element)) {
            for (const port of element.ports) {
              port.id = port.id ?? uuidv4();
            }
          }

          // Add the new element to the schematic
          newSchematic[where].push({ id: uuidv4(), ...element });
        }

        // If the changes are valid, save the old schematic
        if (!lodash.isEqual(oldSchematic, newSchematic))
          history.save(oldSchematic);

        return newSchematic;
      });
    },
    [setSchematic, history, gridSize],
  );

  /**
   * Simple helper functions
   */
  const addComponents = useCallback(
    (elements) => add(elements, 'components'),
    [add],
  );
  const addConnections = useCallback(
    (elements) => add(elements, 'connections'),
    [add],
  );
  const addNodes = useCallback((elements) => add(elements, 'nodes'), [add]);

  /**
   * Deletes an element from the schematic.
   *
   * Searches for the element that has the given id, and removes it from the
   * schematic. Note that if multiple elements share the same id, they will all
   * be deleted.
   *
   * @param {String} id The id of the element to be deleted.
   */
  const deleteById = useCallback(
    (ids) => {
      setSchematic((oldSchematic) => {
        // Make a clone of the current schematic
        const newSchematic = lodash.cloneDeep(oldSchematic);

        // Force ids into array format
        if (ids instanceof Set) ids = [...ids];
        if (!(ids instanceof Array)) ids = [ids];

        // Delete each of the corresponding elements
        for (const id of ids) {
          for (const type in newSchematic) {
            // Find the element
            const elem = lodash.find(newSchematic[type], { id });
            if (!elem) continue;

            // Remove all connections if the element is a node
            if (isNode(elem)) {
              newSchematic.connections = newSchematic.connections.filter(
                (conn) => conn.start !== id && conn.end !== id,
              );
            }

            // Remove all connections to the ports of the component
            else if (isComponent(elem)) {
              for (const port of elem.ports) {
                newSchematic.connections = newSchematic.connections.filter(
                  (conn) => conn.start !== port.id && conn.end !== port.id,
                );
              }
            }

            // Delete the element with the given id
            newSchematic[type] = newSchematic[type].filter(
              (elem) => elem.id !== id,
            );
          }
        }

        // If the changes are valid, save the old schematic
        if (!lodash.isEqual(oldSchematic, newSchematic))
          history.save(oldSchematic);

        return newSchematic;
      });
    },
    [setSchematic, history],
  );

  /**
   * Applies certain edits to the specified element.
   *
   * Searches for the element that has the given id, and applies the given
   * edits. Note that if multiple elements share the same id, they will all
   * be edited. The edits can be directly passed and added to the element, but,
   * if a more complex edit is required, you can pass a callback to be applied
   * to the element.
   *
   * @param {String} id The id of the element to be edited.
   * @param {any} edits If it's a function, apply it to the correct element.
   * Otherwise, apply the given edits (Object) to the state.
   * @param {Boolean} If If it should save the changes to the history.
   */
  const editById = useCallback(
    (ids, edits, startSch = null) => {
      setSchematic((oldSchematic) => {
        // Make a clone of the current schematic
        const newSchematic = lodash.cloneDeep(oldSchematic);

        // Force IDs into array format
        if (ids instanceof Set) ids = [...ids];
        if (!(ids instanceof Array)) ids = [ids];

        // Apply the edits
        for (const id of ids) {
          for (const type in newSchematic) {
            newSchematic[type] = newSchematic[type].map((elem) => {
              if (elem.id !== id) return elem;
              return lodash.isFunction(edits)
                ? edits(elem)
                : { ...elem, ...edits };
            });
          }
        }

        // If the changes are valid, save the old schematic
        if (startSch && !lodash.isEqual(startSch, newSchematic))
          history.save(startSch);

        return newSchematic;
      });
    },
    [setSchematic, history],
  );

  return { add, addComponents, addConnections, addNodes, deleteById, editById };
}