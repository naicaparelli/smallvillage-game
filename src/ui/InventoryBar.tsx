import type { Inventory } from '../data/crafting';
import { inventorySlots } from '../data/inventoryItems';

export function InventoryBar({ inventory, onUseChair }: { inventory: Inventory; onUseChair?: () => void }) {
  return (
    <ol className="inventory-bar" aria-label="Inventário">
      {inventorySlots.map((slot, index) => {
        const count = slot ? inventory[slot.id] : 0;
        return (
          <li className="inventory-slot" key={index} aria-label={slot && count > 0 ? `${slot.name}: ${count}` : 'Espaço vazio'}>
            {slot && count > 0 && (slot.id === 'chair' && onUseChair ? <button className="inventory-use" type="button" aria-label="Posicionar cadeira" onClick={onUseChair}><img className="inventory-icon" src={slot.image} alt="" /><span className="inventory-count">{count}</span></button> : <>
              <img className="inventory-icon" src={slot.image} alt="" />
              <span className="inventory-count">{count}</span>
            </>)}
          </li>
        );
      })}
    </ol>
  );
}
