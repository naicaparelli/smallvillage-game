import Phaser from 'phaser';
import { areas, type AreaId, type AreaObject } from '../../data/areas';
import type { CharacterKind } from '../../data/characters';
import {
  characterAssetPath, characterTextureKey, facings, objectTextureKey, sceneAssets, type Facing,
} from '../../data/assetPaths';
import { gameStore } from '../../state/gameStore';
import { eventBus } from '../events/EventBus';
import { mobileInput } from '../input/mobileInput';
import { cardinalDirection } from '../input/cardinalDirection';
import { cameraBounds } from '../utils/cameraBounds';
import { activeObstacles, isBlocked, nearestOpenPoint } from '../utils/collision';
import { firstQuest } from '../../data/quests';

const SPEED = 90;
const INTERACTION_RADIUS = 105;
const WALK_FRAME_MS = 160;
const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 48;

export class AtelierScene extends Phaser.Scene {
  private areaId: AreaId = 'atelier-exterior';
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Image;
  private characterKind!: CharacterKind;
  private facing: Facing = 'front';
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private actionKeys!: Record<'E' | 'ENTER', Phaser.Input.Keyboard.Key>;
  private objectSprites = new Map<string, Phaser.GameObjects.Image>();
  private benchGlow: Phaser.GameObjects.Rectangle | null = null;
  private nearestId: string | null = null;
  private transitioning = false;
  private walkTime = 0;
  private wasMoving = false;

  constructor() {
    super('atelier');
  }

  preload(): void {
    this.characterKind = gameStore.getState().character ?? 'rabbit';
    for (const facing of facings) {
      for (const step of [0, 1] as const) {
        this.load.image(characterTextureKey(this.characterKind, facing, step), characterAssetPath(this.characterKind, facing, step));
      }
    }
    for (const [key, path] of Object.entries(sceneAssets)) this.load.image(key, path);
  }

  create(): void {
    for (const facing of facings) {
      for (const step of [0, 1] as const) {
        this.textures.get(characterTextureKey(this.characterKind, facing, step)).setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    }
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
      if (gameStore.getState().quest.completed) this.benchGlow?.setAlpha(0.7);
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
    this.benchGlow = null;
    this.nearestId = null;
    eventBus.emit('INTERACTION_AVAILABLE', { label: null });

    if (this.areaId === 'atelier-exterior') {
      this.add.image(area.width / 2, area.height / 2, 'floorEntry').setDisplaySize(area.width, area.height);
      this.add.image(1100, 575, 'atelier');
    } else {
      this.add.rectangle(700, 450, 1300, 830, 0xd5c4b1).setStrokeStyle(20, 0x67535c);
      this.add.rectangle(700, 100, 1200, 32, 0x67535c);
      this.add.text(700, 65, 'ATELIÊ — INTERIOR', { fontFamily: 'sans-serif', fontSize: '25px', color: '#352b35' }).setOrigin(0.5);
      this.benchGlow = this.add.rectangle(920, 730, 125, 65, 0xf2d48b, 0.8).setDepth(729).setAlpha(gameStore.getState().quest.completed ? 0.7 : 0);
      this.add.image(920, 730, 'bench').setDepth(730);
    }

    const quest = gameStore.getState().quest;
    for (const object of area.objects) {
      if (quest.cleanedObjectIds.includes(object.id)) continue;
      if (object.kind === 'photograph' && !quest.windowOpen) continue;
      const key = objectTextureKey(object.id);
      if (!key) {
        if (this.areaId === 'atelier-interior') this.add.rectangle(object.x, object.y, 74, 20, 0x544557, 0.35).setDepth(object.y);
        continue;
      }
      const image = this.add.image(object.x, object.y, object.kind === 'window' && quest.windowOpen ? 'windowOpen' : key).setDepth(object.y);
      this.objectSprites.set(object.id, image);
    }

    this.facing = 'front';
    this.walkTime = 0;
    this.playerSprite = this.add.image(0, 0, characterTextureKey(this.characterKind, this.facing, 0))
      .setOrigin(0.5, 1)
      .setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    const savedPosition = gameStore.getState().playerPosition;
    const bounds = this.areaId === 'atelier-interior'
      ? { minX: 80, maxX: 1320, minY: 140, maxY: 840 }
      : { minX: 16, maxX: area.width - 16, minY: 8, maxY: area.height - 8 };
    const position = nearestOpenPoint(savedPosition, 15, activeObstacles(this.areaId, quest), bounds);
    if (position.x !== savedPosition.x || position.y !== savedPosition.y) gameStore.getState().setPosition(position);
    this.player = this.add.container(position.x, position.y, [this.playerSprite]);
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
    if (this.nearestId) this.objectSprites.get(this.nearestId)?.clearTint();
    this.nearestId = object?.id ?? null;
    if (this.nearestId) this.objectSprites.get(this.nearestId)?.setTint(0xffdfa8);
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
      this.objectSprites.get(object.id)?.setTexture('windowOpen');
      const photo = areas['atelier-interior'].objects.find((item) => item.kind === 'photograph');
      if (photo) this.objectSprites.set(photo.id, this.add.image(photo.x, photo.y, 'photo').setDepth(photo.y));
    } else {
      eventBus.emit('PHOTO_FOUND', {});
      const photoText = 'Uma fotografia antiga mostra o ateliê e a praça cheios de vida.';
      const text = gameStore.getState().quest.completed
        ? photoText + '\n' + firstQuest.completedText
        : photoText;
      eventBus.emit('NOTICE', { text, image: sceneAssets.photo });
    }
    this.refreshInteraction();
  }

  private showFrame(step: 0 | 1): void {
    const key = characterTextureKey(this.characterKind, this.facing, step);
    if (this.playerSprite.texture.key !== key) this.playerSprite.setTexture(key);
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
      this.showFrame(0);
      this.refreshInteraction();
      return;
    }
    this.wasMoving = true;
    this.facing = direction.y < 0 ? 'back' : direction.y > 0 ? 'front' : direction.x < 0 ? 'left' : 'right';
    const area = areas[this.areaId];
    const distance = SPEED * Math.min(delta, 50) / 1000;
    const nextX = Phaser.Math.Clamp(this.player.x + direction.x * distance, 16, area.width - 16);
    const nextY = Phaser.Math.Clamp(this.player.y + direction.y * distance, 8, area.height - 8);
    const obstacles = activeObstacles(this.areaId, gameStore.getState().quest);
    if (!isBlocked(nextX, this.player.y, 15, obstacles)) this.player.x = nextX;
    if (!isBlocked(this.player.x, nextY, 15, obstacles)) this.player.y = nextY;
    this.player.setDepth(this.player.y);
    this.walkTime += delta;
    this.showFrame(Math.floor(this.walkTime / WALK_FRAME_MS) % 2 as 0 | 1);
    this.refreshInteraction();
  }
}
