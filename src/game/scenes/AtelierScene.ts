import Phaser from 'phaser';
import { areas, type AreaId, type AreaObject } from '../../data/areas';
import { characters } from '../../data/characters';
import { gameStore } from '../../state/gameStore';
import { eventBus } from '../events/EventBus';
import { mobileInput } from '../input/mobileInput';
import { cardinalDirection } from '../input/cardinalDirection';
import { cameraBounds } from '../utils/cameraBounds';
import { isBlocked } from '../utils/collision';
import { firstQuest } from '../../data/quests';

const SPEED = 90;
const INTERACTION_RADIUS = 105;

export class AtelierScene extends Phaser.Scene {
  private areaId: AreaId = 'atelier-exterior';
  private player!: Phaser.GameObjects.Container;
  private body!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private actionKeys!: Record<'E' | 'ENTER', Phaser.Input.Keyboard.Key>;
  private objectSprites = new Map<string, Phaser.GameObjects.Rectangle>();
  private bench: Phaser.GameObjects.Rectangle | null = null;
  private nearestId: string | null = null;
  private transitioning = false;
  private walkTime = 0;
  private wasMoving = false;

  constructor() {
    super('atelier');
  }

  create(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;
    this.actionKeys = this.input.keyboard!.addKeys('E,ENTER') as typeof this.actionKeys;
    this.cameras.main.setBackgroundColor('#455648');
    this.cameras.main.roundPixels = true;
    this.areaId = gameStore.getState().areaId;
    this.scale.on(Phaser.Scale.Events.RESIZE, this.updateCameraBounds, this);
    const unsubscribe = eventBus.on('INTERACTION_REQUESTED', () => this.interact());
    const offSync = eventBus.on('SYNC_POSITION', () => this.syncPosition());
    const offQuest = eventBus.on('QUEST_UPDATED', () => {
      if (gameStore.getState().quest.completed) this.bench?.setFillStyle(0xf2d48b);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.updateCameraBounds, this);
      unsubscribe(); offSync(); offQuest();
    });

    this.drawArea();
    gameStore.getState().setMode(window.innerHeight > window.innerWidth ? 'paused' : 'explore');
    eventBus.emit('PLAYER_READY', { sceneId: this.scene.key });
  }

  private drawArea(): void {
    const area = areas[this.areaId];
    this.cameras.main.stopFollow();
    this.children.removeAll(true);
    this.objectSprites.clear();
    this.bench = null;
    this.nearestId = null;
    eventBus.emit('INTERACTION_AVAILABLE', { label: null });

    const background = this.add.graphics();
    background.fillStyle(this.areaId === 'atelier-exterior' ? 0x83977b : 0xb9a795);
    background.fillRect(0, 0, area.width, area.height);
    background.lineStyle(2, this.areaId === 'atelier-exterior' ? 0x72866b : 0xa18e82, 0.55);
    for (let x = 0; x <= area.width; x += 64) background.lineBetween(x, 0, x, area.height);
    for (let y = 0; y <= area.height; y += 64) background.lineBetween(0, y, area.width, y);

    if (this.areaId === 'atelier-exterior') {
      this.add.rectangle(1100, 575, 350, 300, 0xc9b1bd).setStrokeStyle(8, 0x544557);
      this.add.text(1100, 570, 'ATELIÊ', { fontFamily: 'sans-serif', fontSize: '30px', color: '#25212f' }).setOrigin(0.5);
      this.add.rectangle(1100, 1170, 1400, 90, 0xc9bfa5);
    } else {
      this.add.rectangle(700, 450, 1300, 830, 0xd5c4b1).setStrokeStyle(20, 0x67535c);
      this.add.rectangle(700, 100, 1200, 32, 0x67535c);
      this.add.text(700, 65, 'ATELIÊ — INTERIOR', { fontFamily: 'sans-serif', fontSize: '25px', color: '#352b35' }).setOrigin(0.5);
      this.bench = this.add.rectangle(920, 730, 110, 45, gameStore.getState().quest.completed ? 0xf2d48b : 0x6f5d57).setStrokeStyle(4, 0x544557);
      this.add.text(920, 730, 'BANCADA', { fontFamily: 'sans-serif', fontSize: '14px', color: '#fff8ec' }).setOrigin(0.5);
    }

    const quest = gameStore.getState().quest;
    for (const object of area.objects) {
      if (quest.cleanedObjectIds.includes(object.id)) continue;
      if (object.kind === 'photograph' && !quest.windowOpen) continue;
      const color = object.kind === 'door' ? 0x544557
        : object.kind === 'box' ? 0x997655
        : object.kind === 'cobweb' ? 0xe2e4df
        : object.kind === 'window' ? quest.windowOpen ? 0xe4dba4 : 0x71858f
        : 0xddbb78;
      const width = object.kind === 'door' ? 74 : object.kind === 'window' ? 110 : 50;
      const height = object.kind === 'door' ? 30 : object.kind === 'window' ? 55 : 42;
      const shape = this.add.rectangle(object.x, object.y, width, height, color).setStrokeStyle(3, 0x544557);
      this.objectSprites.set(object.id, shape);
    }

    const appearance = characters[gameStore.getState().character ?? 'rabbit'];
    const feet = this.add.rectangle(0, 0, 24, 8, 0x544557);
    this.body = this.add.rectangle(0, -22, 32, 38, appearance.color).setStrokeStyle(3, 0x544557);
    const outfit = this.add.rectangle(0, -6, 28, 20, appearance.accent);
    const marker = this.add.text(0, -28, appearance.symbol, { fontFamily: 'sans-serif', fontSize: '19px', color: '#544557' }).setOrigin(0.5);
    const position = gameStore.getState().playerPosition;
    this.player = this.add.container(position.x, position.y, [feet, this.body, outfit, marker]);
    this.player.setDepth(this.player.y);
    this.updateCameraBounds();
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    eventBus.emit('AREA_ENTERED', { areaId: this.areaId });
    if (this.areaId === 'atelier-interior' && !quest.completed && quest.cleanedObjectIds.length === 0 && !quest.windowOpen) {
      eventBus.emit('NOTICE', { text: firstQuest.introduction });
    }
  }

  private syncPosition(): void {
    if (this.player && !this.transitioning && gameStore.getState().character) gameStore.getState().setPosition({ x: this.player.x, y: this.player.y });
  }

  private updateCameraBounds(): void {
    const area = areas[this.areaId];
    const bounds = cameraBounds(area.width, area.height, this.scale.width, this.scale.height);
    this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  private availableObject(): AreaObject | null {
    if (this.transitioning) return null;
    const objects = areas[this.areaId].objects.filter((object) => {
      const quest = gameStore.getState().quest;
      if (quest.cleanedObjectIds.includes(object.id)) return false;
      if (object.kind === 'photograph' && !quest.windowOpen) return false;
      if (object.kind === 'window' && quest.windowOpen) return false;
      if (object.kind === 'photograph' && quest.photoFound) return false;
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, object.x, object.y) <= INTERACTION_RADIUS;
    });
    objects.sort((a, b) =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y) -
      Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y),
    );
    return objects[0] ?? null;
  }

  private refreshInteraction(): void {
    const object = this.availableObject();
    if (object?.id === this.nearestId) return;
    if (this.nearestId) this.objectSprites.get(this.nearestId)?.setStrokeStyle(3, 0x544557);
    this.nearestId = object?.id ?? null;
    if (this.nearestId) this.objectSprites.get(this.nearestId)?.setStrokeStyle(5, 0xf4dca8);
    eventBus.emit('INTERACTION_AVAILABLE', { label: object?.label ?? null });
  }

  private interact(): void {
    if (gameStore.getState().mode !== 'explore') return;
    const object = this.availableObject();
    if (!object) return;
    if (object.kind === 'door') {
      this.transitioning = true;
      this.refreshInteraction();
      this.cameras.main.fadeOut(180, 0, 0, 0);
      this.time.delayedCall(180, () => {
        this.areaId = this.areaId === 'atelier-exterior' ? 'atelier-interior' : 'atelier-exterior';
        gameStore.getState().setLocation(this.areaId, { ...areas[this.areaId].spawn });
        this.drawArea();
        this.cameras.main.fadeIn(180, 0, 0, 0);
        this.transitioning = false;
        eventBus.emit('SAVE_REQUESTED', { reason: 'area-change' });
      });
      return;
    }
    if (object.kind === 'box' || object.kind === 'cobweb') {
      this.objectSprites.get(object.id)?.destroy();
      this.objectSprites.delete(object.id);
      eventBus.emit('OBJECT_CLEANED', { objectId: object.id, objectType: object.kind });
    } else if (object.kind === 'window') {
      eventBus.emit('WINDOW_OPENED', {});
      this.objectSprites.get(object.id)?.setFillStyle(0xe4dba4);
      const photo = areas['atelier-interior'].objects.find((item) => item.kind === 'photograph');
      if (photo) this.objectSprites.set(photo.id, this.add.rectangle(photo.x, photo.y, 50, 42, 0xddbb78).setStrokeStyle(3, 0x544557));
    } else {
      eventBus.emit('PHOTO_FOUND', {});
      if (!gameStore.getState().quest.completed) {
        eventBus.emit('NOTICE', { text: 'Uma fotografia antiga mostra o ateliê e a praça cheios de vida.' });
      }
    }
    this.refreshInteraction();
  }

  update(_time: number, delta: number): void {
    if (gameStore.getState().mode !== 'explore' || this.transitioning) return;
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.E) || Phaser.Input.Keyboard.JustDown(this.actionKeys.ENTER)) this.interact();
    const x = Number(this.cursors.right.isDown || this.wasd.D.isDown) - Number(this.cursors.left.isDown || this.wasd.A.isDown) + mobileInput.x;
    const y = Number(this.cursors.down.isDown || this.wasd.S.isDown) - Number(this.cursors.up.isDown || this.wasd.W.isDown) + mobileInput.y;
    const direction = cardinalDirection(x, y);
    if (!direction.x && !direction.y) {
      if (this.wasMoving) this.syncPosition();
      this.wasMoving = false;
      this.walkTime = 0;
      this.body.y = -22;
      this.refreshInteraction();
      return;
    }
    this.wasMoving = true;
    const area = areas[this.areaId];
    const distance = SPEED * Math.min(delta, 50) / 1000;
    const nextX = Phaser.Math.Clamp(this.player.x + direction.x * distance, 16, area.width - 16);
    const nextY = Phaser.Math.Clamp(this.player.y + direction.y * distance, 8, area.height - 8);
    if (!isBlocked(nextX, this.player.y, 15, area.obstacles)) this.player.x = nextX;
    if (!isBlocked(this.player.x, nextY, 15, area.obstacles)) this.player.y = nextY;
    this.player.setDepth(this.player.y);
    this.walkTime += delta;
    this.body.y = -22 + Math.round(Math.sin(this.walkTime / 90) * 2);
    this.refreshInteraction();
  }
}
