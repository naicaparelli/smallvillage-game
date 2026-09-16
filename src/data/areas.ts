export type AreaId = 'atelier-exterior' | 'atelier-interior';
export type ObjectKind = 'door' | 'box' | 'cobweb' | 'window' | 'photograph' | 'resource' | 'bench';

export type AreaObject = {
  id: string;
  kind: ObjectKind;
  x: number;
  y: number;
  label: string;
  resource?: 'wood' | 'stone';
  collision?: { width: number; height: number };
};

export const areas: Record<AreaId, {
  width: number;
  height: number;
  spawn: { x: number; y: number };
  objects: AreaObject[];
  obstacles: Array<{ x: number; y: number; width: number; height: number; topPadding?: number }>;
}> = {
  'atelier-exterior': {
    width: 2200, height: 1400, spawn: { x: 1100, y: 860 },
    objects: [
      { id: 'exterior-door', kind: 'door', x: 1100, y: 730, label: 'Entrar no ateliê' },
      ...[[930, 870], [1010, 980], [1150, 1020], [1260, 930], [1310, 810]].map(([x, y], index) => ({ id: `wood-${index}`, kind: 'resource' as const, resource: 'wood' as const, x, y, label: 'Coletar madeira' })),
      ...[[880, 750], [1190, 830], [1380, 1020]].map(([x, y], index) => ({ id: `stone-${index}`, kind: 'resource' as const, resource: 'stone' as const, x, y, label: 'Coletar pedra' })),
    ],
    obstacles: [{ x: 1100, y: 575, width: 350, height: 300 }],
  },
  'atelier-interior': {
    width: 1400, height: 900, spawn: { x: 700, y: 700 },
    objects: [
      { id: 'interior-door', kind: 'door', x: 700, y: 815, label: 'Sair do ateliê' },
      { id: 'workbench', kind: 'bench', x: 920, y: 730, label: 'Usar bancada' },
      { id: 'box_01', kind: 'box', x: 390, y: 310, label: 'Retirar caixa', collision: { width: 44, height: 34 } },
      { id: 'box_02', kind: 'box', x: 525, y: 490, label: 'Retirar caixa', collision: { width: 44, height: 34 } },
      { id: 'box_03', kind: 'box', x: 820, y: 320, label: 'Retirar caixa', collision: { width: 44, height: 34 } },
      { id: 'box_04', kind: 'box', x: 960, y: 550, label: 'Retirar caixa', collision: { width: 44, height: 34 } },
      { id: 'box_05', kind: 'box', x: 350, y: 650, label: 'Retirar caixa', collision: { width: 44, height: 34 } },
      { id: 'cobweb_01', kind: 'cobweb', x: 280, y: 230, label: 'Limpar teia', collision: { width: 52, height: 38 } },
      { id: 'cobweb_02', kind: 'cobweb', x: 1080, y: 240, label: 'Limpar teia', collision: { width: 52, height: 38 } },
      { id: 'cobweb_03', kind: 'cobweb', x: 1080, y: 690, label: 'Limpar teia', collision: { width: 52, height: 38 } },
      { id: 'atelier_window_main', kind: 'window', x: 700, y: 170, label: 'Abrir janela', collision: { width: 110, height: 44 } },
      { id: 'atelier_old_photo', kind: 'photograph', x: 780, y: 190, label: 'Examinar fotografia' },
    ],
    obstacles: [
      { x: 700, y: 100, width: 1200, height: 32 },
      { x: 700, y: 35, width: 1300, height: 20 },
      { x: 700, y: 865, width: 1300, height: 20 },
      { x: 50, y: 450, width: 20, height: 830 },
      { x: 1350, y: 450, width: 20, height: 830 },
      { x: 920, y: 730, width: 120, height: 55, topPadding: 3 },
    ],
  },
};
