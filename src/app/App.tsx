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
import { isAudioEnabled, pauseMusic, setAudioEnabled, startMusic } from '../audio/audioManager';

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
  const [notice, setNotice] = useState<{ text: string; image?: string } | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [missionDetailsOpen, setMissionDetailsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [audioEnabled, setAudioEnabledState] = useState(isAudioEnabled);
  const objectives = questObjectives(quest);
  const currentObjective = objectives.find((objective) => objective.current < objective.total);
  const openJournal = () => {
    eventBus.emit('SAVE_REQUESTED', { reason: 'journal-opened' });
    setMissionDetailsOpen(false);
    setJournalOpen(true);
  };

  useEffect(() => {
    const offReady = eventBus.on('PLAYER_READY', () => setReady(true));
    const offAction = eventBus.on('INTERACTION_AVAILABLE', ({ label }) => setAction(label));
    const offNotice = eventBus.on('NOTICE', (payload) => setNotice(payload));
    return () => { offReady(); offAction(); offNotice(); };
  }, []);

  useEffect(() => {
    if (!character) { pauseMusic(); return; }
    startMusic();
    const resume = () => startMusic();
    window.addEventListener('pointerdown', resume, true);
    window.addEventListener('keydown', resume, true);
    return () => {
      window.removeEventListener('pointerdown', resume, true);
      window.removeEventListener('keydown', resume, true);
    };
  }, [character]);

  useEffect(() => {
    const update = () => setPortrait(isPortrait());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (character) {
      gameStore.getState().setMode(portrait || journalOpen || notice ? 'paused' : 'explore');
    }
  }, [portrait, character, journalOpen, notice]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'e' || event.key === 'E') {
        if (!notice && !journalOpen) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (journalOpen) setJournalOpen(false);
        else setNotice(null);
      } else if (event.key === 'Escape') {
        setJournalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [journalOpen, notice]);
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
              <button className="character-card" key={kind} onClick={() => { startMusic(); gameStore.getState().selectCharacter(kind); }}>
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
          <button className="missions-toggle" type="button" aria-label="Abrir Caderno dos Encantos" onClick={openJournal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 11h6"/></svg>
            <span className="missions-count" aria-label={'' + (quest.completed ? 0 : 1) + ' missões pendentes'}>{quest.completed ? 0 : 1}</span>
          </button>
        </div>
      )}
      {character && !portrait && (
        <button className="audio-toggle" type="button" aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'} aria-pressed={audioEnabled} onClick={() => {
          const next = !audioEnabled;
          setAudioEnabled(next);
          setAudioEnabledState(next);
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            {audioEnabled ? <path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" /> : <path d="M17 8l5 8M22 8l-5 8" />}
          </svg>
        </button>
      )}
      {character && !portrait && <MobileJoystick />}
      {character && !portrait && !journalOpen && !notice && action && (
        <button className="action-button" aria-label={action} aria-keyshortcuts="E Enter" onClick={() => eventBus.emit('INTERACTION_REQUESTED', {})}>
          <span>{action}</span><kbd className="action-shortcut" aria-hidden="true">E</kbd>
        </button>
      )}
      {character && !portrait && notice && (
        <div className="notice" role="status">
          {notice.image && <img className="notice-photo" src={notice.image} alt="Fotografia antiga encontrada no ateliê" />}
          <span>{notice.text}</span>
          <kbd className="notice-shortcut" aria-hidden="true">E · Fechar</kbd>
          <button className="notice-close" type="button" aria-label="Fechar mensagem" onClick={() => setNotice(null)}>×</button>
        </div>
      )}
      {saveFailed && <div className="save-warning" role="alert">Não foi possível salvar o progresso neste navegador.</div>}
      {character && journalOpen && !portrait && (
        <div className="journal-backdrop">
          <section className="journal" role="dialog" aria-modal="true" aria-labelledby="journal-title">
            <button className="journal-close" type="button" onClick={() => setJournalOpen(false)} aria-label="Fechar caderno">×</button>
            <kbd className="journal-shortcut" aria-hidden="true">E · Fechar</kbd>
            <h2 id="journal-title">Caderno dos Encantos</h2>
            <div className="journal-mission">
              <button className="mission-summary" type="button" aria-expanded={missionDetailsOpen} aria-controls="mission-details" onClick={() => setMissionDetailsOpen((open) => !open)}>
                <span className="mission-arrow" aria-hidden="true">▸</span>
                <span className="mission-title">{firstQuest.title}</span>
                {quest.completed && <span className="mission-completed" aria-label="Missão concluída"><span aria-hidden="true">✓</span> Concluída</span>}
              </button>
              <div className="mission-details" id="mission-details" hidden={!missionDetailsOpen}>
                <p>{quest.completed ? 'Missão concluída! A bancada voltou a brilhar.' : currentObjective ? currentObjective.label + ': ' + currentObjective.current + '/' + currentObjective.total : firstQuest.title}</p>
                <ul>{objectives.map((objective) => <li key={objective.label}>{objective.label}: {objective.current}/{objective.total}</li>)}</ul>
              </div>
            </div>
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
