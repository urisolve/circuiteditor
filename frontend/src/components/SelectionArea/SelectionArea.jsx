import {
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
  useRef,
  useContext,
} from 'react';
import { concat, throttle } from 'lodash';
import Vector from 'victor';

import { Box } from '@mui/material';

import { useBoolean, useGlobalRefMap } from '../../hooks';
import { areasIntersect, getDragHandleId } from '../../util';
import { constants } from '../../constants';
import { SchematicContext } from '../../contexts';

const DEFAULT_AREA = { left: 0, top: 0, width: 0, height: 0 };
const MOUSE = Object.freeze({ NONE: 0, LEFT: 1, MIDDLE: 2, RIGHT: 3 });

export function SelectionArea({ parentRef, setSelectedItems, ...rest }) {
  const { items, labels, vertices } = useContext(SchematicContext);
  const refMap = useGlobalRefMap();
  const showArea = useBoolean(false);

  const parentArea = useRef(null);
  const startPoint = useRef(new Vector());
  const selectionArea = useRef(DEFAULT_AREA);

  const selectableAreas = useRef([]);
  const selectableItems = useMemo(
    () => concat(items, vertices),
    [items, vertices],
  );

  const ignoreAreas = useRef([]);
  const ignoreItems = useMemo(() => labels, [labels]);

  useLayoutEffect(() => {
    if (!parentRef.current) return;
    parentArea.current = parentRef.current.getBoundingClientRect();

    function calculateAreas(items = []) {
      const electricalItems = items.map(({ id }) => ({ handle: id, id }));
      const dragHandlers = items.map(({ id }) => {
        return { handle: getDragHandleId(id), id };
      });

      const fullItems = electricalItems.concat(dragHandlers);

      return fullItems.reduce((areas, item) => {
        const elem = refMap.get(item.handle)?.current;
        const area = elem?.getBoundingClientRect();

        if (elem) {
          areas.push({
            id: item.id,
            left: area.left - parentArea.current.left,
            top: area.top - parentArea.current.top,
            width: area.width,
            height: area.height,
          });
        }

        return areas;
      }, []);
    }

    ignoreAreas.current = calculateAreas(ignoreItems);
    selectableAreas.current = calculateAreas(selectableItems);
  }, [refMap, ignoreItems, selectableItems, parentRef]);

  const onMouseMove = useMemo(
    () =>
      throttle((event) => {
        showArea.on();

        const endPoint = new Vector(
          event.clientX - parentArea.current.left,
          event.clientY - parentArea.current.top,
        );

        selectionArea.current = {
          width: endPoint.absDistanceX(startPoint.current),
          height: endPoint.absDistanceY(startPoint.current),
          left: Math.min(startPoint.current.x, endPoint.x),
          top: Math.min(startPoint.current.y, endPoint.y),
        };

        setSelectedItems((selected) => {
          const items = selectableAreas.current.reduce((items, area) => {
            if (areasIntersect(area, selectionArea.current)) {
              items.add(area.id);
            }

            return items;
          }, new Set());

          const totalSelection = event.ctrlKey
            ? [...selected, ...items]
            : items;

          return new Set(totalSelection);
        });

        event.preventDefault();
      }, 1000 / constants.SELECTION_FPS),
    [showArea, setSelectedItems],
  );

  const onMouseUp = useCallback(
    (event) => {
      event.preventDefault();
      onMouseMove.cancel();
      showArea.off();

      parentRef.current.removeEventListener('mousemove', onMouseMove);
      parentRef.current.removeEventListener('mouseup', onMouseUp);
    },
    [onMouseMove, parentRef, showArea],
  );

  const onMouseDown = useCallback(
    (event) => {
      if (event.which !== MOUSE.LEFT) return;
      if (!event.ctrlKey) setSelectedItems(new Set());

      startPoint.current = new Vector(
        event.clientX - parentArea.current.left,
        event.clientY - parentArea.current.top,
      );

      selectionArea.current = {
        left: startPoint.current.x,
        top: startPoint.current.y,
        width: 0,
        height: 0,
      };

      // Ignore click if it was on an item marked to ignore
      for (const area of ignoreAreas.current) {
        if (areasIntersect(selectionArea.current, area)) {
          event.preventDefault();
          return;
        }
      }

      // Single click on selectable items
      for (const area of selectableAreas.current) {
        if (areasIntersect(selectionArea.current, area)) {
          setSelectedItems((items) => {
            if (items.has(area.id)) items.delete(area.id);
            else items.add(area.id);
            return items;
          });

          event.preventDefault();
          return;
        }
      }

      // Enable event listeners for drag
      parentRef.current.addEventListener('mousemove', onMouseMove);
      parentRef.current.addEventListener('mouseup', onMouseUp);

      event.preventDefault();
    },
    [setSelectedItems, parentRef, onMouseMove, onMouseUp],
  );

  useEffect(() => {
    const cleanup = parentRef;
    parentRef.current.addEventListener('mousedown', onMouseDown);

    return () => {
      if (!cleanup.current) return;
      cleanup.current.removeEventListener('mousedown', onMouseDown);
    };
  }, [parentRef, onMouseDown]);

  return (
    <Box
      sx={{
        // Fixed
        zIndex: 1,
        position: 'absolute',
        display: showArea.value ? 'inline-block' : 'none',
        width: selectionArea.current.width,
        height: selectionArea.current.height,
        transform: `translate(
          ${selectionArea.current.left}px,
          ${selectionArea.current.top}px
        )`,

        // Customizable
        backgroundColor: 'rgba(100, 149, 237, 0.25)',
        boxShadow: '0px 0px 0px 2px rgba(100, 149, 237, 0.75) inset',
      }}
      {...rest}
    />
  );
}
