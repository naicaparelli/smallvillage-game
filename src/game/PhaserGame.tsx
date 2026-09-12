import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { AtelierScene } from './scenes/AtelierScene';

export function PhaserGame() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current,
      width: host.current.clientWidth,
      height: host.current.clientHeight,
      backgroundColor: '#25212f',
      pixelArt: true,
      roundPixels: true,
      scale: { mode: Phaser.Scale.RESIZE },
      scene: [AtelierScene],
    });
    return () => game.destroy(true);
  }, []);

  return <div id="game-container" ref={host} aria-label="Mapa provisório da vila" />;
}
