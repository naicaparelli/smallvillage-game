import { useEffect, useRef, useState } from 'react';
import { inventoryItemById } from '../data/inventoryItems';
import type { Inventory } from '../data/crafting';
import { eventBus } from '../game/events/EventBus';

type CollectedItem = keyof Inventory;
type Toast = { itemId: CollectedItem; count: number };
const DURATION_MS = 3000;

export function CollectionToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<CollectedItem, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const currentTimers = timers.current;
    const off = eventBus.on('ITEM_COLLECTED', ({ itemId, amount }) => {
      setToasts((current) => {
        const previous = current.find((toast) => toast.itemId === itemId);
        const next = { itemId, count: (previous?.count ?? 0) + amount };
        return previous ? current.map((toast) => toast.itemId === itemId ? next : toast) : [...current, next];
      });
      const timer = currentTimers.get(itemId);
      if (timer) clearTimeout(timer);
      currentTimers.set(itemId, setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.itemId !== itemId));
        currentTimers.delete(itemId);
      }, DURATION_MS));
    });
    return () => {
      off();
      currentTimers.forEach(clearTimeout);
      currentTimers.clear();
    };
  }, []);

  return <div className="collection-toasts" role="status" aria-live="polite">
    {toasts.map(({ itemId, count }) => {
      const item = inventoryItemById[itemId];
      return <div className="collection-toast" key={itemId}>
        <img src={item.image} alt="" />
        <span>{count} {item.name.toLowerCase()}</span>
      </div>;
    })}
  </div>;
}
