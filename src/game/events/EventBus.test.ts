import { describe, expect, it, vi } from 'vitest';
import { eventBus } from './EventBus';

describe('Event Bus', () => {
  it('entrega um evento tipado e remove o listener ao desmontar', () => {
    const listener = vi.fn();
    const unsubscribe = eventBus.on('PLAYER_READY', listener);
    eventBus.emit('PLAYER_READY', { sceneId: 'placeholder' });
    unsubscribe();
    eventBus.emit('PLAYER_READY', { sceneId: 'other' });
    expect(listener).toHaveBeenCalledExactlyOnceWith({ sceneId: 'placeholder' });
  });
});
