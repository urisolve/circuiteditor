import { useTranslation } from 'react-i18next';

import { Checkbox, FormField, Slider } from '../../components';
import { constants } from '../../constants';

export function ConnectionPropertiesForm({ form }) {
  const { t } = useTranslation();
  const isDashed = form.watch('properties.dashed');

  return (
    <>
      <FormField
        label={t('form.label.color')}
        name='properties.color'
        placeholder={t('form.placeholder.color')}
        {...form}
      />

      <Slider
        control={form.control}
        inputProps={{
          min: 2,
          max: 10,
          marks: [{ value: constants.DEFAULT_STROKE_WIDTH }],
        }}
        label={t('form.label.strokeWidth')}
        name='properties.strokeWidth'
      />

      <Slider
        control={form.control}
        inputProps={{
          min: 2,
          max: 10,
          marks: [{ value: constants.DEFAULT_VERTEX_RADIUS }],
        }}
        label={t('form.label.vertexRadius')}
        name='properties.vertexRadius'
      />

      <Slider
        control={form.control}
        inputProps={{
          min: -10,
          max: 10,
          marks: [{ value: constants.DEFAULT_DASHED_ANIMATION_SPEED }],
          disabled: !isDashed,
        }}
        label={t('form.label.dashedAnimationSpeed')}
        name='properties.dashedAnimationSpeed'
      />

      <Checkbox
        control={form.control}
        label={t('form.label.dashed')}
        name='properties.dashed'
        sx={{ flexGrow: 1 }}
      />
    </>
  );
}
