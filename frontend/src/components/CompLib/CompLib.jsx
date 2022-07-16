import { useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep, isFunction, lowerCase } from 'lodash';

import { Comp } from '../Comp';
import { SearchBar } from '../SearchBar';

import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';

import { MenuHeader } from '..';
import { library } from './library';
import { SchematicContext } from '../../contexts';
import { Drawer } from '../Drawer';

export function CompLib({ controller, ...rest }) {
  const { t } = useTranslation();

  const { add: addToSchematic } = useContext(SchematicContext);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLib = useMemo(() => {
    const filtered = cloneDeep(library);

    return filtered.filter((group) => {
      group.elements = group.elements.filter((item) =>
        lowerCase(item.fullName).includes(searchQuery.toLowerCase()),
      );

      return !!group.elements.length;
    });
  }, [searchQuery]);

  return (
    <Drawer controller={controller} {...rest}>
      <Stack spacing={4}>
        <Box>
          <MenuHeader icon={<ListAltIcon />} onClose={controller.off}>
            {t('common.components')}
          </MenuHeader>

          <SearchBar value={searchQuery} setValue={setSearchQuery} />
        </Box>

        {!!filteredLib.length && (
          <Box>
            {filteredLib.map((group) => (
              <Accordion variant='outlined' key={group.title}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{group.title}</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container>
                    {group.elements.map((element, idx) => {
                      const comp = isFunction(element) ? element() : element;

                      return (
                        <Grid key={idx} xs={4} item>
                          <Comp action={() => addToSchematic(comp)} {...comp} />
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {!!filteredLib.length ? (
          <Box>
            <Typography align='center' gutterBottom variant='h6'>
              {t('common.tip')}:
            </Typography>

            <Typography align='center' variant='body1'>
              {t('tips.tip_0')}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography align='center' gutterBottom variant='h6'>
              {t('library.emptySearch.title')}
            </Typography>

            <Typography align='center' variant='body1'>
              {t('library.emptySearch.subtitle')}
            </Typography>
          </Box>
        )}
      </Stack>
    </Drawer>
  );
}
