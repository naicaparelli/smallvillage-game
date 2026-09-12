# Vila dos Pequenos Encantos

## Especificação técnica e orientações para implementação do MVP

**Objetivo deste documento:** orientar uma IA programadora na criação do código do jogo.  
**Plataforma:** navegador web em celulares.  
**Orientação principal:** horizontal — landscape.  
**Tecnologia principal:** React, TypeScript, Vite e Phaser.  
**Documento complementar:** `vila-dos-pequenos-encantos-gdd-mvp.md`.

### Estado de implementação

| Fase | Situação | Resultado atual |
| --- | --- | --- |
| 0 — Fundação | Concluída na implementação; validação manual mobile pendente | React, TypeScript estrito, Vite 8, Phaser único, Event Bus, store vanilla, layout horizontal, tela de rotação, build, lint e Vitest. |
| 1 — Personagem | Implementada com dois frames; validação mobile pendente | Seleção das três espécies, PNGs nas quatro direções, pose parada e passo alternado, teclado, joystick, movimento cardinal e câmera. |
| 2 — Ateliê e interação | Implementada; validação mobile pendente | Fachada, piso externo e objetos com os PNGs enviados; interior e colisões ainda provisórios. Porta, ação contextual, caixas, teias, janela e fotografia funcionam. |
| 3 — Missão e salvamento | Implementada; validação mobile pendente | Primeira missão orientada a eventos, HUD e Caderno, conclusão idempotente, save local V1 com personagem, área, posição e progresso; fluxo de recarga testado em Chrome desktop. |
| 4 — Coleta e crafting | Não iniciada | Sem recursos, inventário ou bancada funcional. |
| 5 — Decoração | Não iniciada | Sem posicionamento de móveis. |
| 6 — Polimento mobile | Não iniciada | Sem áudio, testes em aparelhos reais ou ajustes finais de desempenho e acessibilidade. |

O exterior, os objetos interativos e os personagens usam os PNGs enviados; o interior e os obstáculos ainda usam formas provisórias. Os personagens são exibidos em 28 × 48 px sem alterar os arquivos originais. O piso externo atual tem cerca de 3 MB; ainda falta validar seu carregamento em celular. O canvas usa `Phaser.Scale.RESIZE` e ocupa a janela; a câmera segue o personagem dentro dos limites do mapa e centraliza o mapa nos eixos menores que a tela. A orientação vertical exibe um aviso e pausa o movimento. Objetos e obstáculos do ateliê ficam em `src/data/areas.ts`; colisões usam retângulos simples, sem física avançada. Build, lint, testes unitários e um teste Playwright de escolha → entrada → limpeza → recarga passaram em Chrome desktop. Ainda não houve validação em Android/iOS reais.

---

## 1. Resultado esperado

Construir um MVP web jogável de **Vila dos Pequenos Encantos**, otimizado para celular em modo horizontal, contendo uma pequena experiência vertical:

1. Tela inicial.
2. Seleção entre coelhinho, gatinho e cachorrinho.
3. Cinemática curta apresentando a mudança para a vila.
4. Exterior do ateliê.
5. Entrada no ateliê.
6. Primeira missão de limpeza.
7. Coleta de materiais.
8. Reparo da primeira bancada.
9. Crafting de pelo menos um móvel.
10. Posicionamento do móvel no ambiente.
11. Salvamento automático do progresso.

O código deve priorizar clareza, manutenção, desempenho mobile e facilidade para adicionar novas missões, receitas e mapas sem reescrever os sistemas existentes.

---

## 2. Decisões técnicas obrigatórias

### 2.1 Stack

- **Node.js 24 LTS**.
- **React** na versão estável compatível com o projeto.
- **TypeScript** com modo `strict`.
- **Vite 8** para desenvolvimento e build.
- **Phaser 4.2.1 ou patch compatível da linha 4.2** para o mundo 2D.
- **Zustand**, utilizando uma store vanilla compartilhável entre React e Phaser.
- **Vitest** para testes unitários.
- **Playwright** para testes do fluxo no navegador e em viewports mobile.
- ESLint e Prettier para qualidade e consistência.

Todas as versões devem ser registradas no `package.json` e fixadas pelo arquivo de lock. Não atualizar dependências durante o desenvolvimento do MVP sem uma tarefa específica de atualização.

### 2.2 Responsabilidade de cada tecnologia

#### React

React deve cuidar de:

- Tela inicial.
- Seleção de personagem.
- Cinemática em painéis.
- HUD.
- Inventário.
- Interface de crafting.
- Diário de missões.
- Diálogos e modais.
- Configurações.
- Tela de orientação incorreta.
- Feedbacks acessíveis.

#### Phaser

Phaser deve cuidar de:

- Canvas do jogo.
- Carregamento e renderização dos mapas.
- Personagem e animações.
- Movimentação.
- Câmera.
- Colisões.
- Objetos coletáveis.
- Elementos interativos do cenário.
- Prévia e posicionamento de decorações.
- Efeitos visuais dentro do mundo.

#### Zustand

A store deve manter o estado persistente e compartilhado:

- Personagem selecionado.
- Inventário.
- Receitas desbloqueadas.
- Missões e objetivos.
- Decorações posicionadas.
- Estado de restauração dos locais.
- Configurações de áudio e acessibilidade.

### 2.3 Regra arquitetural principal

**Não executar o game loop no React.** Movimento, animação e atualização por frame pertencem ao Phaser. React só deve receber eventos relevantes, como mudança de missão, inventário ou abertura de interface.

Não atualizar a store global a cada frame. A posição visual do personagem fica no Phaser e só é sincronizada:

- Ao parar de andar.
- Ao trocar de área.
- Em um checkpoint.
- Antes de salvar.

---

## 3. Inicialização sugerida

```bash
npm create vite@latest vila-dos-pequenos-encantos -- --template react-ts
cd vila-dos-pequenos-encantos
npm install phaser zustand
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test eslint prettier
```

Depois de instalar:

```bash
npm run dev
npm run build
npm run test
```

A IA deve conferir os scripts disponíveis no `package.json` antes de executar comandos. Não deve assumir que um script existe.

---

## 4. Estrutura recomendada de pastas

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.ts
│   └── styles/
├── game/
│   ├── PhaserGame.tsx
│   ├── config/
│   │   └── gameConfig.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── AtelierExteriorScene.ts
│   │   ├── AtelierInteriorScene.ts
│   │   ├── PlazaScene.ts
│   │   ├── ForestScene.ts
│   │   └── AmoraShopScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Npc.ts
│   │   └── ResourceNode.ts
│   ├── systems/
│   │   ├── MovementSystem.ts
│   │   ├── InteractionSystem.ts
│   │   ├── CollectionSystem.ts
│   │   ├── CraftingSystem.ts
│   │   ├── DecorationSystem.ts
│   │   ├── QuestSystem.ts
│   │   └── DialogueSystem.ts
│   ├── input/
│   │   └── MobileControls.ts
│   ├── events/
│   │   ├── EventBus.ts
│   │   └── gameEvents.ts
│   └── utils/
│       ├── isometric.ts
│       └── depth.ts
├── ui/
│   ├── screens/
│   ├── hud/
│   ├── controls/
│   ├── crafting/
│   ├── inventory/
│   ├── dialogue/
│   └── orientation/
├── data/
│   ├── characters.ts
│   ├── items.ts
│   ├── recipes.ts
│   ├── quests.ts
│   ├── dialogues.ts
│   └── maps.ts
├── state/
│   ├── gameStore.ts
│   ├── initialState.ts
│   └── selectors.ts
├── save/
│   ├── saveService.ts
│   ├── migrations.ts
│   └── saveSchema.ts
├── types/
│   └── game.ts
└── tests/

public/
└── assets/
    ├── characters/
    ├── environments/
    ├── items/
    ├── ui/
    ├── audio/
    └── maps/
```

### Regras para a estrutura

- Não criar arquivos gigantes com várias responsabilidades.
- Não duplicar dados de itens, receitas ou missões dentro das cenas.
- Não importar componentes React dentro das classes do Phaser.
- Não acessar objetos internos de uma cena a partir da UI.
- A comunicação entre React e Phaser deve acontecer pelo Event Bus e pela store.

---

## 5. Modelo de execução do jogo

### 5.1 Modos globais

O jogo deve ter uma máquina de estados simples:

```ts
export type GameMode =
  | 'boot'
  | 'menu'
  | 'cutscene'
  | 'explore'
  | 'dialogue'
  | 'crafting'
  | 'decorating'
  | 'paused';
```

Somente um modo pode estar ativo por vez.

Exemplos:

- Em `dialogue`, bloquear movimento e interações do cenário.
- Em `crafting`, manter a cena visível, mas pausar o controle do jogador.
- Em `decorating`, esconder o joystick e ativar controles de posicionamento.
- Em `paused`, interromper atualizações relevantes e silenciar ou reduzir o áudio.

### 5.2 Fluxo inicial

```text
Carregamento
→ Tela inicial
→ Seleção de personagem
→ Cinemática
→ Exterior do ateliê
→ Interior do ateliê
→ Primeira missão
→ Crafting
→ Decoração
→ Checkpoint do MVP
```

### 5.3 Event Bus

Criar eventos tipados para comunicação entre os sistemas:

```ts
export type GameEventMap = {
  PLAYER_READY: { sceneId: string };
  ITEM_COLLECTED: { itemId: string; amount: number };
  ITEM_CRAFTED: { recipeId: string; itemId: string };
  DECORATION_PLACED: { placementId: string; itemId: string };
  NPC_INTERACTED: { npcId: string };
  OBJECT_CLEANED: { objectId: string; objectType: string };
  AREA_ENTERED: { areaId: string };
  QUEST_UPDATED: { questId: string };
  OPEN_DIALOGUE: { dialogueId: string };
  OPEN_CRAFTING: { stationId: string };
  SAVE_REQUESTED: { reason: string };
};
```

O sistema de missões deve reagir a eventos. As cenas não devem alterar objetivos diretamente com condicionais espalhadas.

---

## 6. Renderização e visão isométrica

### 6.1 Unidade visual

- Unidade artística principal: 32 px.
- Tile isométrico de chão recomendado: **64 × 32 px**, proporção 2:1.
- Personagens: células de **32 × 48 px**.
- As construções podem ocupar vários tiles e ultrapassar a altura lógica da célula.
- A fachada do ateliê deve ficar voltada para o jogador, embora o chão utilize grade isométrica.

### 6.2 Conversão de coordenadas

Quando for necessário converter manualmente uma posição lógica para a tela:

```ts
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

export function tileToScreen(tileX: number, tileY: number) {
  return {
    x: (tileX - tileY) * (TILE_WIDTH / 2),
    y: (tileX + tileY) * (TILE_HEIGHT / 2),
  };
}
```

Sempre manter a posição real em coordenadas lógicas. Não salvar somente a posição convertida de tela.

### 6.3 Profundidade dos objetos

Ordenar personagens, móveis e elementos altos a partir da base visual:

```ts
sprite.setDepth(sprite.y + depthOffset);
```

Atualizar a profundidade apenas quando o objeto mudar de posição ou tile. Não recalcular objetos estáticos a cada frame.

### 6.4 Pixel art

Configuração atual do protótipo (o elemento pai ocupa toda a janela):

```ts
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: hostElement,
  width: hostElement.clientWidth,
  height: hostElement.clientHeight,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#25212f',
  scale: { mode: Phaser.Scale.RESIZE },
};
```

Regras:

- Usar `image-rendering: pixelated` no canvas quando necessário.
- Evitar escalas individuais diferentes entre sprites do mesmo conjunto.
- Usar posições inteiras para sprites e câmera.
- Para pixel art nativa, não aplicar filtros de suavização. Os PNGs atuais dos personagens têm 177 × 304 px e recebem filtro linear apenas ao serem reduzidos para 28 × 48 px na renderização.
- Ativar `roundPixels` também na câmera ao seguir o personagem.
- Testar tremulação de pixels durante o movimento em aparelhos reais.

---

## 7. Layout mobile horizontal

### 7.1 Viewport

Configurar o documento para ocupar a tela inteira:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
/>
```

CSS base:

```css
html,
body,
#root {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  overscroll-behavior: none;
  background: #25212f;
}

.game-shell {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
}

#game-container {
  width: 100%;
  height: 100%;
  touch-action: none;
  user-select: none;
}
```

Não aplicar padding ao canvas: ele deve preencher a janela sem faixas laterais. Os controles e demais elementos de interface devem respeitar as safe areas individualmente.

### 7.2 Orientação horizontal

- Incluir `orientation: "landscape"` no Web App Manifest.
- Detectar quando `window.innerHeight > window.innerWidth`.
- Em modo vertical, pausar o jogo e exibir uma tela React pedindo para girar o aparelho.
- Não depender apenas de `screen.orientation.lock()`, pois a disponibilidade varia conforme navegador, modo de instalação e tela cheia.
- Oferecer tela cheia somente após uma ação explícita do usuário.

### 7.3 Distribuição do HUD

- **Canto superior esquerdo:** objetivo atual resumido.
- **Canto superior direito:** materiais relevantes ou acesso ao inventário.
- **Canto inferior esquerdo:** joystick virtual.
- **Canto inferior direito:** botão de ação contextual.
- **Centro inferior:** mensagem curta da interação disponível.
- **Centro da tela:** diálogos, crafting e decoração em modais ou painéis.

Todos os elementos devem respeitar as safe areas do aparelho.

### 7.4 Tamanho de interação

- Áreas de toque com pelo menos 44 × 44 CSS px.
- Espaçamento suficiente entre ações destrutivas e ações comuns.
- Nunca depender apenas de hover.
- Informações exibidas por hover no desktop devem aparecer por toque ou foco no celular.

---

## 8. Controles

### 8.1 Exploração

Para o MVP, usar:

- Joystick virtual no lado esquerdo.
- Botão de ação contextual no lado direito.
- Teclado WASD ou setas para desenvolvimento no computador.
- Tecla `E` ou `Enter` para interação no computador.

O joystick deve utilizar Pointer Events e suportar toque, mouse e caneta pelo mesmo código.

### 8.2 Movimento

- Movimento em quatro direções cardinais de tela: norte, sul, leste e oeste, mesmo com cenários em perspectiva elevada/isométrica.
- Converter a direção analógica do joystick para a direção predominante.
- Velocidade inicial recomendada: 90 px/s, ajustável por constante.
- Não permitir movimento diagonal. Se dois comandos forem pressionados, usar o eixo predominante; em empate, priorizar o eixo vertical.
- Não utilizar aceleração ou inércia no MVP.
- Atualizar animação conforme direção e velocidade.
- Ao soltar o joystick, exibir o primeiro frame idle da última direção.

### 8.3 Interação contextual

Quando o jogador estiver próximo de um objeto interativo:

1. Selecionar o objeto válido mais próximo.
2. Destacar discretamente o objeto.
3. Alterar o ícone e o texto do botão de ação.
4. Executar somente uma ação por toque.

Prioridade sugerida:

1. Diálogo com NPC.
2. Porta ou transição.
3. Objeto necessário para missão.
4. Estação de crafting.
5. Recurso coletável.
6. Objeto decorativo inspecionável.

Raio inicial de interação: aproximadamente um tile lógico, ajustado em teste.

### 8.4 Bloqueio de controles

Criar uma única fonte de verdade para saber se o jogador pode se mover. Não espalhar verificações diferentes por cada cena.

```ts
const canMove = gameMode === 'explore' && !transitionInProgress;
```

---

## 9. Sistema do personagem

### 9.1 Seleção

```ts
export type CharacterKind = 'rabbit' | 'kitten' | 'puppy';
```

A espécie modifica apenas:

- Chaves das imagens por direção e estado.
- Animações.
- Retrato do personagem.
- Nome visual da opção.

Não criar diferenças de atributos, velocidade ou receitas entre as espécies no MVP.

### 9.2 Animações

Para cada personagem:

- Idle norte.
- Idle sul.
- Idle leste.
- Idle oeste.
- Walk norte com dois frames no MVP.
- Walk sul com dois frames no MVP.
- Walk leste com dois frames no MVP.
- Walk oeste com dois frames no MVP.

Configuração inicial da caminhada:

- Aproximadamente 6 frames por segundo com alternância entre pose base e passo; ampliar apenas quando houver novos frames.
- Repetição contínua durante movimento.
- Retorno imediato ao idle quando parar.

### 9.3 Hitbox

A hitbox deve representar somente a área dos pés, não o corpo inteiro ou as orelhas. Isso permite que a cabeça e acessórios passem visualmente diante de objetos sem bloquear o movimento.

---

## 10. Mapas e transições

### 10.1 Mapas do MVP

- Exterior do ateliê.
- Interior do ateliê.
- Praça.
- Floresta.
- Loja de Amora.

Desenvolver primeiro apenas o exterior e o interior do ateliê. Os demais entram após a validação do loop principal.

### 10.2 Camadas sugeridas

Cada mapa deve separar:

- Chão.
- Decoração abaixo do jogador.
- Obstáculos.
- Elementos acima do jogador.
- Pontos de interação.
- Áreas de transição.
- Pontos de nascimento.
- Células reservadas para decoração.

Utilizar mapas isométricos em JSON quando adequado. Objetos interativos devem possuir IDs estáveis.

### 10.3 Transição de área

1. Bloquear controles.
2. Salvar posição e estado atual.
3. Aplicar fade curto.
4. Iniciar ou acordar a cena de destino.
5. Posicionar o personagem no spawn correto.
6. Remover o fade.
7. Reativar controles.

Não manter várias áreas completas atualizando ao mesmo tempo.

---

## 11. Sistema de coleta

### 11.1 Estrutura dos recursos

```ts
export interface ResourceNodeDefinition {
  id: string;
  itemId: string;
  amount: number;
  requiredQuestId?: string;
  respawnPolicy: 'never' | 'onQuestCheckpoint' | 'onAreaReload';
}
```

### 11.2 Fluxo

1. Jogador se aproxima.
2. Objeto recebe destaque.
3. Botão contextual mostra “Coletar”.
4. Ao tocar, executar animação curta.
5. Adicionar o item ao inventário.
6. Exibir feedback visual e sonoro.
7. Emitir `ITEM_COLLECTED`.
8. Atualizar o estado do nó.

### 11.3 Regra do MVP

Não usar energia, ferramentas com durabilidade ou tempo de espera real. Os nós reaparecem apenas em checkpoints ou ao recarregar uma área, conforme sua definição.

---

## 12. Inventário

### 12.1 Simplificação para o MVP

- Sem limite de peso.
- Sem limite de slots.
- Itens iguais acumulam quantidade.
- Categorias: materiais, móveis e itens de missão.
- Itens de missão não podem ser descartados.
- Não implementar arrastar e soltar no inventário.

```ts
export interface InventoryStack {
  itemId: string;
  quantity: number;
}
```

Todas as operações de inventário devem ser atômicas:

- Validar quantidade.
- Aplicar mudança.
- Emitir evento.
- Solicitar salvamento.

Nunca remover materiais antes de validar completamente uma receita.

---

## 13. Sistema de crafting

### 13.1 Definições baseadas em dados

```ts
export interface RecipeDefinition {
  id: string;
  stationType: 'woodworking' | 'sewing' | 'painting';
  ingredients: Array<{ itemId: string; amount: number }>;
  output: { itemId: string; amount: number };
  unlockQuestId?: string;
}
```

### 13.2 Fluxo

1. Interagir com a estação.
2. Mudar o modo para `crafting`.
3. Abrir painel React.
4. Listar apenas receitas desbloqueadas e compatíveis.
5. Mostrar ingredientes existentes e ausentes.
6. Confirmar criação.
7. Revalidar os materiais.
8. Remover ingredientes e adicionar resultado em uma única transação.
9. Emitir `ITEM_CRAFTED`.
10. Salvar.

### 13.3 Regras do MVP

- Crafting instantâneo.
- Sem fila de produção.
- Sem chance de falha.
- Sem qualidade aleatória.
- Sem minigame.
- Uma unidade por confirmação, com opção futura de aumentar quantidade.

---

## 14. Sistema de decoração

### 14.1 Entrada no modo

O jogador abre a decoração dentro de uma área permitida. O jogo muda para `decorating`, bloqueia movimento e esconde os controles de exploração.

### 14.2 Posicionamento

1. Selecionar um móvel disponível.
2. Criar um sprite fantasma semitransparente.
3. Converter o toque para a célula lógica mais próxima.
4. Verificar ocupação, limites e células reservadas.
5. Mostrar estado válido em verde e inválido em vermelho.
6. Confirmar o posicionamento.
7. Remover o item do inventário de móveis disponíveis.
8. Registrar a posição.
9. Emitir `DECORATION_PLACED`.
10. Reavaliar requisitos da missão.

### 14.3 Modelo de dados

```ts
export interface DecorationPlacement {
  id: string;
  itemId: string;
  areaId: string;
  tileX: number;
  tileY: number;
  orientation: 0 | 1;
}

export interface FurnitureDefinition {
  id: string;
  spriteKey: string;
  footprint: Array<{ x: number; y: number }>;
  allowedSurfaces: Array<'floor' | 'wall'>;
  tags: Array<'cozy' | 'light' | 'natural' | 'colorful'>;
  tagValues: Partial<Record<'cozy' | 'light' | 'natural' | 'colorful', number>>;
}
```

### 14.4 Rotação

A arquitetura deve suportar duas orientações, mas o botão de rotação só deve aparecer para itens que possuam sprites correspondentes. Não girar uma imagem automaticamente se isso quebrar a perspectiva da pixel art.

### 14.5 Células protegidas

Não permitir objetos em:

- Portas.
- Spawns.
- Áreas de transição.
- Base de NPCs.
- Estações obrigatórias.
- Células necessárias para concluir a missão.

Para validar circulação, executar uma busca simples em largura — BFS — entre a entrada do ambiente e os pontos obrigatórios. Se o posicionamento bloquear todos os caminhos, impedir a confirmação.

### 14.6 Desfazer

Guardar pelo menos a última ação de posicionamento para permitir “Desfazer”. A ação deve restaurar posição, inventário e pontuação de requisitos.

---

## 15. Requisitos de decoração

As missões podem avaliar diferentes tipos de condição:

```ts
export type DecorationRequirement =
  | { type: 'item'; itemId: string; minimum: number }
  | { type: 'tagScore'; tag: string; minimum: number }
  | { type: 'freeCells'; minimum: number }
  | { type: 'reachable'; targetId: string };
```

Exemplo da loja de Amora:

- Pelo menos uma luminária.
- Pontuação `cozy` igual ou superior a 3.
- Pontuação `colorful` igual ou superior a 2.
- Porta e balcão acessíveis.

A interface deve mostrar o progresso de cada requisito em tempo real, sem exigir tentativa e erro oculto.

---

## 16. Sistema de missões

### 16.1 Estrutura

```ts
export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  objectives: QuestObjectiveDefinition[];
  rewards: Array<{ type: string; id?: string; amount?: number }>;
  nextQuestIds: string[];
}

export interface QuestProgress {
  questId: string;
  status: 'locked' | 'available' | 'active' | 'completed';
  objectiveProgress: Record<string, number | boolean>;
}
```

### 16.2 Princípios

- Missões são dados; cenas executam ações genéricas.
- Objetivos avançam por eventos.
- Completar um objetivo duas vezes não pode duplicar recompensa.
- Conclusão e recompensa formam uma transação idempotente.
- O jogador possui uma missão principal ativa no MVP.
- O HUD mostra somente o objetivo atual mais relevante.

### 16.3 Eventos observados

- Limpar objeto.
- Coletar item.
- Criar item.
- Posicionar decoração.
- Conversar com NPC.
- Entrar em área.
- Interagir com objeto especial.

---

## 17. Primeira missão implementável

### Um recomeço empoeirado

Objetivos:

1. Retirar cinco caixas.
2. Limpar três teias.
3. Abrir a janela.
4. Encontrar a fotografia antiga.

### Objetos de cena

```ts
const firstQuestObjects = {
  boxes: ['box_01', 'box_02', 'box_03', 'box_04', 'box_05'],
  cobwebs: ['cobweb_01', 'cobweb_02', 'cobweb_03'],
  window: 'atelier_window_main',
  photograph: 'atelier_old_photo',
};
```

### Regras

- Cada objeto só pode ser limpo uma vez.
- Reabrir o jogo mantém os objetos já removidos.
- A fotografia só fica interativa após abrir a janela.
- Concluir a missão ativa a luz da bancada quebrada.
- Mostrar a mensagem narrativa correspondente.
- Criar checkpoint automático.

---

## 18. Diálogos e cinematics

### 18.1 Diálogos

```ts
export interface DialogueLine {
  speakerId: string;
  portraitKey?: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'surprised';
}
```

Regras do MVP:

- Avançar por toque.
- Exibir indicador quando houver próxima fala.
- Permitir acelerar a revelação do texto.
- Não implementar árvore complexa de escolhas.
- Bloquear o movimento durante o diálogo.
- Permitir pular apenas cinematics já assistidas ou após confirmação.

### 18.2 Cinemática inicial

Implementar como sequência de painéis React com ilustrações, transições simples e texto curto:

1. Escritório cinza e azul.
2. Anúncio do ateliê no computador.
3. Pedido de demissão e viagem.
4. Chegada à vila devastada.
5. Revelação do ateliê real.

Não criar vídeo pesado para o MVP.

---

## 19. Salvamento

### 19.1 Estratégia

Usar `localStorage` no MVP porque o save é pequeno e local. Centralizar o acesso em `saveService.ts`; nenhum componente ou cena deve acessar `localStorage` diretamente.

```ts
export interface SaveDataV1 {
  version: 1;
  updatedAt: string;
  character: CharacterKind;
  areaId: 'atelier-exterior' | 'atelier-interior';
  playerPosition: { x: number; y: number };
  quest: {
    cleanedObjectIds: string[];
    windowOpen: boolean;
    photoFound: boolean;
    completed: boolean;
  };
}
```

Este é o formato **implementado** do save V1. Inventário, receitas, decorações e configurações entrarão em uma versão futura com migração explícita; não adicionar campos obrigatórios à V1 já publicada sem migrar os saves existentes.

### 19.2 Regras

- Usar uma chave versionada, por exemplo `little-enchantments:save:v1`.
- Validar o conteúdo ao carregar.
- Se o save estiver corrompido, preservar uma cópia e oferecer novo jogo.
- Criar migrações para versões futuras.
- Debounce de aproximadamente 500 ms para mudanças frequentes.
- Salvar imediatamente ao concluir missão, trocar de área ou sair do modo decoração.
- Salvar ao receber `visibilitychange` para estado oculto.
- Nunca salvar objetos Phaser, texturas, sprites ou referências circulares.

---

## 20. Áudio

- Iniciar áudio somente após a primeira interação do usuário.
- Disponibilizar controles separados para música e efeitos.
- Pausar música ou reduzir processamento quando a página ficar oculta.
- Usar arquivos comprimidos e curtos.
- Não carregar todas as músicas do jogo no primeiro acesso.
- O jogo deve funcionar completamente sem áudio.

---

## 21. Acessibilidade e usabilidade

- Menus e modais devem ser HTML/React para permitir foco e leitores de tela.
- Botões devem possuir nomes acessíveis.
- Não comunicar estados somente por cor.
- Oferecer redução de movimento.
- Permitir desativar vibração e efeitos de tela.
- Usar fonte legível em telas pequenas.
- Manter contraste adequado sobre a pixel art.
- Não usar textos importantes diretamente dentro do canvas.
- Permitir fechar modais com botão visível e tecla `Escape` no desktop.
- Exibir confirmações antes de apagar progresso ou iniciar novo jogo.

---

## 22. Desempenho mobile

### Metas

- 60 FPS em aparelhos intermediários.
- Experiência funcional a 30 FPS em aparelhos de entrada.
- Primeiro carregamento leve e progressivo.
- Interações visuais respondendo em até 100 ms quando possível.

### Regras

- Utilizar atlas de texturas.
- Carregar assets por área.
- Destruir listeners ao desmontar componentes e cenas.
- Não criar uma instância nova do Phaser a cada render do React.
- Não atualizar React com a posição do personagem a cada frame.
- Evitar partículas excessivas e filtros caros.
- Limitar luzes dinâmicas no MVP.
- Reutilizar objetos temporários quando possível.
- Pausar cenas e áudio quando a página ficar oculta.
- Testar em Android Chrome e iOS Safari reais.

---

## 23. PWA e comportamento semelhante a aplicativo

O MVP deve continuar funcionando como site normal. A instalação como PWA pode ser adicionada sem alterar o gameplay.

Manifesto sugerido:

```json
{
  "name": "Vila dos Pequenos Encantos",
  "short_name": "Pequenos Encantos",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#25212f",
  "theme_color": "#7b6b91",
  "start_url": "/"
}
```

Não prometer funcionamento offline até que o service worker e o cache dos assets tenham sido implementados e testados.

---

## 24. Testes obrigatórios

### 24.1 Testes unitários com Vitest

Testar sem Phaser sempre que possível:

- Adicionar e remover itens.
- Falha de crafting por falta de material.
- Crafting atômico bem-sucedido.
- Validação de posição de móvel.
- Cálculo de requisitos decorativos.
- Bloqueio de passagem.
- Atualização de objetivos por evento.
- Recompensa idempotente.
- Serialização e migração de save.
- Conversão entre tile e tela.

### 24.2 Testes de fluxo com Playwright

- Abrir em viewport horizontal mobile.
- Exibir aviso em viewport vertical.
- Selecionar cada personagem.
- Pular e concluir a cinemática.
- Entrar no ateliê.
- Concluir a primeira missão.
- Recarregar a página e manter progresso.
- Abrir crafting e criar um item.
- Colocar um móvel válido.
- Impedir móvel sobre a porta.

Executar pelo menos projetos equivalentes a Android Chrome e Mobile Safari.

---

## 25. Ordem de implementação

### Fase 0 — Fundação

**Estado atual:** implementação concluída; falta validar o aceite visual e a ausência de scroll em aparelhos reais.

- Criar projeto React + TypeScript + Vite.
- Integrar uma única instância do Phaser.
- Criar Event Bus e store.
- Implementar layout horizontal e tela de rotação.
- Configurar lint, build e testes.

**Aceite:** aplicação abre sem erros, canvas se ajusta e não existe scroll da página.

### Fase 1 — Personagem

**Estado atual:** implementada com as imagens atuais e dois frames por direção; falta validar toque, escala e desempenho em Android/iOS reais.

- Tela de seleção.
- Carregamento das imagens dos três personagens nas quatro direções.
- Spawn do personagem.
- Joystick e teclado.
- Quatro direções e animações.
- Câmera seguindo o jogador.

**Aceite:** os três personagens se movimentam corretamente em celular e desktop.

### Fase 2 — Ateliê e interação

**Estado atual:** fachada, piso e objetos usam os PNGs enviados; o interior continua provisório. O fluxo com teclado e save passou em Chrome desktop; falta validar toque em Android/iOS reais.

- Exterior e interior.
- Colisões.
- Porta e transição.
- Botão contextual.
- Objetos de limpeza.

**Aceite:** o jogador entra no ateliê e interage com todos os objetos da primeira missão.

### Fase 3 — Missão e salvamento

**Estado atual:** implementada e testada automaticamente em Chrome desktop; ainda falta validação em Android/iOS reais. O save V1 registra personagem, área, posição e primeira missão; novos sistemas persistentes exigirão migração de versão.

- Quest System orientado a eventos.
- HUD de objetivo.
- Conclusão da primeira missão.
- Save local versionado.

**Aceite:** recarregar a página preserva missão, personagem e objetos removidos.

### Fase 4 — Coleta e crafting

**Estado atual:** não iniciada.

- Recursos.
- Inventário.
- Bancada.
- Receita inicial.
- Feedback de criação.

**Aceite:** o jogador coleta materiais e produz um móvel sem inconsistência de inventário.

### Fase 5 — Decoração

**Estado atual:** não iniciada.

- Grade permitida.
- Prévia fantasma.
- Validação de ocupação.
- Posicionar, mover, guardar e desfazer.
- Requisito simples de missão.

**Aceite:** o móvel pode ser colocado e salvo, mas não pode bloquear porta ou célula protegida.

### Fase 6 — Polimento mobile

**Estado atual:** não iniciada.

- Áudio.
- Safe areas.
- Tela cheia opcional.
- Ajustes de desempenho.
- Acessibilidade.
- Testes Android e iOS.

**Aceite:** vertical slice jogável sem erros bloqueadores nos navegadores-alvo.

---

## 26. Primeiro vertical slice

Antes de criar todos os mapas e missões, a IA deve entregar este fluxo:

1. Jogador escolhe uma espécie.
2. Cinemática curta é exibida.
3. Personagem aparece diante do ateliê.
4. Jogador entra no prédio.
5. Caderno dos Encantos inicia a missão.
6. Jogador remove uma caixa e uma teia.
7. Estado é salvo.
8. Jogador recarrega a página.
9. O personagem e os objetos continuam no estado correto.

Somente depois desse fluxo funcionar a IA deve implementar todos os objetivos, crafting e decoração.

---

## 27. Contrato de trabalho para a IA programadora

Ao receber esta especificação, a IA deve:

1. Ler o GDD e esta especificação antes de alterar código.
2. Inspecionar a estrutura e as dependências existentes.
3. Criar ou atualizar um plano curto de implementação.
4. Trabalhar em apenas uma fase por vez.
5. Não inventar novas mecânicas sem registrar a decisão.
6. Manter dados de conteúdo fora das cenas.
7. Preservar assets e alterações existentes.
8. Usar TypeScript estrito e evitar `any`.
9. Tratar estados vazios, erros e interrupções.
10. Escrever testes para regras de negócio.
11. Executar lint, testes e build antes de concluir.
12. Informar arquivos alterados, testes realizados e limitações conhecidas.

### Proibições

- Não implementar backend, login ou multiplayer no MVP.
- Não adicionar sistemas de energia, anúncios ou pagamentos.
- Não criar dezenas de dependências para resolver tarefas simples.
- Não guardar regras importantes somente em componentes de UI.
- Não usar React como motor de atualização por frame.
- Não escrever todo o jogo em uma única cena.
- Não gerar assets permanentes improvisados sem aprovação.
- Não substituir silenciosamente uma imagem aprovada.
- Não avançar para a próxima fase com build ou testes quebrados.

---

## 28. Definition of Done geral

Uma funcionalidade só é considerada concluída quando:

- Funciona com toque no celular.
- Funciona com mouse e teclado no desktop.
- Respeita a orientação horizontal.
- Não cria scroll acidental.
- Não bloqueia as safe areas.
- Possui estado de erro ou indisponibilidade quando aplicável.
- Persiste corretamente quando fizer parte do save.
- Possui testes para regras críticas.
- Passa em TypeScript, lint, testes e build.
- Não degrada perceptivelmente o desempenho.
- Está documentada quando introduz uma nova regra ou formato de dados.

---

## 29. Referências técnicas oficiais

- [React — Using TypeScript](https://react.dev/learn/typescript)
- [Vite — Getting Started](https://vite.dev/guide/)
- [Node.js — Releases](https://nodejs.org/en/about/previous-releases)
- [Phaser — Download](https://phaser.io/download)
- [Phaser — React + TypeScript template](https://github.com/phaserjs/template-react-ts)
- [Phaser — Tilemaps](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap)
- [Phaser — Scale Manager](https://docs.phaser.io/phaser/concepts/scale-manager)
- [Phaser — Cameras and roundPixels](https://docs.phaser.io/phaser/concepts/cameras)
- [Zustand — Vanilla createStore](https://zustand.docs.pmnd.rs/reference/apis/create-store)
- [MDN — Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [MDN — touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action)
- [MDN — Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API)
- [MDN — orientation no Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/orientation)
- [MDN — Safe areas com env()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env)
- [MDN — Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [MDN — Autoplay e Web Audio](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [Playwright — Emulação mobile](https://playwright.dev/docs/emulation)
- [Vitest — Getting Started](https://vitest.dev/guide/)

---

## 30. Resumo para iniciar o código

> Crie um jogo web mobile-first em React, TypeScript, Vite e Phaser, executado prioritariamente em celulares no modo horizontal. React controla menus e HUD; Phaser controla o mundo e o game loop; uma store vanilla mantém o estado persistente. Implemente primeiro a seleção de personagem, o exterior e interior do ateliê, movimentação em quatro direções, interação contextual e a primeira missão. Só depois adicione crafting e decoração. Mantenha conteúdo orientado a dados, save versionado, controles por toque, pixel art nítida e testes automatizados.
