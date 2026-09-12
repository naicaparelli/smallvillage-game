import { describe, expect, it } from 'vitest';
import { cameraBounds } from './cameraBounds';

describe('cameraBounds', () => {
  it('centraliza o mapa nos eixos menores que a tela', () => {
    expect(cameraBounds(1000, 600, 1400, 900)).toEqual({
      x: -200, y: -150, width: 1400, height: 900,
    });
  });

  it('preserva a área de rolagem nos eixos maiores que a tela', () => {
    expect(cameraBounds(2200, 1400, 1000, 600)).toEqual({
      x: 0, y: 0, width: 2200, height: 1400,
    });
  });
});
