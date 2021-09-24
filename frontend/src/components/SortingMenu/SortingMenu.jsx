import React from 'react';

import { Box, Divider, ListItemText, Menu, MenuItem } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

export const SortingMenu = React.memo(
  ({
    params: { sortBy, orderBy },
    setters: { setSortBy, setOrderBy },
    options: { SORT_OPTIONS, ORDER_OPTIONS },
    ...rest
  }) => {
    const sortItems = [
      { name: 'Alphabetically', id: SORT_OPTIONS.alphabetically },
      { name: 'Date created', id: SORT_OPTIONS.dateCreated },
      { name: 'Last modified', id: SORT_OPTIONS.lastModified },
    ];

    const orderItems = [
      { name: 'Ascending', id: ORDER_OPTIONS.ascending },
      { name: 'Descending', id: ORDER_OPTIONS.descending },
    ];

    const menuCategories = [
      {
        title: 'Sort by',
        items: sortItems,
        selected: sortBy,
        setter: setSortBy,
      },
      {
        title: 'Order by',
        items: orderItems,
        selected: orderBy,
        setter: setOrderBy,
      },
    ];

    return (
      <Menu {...rest}>
        {menuCategories.map(({ title, items, selected, setter }, i) => (
          <Box key={title}>
            {i !== 0 && <Divider />}
            <MenuItem disabled>
              <ListItemText inset>{title}</ListItemText>
            </MenuItem>
            {items.map((item) => (
              <MenuItem
                key={item.name}
                selected={selected === item.id}
                onClick={() => setter(item.id)}
              >
                {selected === item.id && <CheckIcon sx={{ mr: 1.5 }} />}
                <ListItemText inset={selected !== item.id}>
                  {item.name}
                </ListItemText>
              </MenuItem>
            ))}
          </Box>
        ))}
      </Menu>
    );
  },
);
