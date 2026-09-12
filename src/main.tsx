import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './app/styles.css';
import { startQuestSystem } from './game/systems/questSystem';
import { startSaveSync } from './save/saveSync';

startQuestSystem();
startSaveSync();

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
