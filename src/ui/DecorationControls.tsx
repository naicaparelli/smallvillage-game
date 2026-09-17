import { eventBus } from '../game/events/EventBus';

export function DecorationControls({ valid, moving }: { valid: boolean; moving: boolean }) {
  return <div className="decoration-controls" role="group" aria-label="Posicionar cadeira">
    <p>{valid ? 'Posição livre' : 'Posição bloqueada'} · toque no chão ou use as setas</p>
    <div className="decoration-control-row">
      <button type="button" aria-label="Mover para esquerda" onClick={() => eventBus.emit('DECORATION_MOVE', { dx: -1, dy: 0 })}>←</button>
      <button type="button" aria-label="Mover para cima" onClick={() => eventBus.emit('DECORATION_MOVE', { dx: 0, dy: -1 })}>↑</button>
      <button type="button" aria-label="Mover para baixo" onClick={() => eventBus.emit('DECORATION_MOVE', { dx: 0, dy: 1 })}>↓</button>
      <button type="button" aria-label="Mover para direita" onClick={() => eventBus.emit('DECORATION_MOVE', { dx: 1, dy: 0 })}>→</button>
      <button type="button" className="decoration-confirm" disabled={!valid} onClick={() => eventBus.emit('DECORATION_CONFIRM', {})}>Confirmar</button>
      <button type="button" onClick={() => eventBus.emit('DECORATION_CANCEL', {})}>Cancelar</button>
      {moving && <button type="button" onClick={() => eventBus.emit('DECORATION_STORE', {})}>Guardar</button>}
    </div>
  </div>;
}
