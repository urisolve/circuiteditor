import { components as comps } from '../../electrical';

export const library = [
  {
    title: 'Connectors',
    elements: [comps.gnd, comps.Node, comps.Wire],
  },
  {
    title: 'Passive',
    elements: [comps.C, comps.L, comps.R, comps.Z],
  },
  {
    title: 'Probes',
    elements: [comps.IProbe, comps.VProbe],
  },
  {
    title: 'Sources',
    elements: [comps.Iac, comps.Idc, comps.Vac, comps.Vdc],
  },
];
