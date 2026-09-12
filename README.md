# Vila dos Pequenos Encantos

Protótipo web de um cozy game de crafting, decoração e restauração de uma vila. O jogo usa React, TypeScript, Vite 8, Phaser e Zustand.

## Executar

Requer Node.js 24. No diretório do projeto:

```bash
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. O jogo foi projetado para tela horizontal. Use WASD ou as setas para mover, `E`/`Enter` para interagir e o joystick na tela em dispositivos de toque.

## Estado atual

- Fase 0 (fundação): implementada.
- Fase 1 (personagem): parcial; ainda faltam spritesheets e animações finais.
- Fase 2 (ateliê e interações): implementada com formas provisórias.
- Fase 3 (primeira missão e salvamento): implementada; progresso salvo localmente no navegador.
- Fases 4 a 6: ainda não iniciadas.

Os mapas e personagens atuais são provisórios. O fluxo da missão e do save passou em testes automatizados no Chrome desktop; ainda falta validar em aparelhos Android e iOS reais.

## Verificar

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```

O teste E2E atual usa o Chrome instalado no caminho padrão do Windows, configurado em `playwright.config.ts`.

Leia o [documento de design](vila-dos-pequenos-encantos-gdd-mvp.md) e a [especificação técnica](vila-dos-pequenos-encantos-especificacao-tecnica-mvp.md) para o escopo completo do MVP.
