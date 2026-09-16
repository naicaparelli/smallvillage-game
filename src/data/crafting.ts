export const resources = {
  wood: { name: 'Madeira' },
  stone: { name: 'Pedra' },
} as const;

export type ResourceId = keyof typeof resources;
export type Inventory = Record<ResourceId, number> & { chair: number };

export const initialInventory: Inventory = { wood: 0, stone: 0, chair: 0 };
export const repairCost = { wood: 3, stone: 2 } as const;
export const chairCost = { wood: 2, stone: 1 } as const;
