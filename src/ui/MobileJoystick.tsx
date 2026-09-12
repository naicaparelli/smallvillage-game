import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { mobileInput, resetMobileInput } from '../game/input/mobileInput';

const RADIUS = 42;

export function MobileJoystick() {
  const base = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  useEffect(() => () => resetMobileInput(), []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== event.pointerId || !base.current) return;
    const box = base.current.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const length = Math.hypot(dx, dy);
    const scale = length > RADIUS ? RADIUS / length : 1;
    const x = dx * scale;
    const y = dy * scale;
    setKnob({ x, y });
    mobileInput.x = x / RADIUS;
    mobileInput.y = y / RADIUS;
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    resetMobileInput();
  }

  return (
    <div
      ref={base}
      className="joystick"
      role="group"
      aria-label="Controle de movimento"
      onPointerDown={(event) => {
        if (activePointer.current !== null) return;
        activePointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        move(event);
      }}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      <div className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}
