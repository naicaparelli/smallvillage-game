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
- Fase 1 (personagem): imagens reais em quatro direções, com pose parada e dois frames de caminhada; falta validar em aparelhos reais.
- Fase 2 (ateliê e interações): fachada, piso e objetos com assets; interior e colisões ainda provisórios.
- Fase 3 (primeira missão e salvamento): implementada; progresso salvo localmente no navegador.
- Fases 4 a 6: ainda não iniciadas.

O piso externo atual tem cerca de 3 MB; seu carregamento ainda precisa ser validado em celular. O fluxo da missão e do save passou em testes automatizados no Chrome desktop; ainda falta validar em aparelhos Android e iOS reais.

## Verificar

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```

O teste E2E atual usa o Chrome instalado no caminho padrão do Windows, configurado em `playwright.config.ts`.

Leia o [documento de design](vila-dos-pequenos-encantos-gdd-mvp.md) e a [especificação técnica](vila-dos-pequenos-encantos-especificacao-tecnica-mvp.md) para o escopo completo do MVP.
