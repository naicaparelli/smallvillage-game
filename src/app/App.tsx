import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { PhaserGame } from '../game/PhaserGame';
import { gameStore } from '../state/gameStore';
import { characters, type CharacterKind } from '../data/characters';
import { MobileJoystick } from '../ui/MobileJoystick';
import { eventBus } from '../game/events/EventBus';
import { firstQuest } from '../data/quests';
import { characterAssetPath } from '../data/assetPaths';
import { questObjectives } from '../game/systems/questProgress';

function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

export function App() {
  const [portrait, setPortrait] = useState(isPortrait);
  const character = useStore(gameStore, (state) => state.character);
  const quest = useStore(gameStore, (state) => state.quest);
  const saveCorrupted = useStore(gameStore, (state) => state.saveCorrupted);
  const saveFailed = useStore(gameStore, (state) => state.saveFailed);
  const [action, setAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const objectives = questObjectives(quest);
  const currentObjective = objectives.find((objective) => objective.current < objective.total);

  useEffect(() => {
    const offReady = eventBus.on('PLAYER_READY', () => setReady(true));
    const offAction = eventBus.on('INTERACTION_AVAILABLE', ({ label }) => setAction(label));
    const offNotice = eventBus.on('NOTICE', ({ text }) => setNotice(text));
    return () => { offReady(); offAction(); offNotice(); };
  }, []);

  useEffect(() => {
    const update = () => setPortrait(isPortrait());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (character) {
      gameStore.getState().setMode(portrait || journalOpen ? 'paused' : 'explore');
    }
  }, [portrait, character, journalOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setJournalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!character) setReady(false);
  }, [character]);

  return (
    <main className="game-shell" data-ready={ready}>
      {character ? <PhaserGame /> : (
        <section className="selection-screen" aria-labelledby="selection-title">
          <h1 id="selection-title">Escolha seu artesão</h1>
          <p>Quem vai dar vida nova à vila?</p>
          {saveCorrupted && <p role="alert">O progresso anterior não pôde ser lido. Uma cópia foi preservada; comece um novo jogo.</p>}
          <div className="character-options">
            {(Object.keys(characters) as CharacterKind[]).map((kind) => (
              <button className="character-card" key={kind} onClick={() => gameStore.getState().selectCharacter(kind)}>
                <img className="character-preview" src={characterAssetPath(kind, 'front', 0)} alt="" />
                <span>{characters[kind].name}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {character && !ready && <div className="loading-screen" role="status">Carregando a vila...</div>}
      {character && !portrait && (
        <div className="quest-hud">
          <button className="journal-button" onClick={() => {
            eventBus.emit('SAVE_REQUESTED', { reason: 'journal-opened' });
            setJournalOpen(true);
          }} aria-label="Abrir Caderno dos Encantos">📖 {firstQuest.title}</button>
          <div>{quest.completed ? 'Missão concluída! A bancada voltou a brilhar.' : currentObjective ? `${currentObjective.label}: ${currentObjective.current}/${currentObjective.total}` : firstQuest.title}</div>
        </div>
      )}
      {character && !portrait && <MobileJoystick />}
      {character && !portrait && !journalOpen && action && (
        <button className="action-button" onClick={() => eventBus.emit('INTERACTION_REQUESTED', {})}>
          {action}
        </button>
      )}
      {character && !portrait && notice && (
        <div className="notice" role="status" onClick={() => setNotice(null)}>{notice}</div>
      )}
      {saveFailed && <div className="save-warning" role="alert">Não foi possível salvar o progresso neste navegador.</div>}
      {character && journalOpen && !portrait && (
        <div className="journal-backdrop">
          <section className="journal" role="dialog" aria-modal="true" aria-labelledby="journal-title">
            <button className="journal-close" onClick={() => setJournalOpen(false)} aria-label="Fechar caderno">×</button>
            <h2 id="journal-title">Caderno dos Encantos</h2>
            <h3>{firstQuest.title}</h3>
            <p>{quest.completed ? firstQuest.completedText : firstQuest.introduction}</p>
            <ul>{objectives.map((objective) => <li key={objective.label}>{objective.label}: {objective.current}/{objective.total}</li>)}</ul>
            {quest.completed && <p>A bancada quebrada começou a brilhar. A próxima etapa será o reparo dela.</p>}
            <button className="new-game-button" onClick={() => {
              if (!window.confirm('Apagar o progresso e começar um novo jogo?')) return;
              setJournalOpen(false);
              gameStore.getState().resetGame();
              eventBus.emit('SAVE_REQUESTED', { reason: 'new-game' });
            }}>Novo jogo</button>
          </section>
        </div>
      )}
      {portrait && (
        <div className="orientation-overlay" role="status">
          <div className="orientation-card">
            <span className="rotate-icon" aria-hidden="true">↻</span>
            <h1>Gire o aparelho</h1>
            <p>Esta vila foi feita para jogar com a tela na horizontal.</p>
          </div>
        </div>
      )}
    </main>
  );
}
