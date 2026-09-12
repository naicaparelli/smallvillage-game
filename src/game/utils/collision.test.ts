import { describe, expect, it } from 'vitest';
import { isBlocked } from './collision';

describe('isBlocked', () => {
  const house = [{ x: 100, y: 100, width: 80, height: 60 }];
  it('impede atravessar um obstáculo', () => {
    expect(isBlocked(100, 100, 10, house)).toBe(true);
    expect(isBlocked(50, 100, 10, house)).toBe(false);
  });
});
