import { useContext, useMemo } from 'react';

import { Box, Divider, Menu, MenuItem } from '@mui/material';
import PasteIcon from '@mui/icons-material/ContentPaste';
import CutIcon from '@mui/icons-material/ContentCut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import DuplicateIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';

import { SchematicContext } from '../../contexts';
import { constants } from '../../constants';

export function ContextMenu({ id, isOpen, close, openProperties, position }) {
  const {
    data: schematic,
    deleteById,
    editById,
    selection: { selectedItems },
  } = useContext(SchematicContext);

  const selectedIds = useMemo(
    () => [...new Set([id, ...selectedItems])],
    [id, selectedItems],
  );

  const isClickingOnComponent = useMemo(
    () => !!schematic.components.find((comp) => comp.id === id),
    [id, schematic],
  );

  function rotateSelection(amount) {
    editById(
      selectedIds,
      (elem) => ({
        ...elem,
        position: {
          ...elem?.position,
          angle: (elem.position.angle ?? 0) + amount,
        },
      }),
      { save: true },
    );
  }

  const actionGroups = [
    {
      actions: [
        {
          disabled: true,
          icon: <DuplicateIcon />,
          name: 'Copy',
        },
        {
          disabled: true,
          icon: <PasteIcon />,
          name: 'Paste',
        },
        {
          disabled: true,
          icon: <CutIcon />,
          name: 'Cut',
        },
      ],
    },
    {
      hidden: !isClickingOnComponent,
      actions: [
        {
          icon: <RotateLeftIcon />,
          name: 'Rotate Left',
          onClick: () => rotateSelection(-constants.ROTATION_INCREMENT),
        },
        {
          icon: <RotateRightIcon />,
          name: 'Rotate Right',
          onClick: () => rotateSelection(+constants.ROTATION_INCREMENT),
        },
      ],
    },
    {
      actions: [
        {
          color: 'IndianRed',
          icon: <DeleteIcon />,
          name: 'Delete',
          onClick: () => deleteById([id, ...selectedItems]),
        },
      ],
    },
    {
      actions: [
        {
          icon: <LaunchIcon />,
          name: 'Properties',
          onClick: openProperties,
        },
      ],
    },
  ];

  return (
    <Menu
      open={isOpen}
      onClose={close}
      anchorReference='anchorPosition'
      anchorPosition={position}
      sx={(theme) => ({
        '& .MuiMenuItem-root': {
          '& .MuiSvgIcon-root': {
            fontSize: 18,
            marginRight: theme.spacing(1.5),
          },
        },
      })}
    >
      {actionGroups.map(
        (group, groupIdx) =>
          !group.hidden && (
            <Box key={groupIdx}>
              {group.actions.map(
                (action, actionIdx) =>
                  !action.hidden && (
                    <MenuItem
                      dense
                      disabled={action.disabled || group.disabled}
                      key={actionIdx}
                      onClick={() => {
                        action.onClick();
                        close();
                      }}
                      sx={{ color: action.color }}
                    >
                      {action.icon}
                      {action.name}
                    </MenuItem>
                  ),
              )}

              {groupIdx !== actionGroups.length - 1 && <Divider />}
            </Box>
          ),
      )}
    </Menu>
  );
}
