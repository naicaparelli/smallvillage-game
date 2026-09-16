import type { Inventory } from './crafting';

export const inventorySlots: Array<{ id: keyof Inventory; name: string; image: string } | null> = [
  { id: 'wood', name: 'Madeira', image: '/assets/items/wood/stick-1.png' },
  { id: 'stone', name: 'Pedra', image: '/assets/items/stone.svg' },
  { id: 'chair', name: 'Cadeira', image: '/assets/items/chair.svg' },
  null,
  null,
  null,
];

export const inventoryItemById = Object.fromEntries(
  inventorySlots.filter((slot) => slot !== null).map((slot) => [slot.id, slot]),
) as Record<keyof Inventory, NonNullable<(typeof inventorySlots)[number]>>;
