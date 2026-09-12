import { describe, expect, it } from 'vitest';
import { cardinalDirection } from './cardinalDirection';

describe('cardinalDirection', () => {
  it('move somente no eixo indicado pelo teclado', () => {
    expect(cardinalDirection(0, -1)).toEqual({ x: 0, y: -1 });
    expect(cardinalDirection(0, 1)).toEqual({ x: 0, y: 1 });
    expect(cardinalDirection(-1, 0)).toEqual({ x: -1, y: 0 });
    expect(cardinalDirection(1, 0)).toEqual({ x: 1, y: 0 });
  });

  it('escolhe o eixo predominante no joystick e nunca anda na diagonal', () => {
    expect(cardinalDirection(0.8, 0.3)).toEqual({ x: 1, y: 0 });
    expect(cardinalDirection(-0.2, -0.9)).toEqual({ x: 0, y: -1 });
    expect(cardinalDirection(0.01, 0.02)).toEqual({ x: 0, y: 0 });
  });
});
