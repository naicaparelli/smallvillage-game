export const characters = {
  rabbit: { name: 'Coelhinho', color: 0xe9dec9, accent: 0xb5a0cc, symbol: '◇' },
  kitten: { name: 'Gatinho', color: 0xe9a56e, accent: 0x467d85, symbol: '△' },
  puppy: { name: 'Cachorrinho', color: 0xc99a64, accent: 0xc9ad65, symbol: '○' },
} as const;

export type CharacterKind = keyof typeof characters;
