# Vila dos Pequenos Encantos

Protótipo web de um cozy game de crafting, decoração e restauração de uma vila. O jogo usa React, TypeScript, Vite 8, Phaser e Zustand.

## Executar

Requer Node.js 24. No diretório do projeto:

```bash
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. O jogo foi projetado para tela horizontal. Use WASD ou as setas para mover, `E`/`Enter` para interagir e o joystick na tela em dispositivos de toque.

A música e os efeitos começam depois de escolher o personagem ou interagir com um save carregado. O botão no canto superior direito liga ou desliga todo o áudio e salva essa preferência no navegador. Veja os [créditos de áudio](CREDITOS-AUDIO.md) e o [registro dos arquivos originais](public/assets/audio/SOURCES.md).

## Estado atual

- Fase 0 (fundação): implementada.
- Fase 1 (personagem): imagens reais em quatro direções, com pose parada e dois frames de caminhada; falta validar em aparelhos reais.
- Fase 2 (ateliê e interações): fachada, piso e objetos com assets; interior e colisões ainda provisórios.
- Fase 3 (primeira missão e salvamento): implementada; progresso salvo localmente no navegador.
- Fase 4 (coleta e crafting): fluxo inicial implementado. Madeira e pedra podem ser coletadas desde o início no exterior. A bancada só pode ser reparada após a primeira missão. O jogador pode então fabricar uma cadeira. O inventário aparece em seis espaços na parte inferior, com imagem e quantidade dos itens; coleta usa uma notificação pequena no canto inferior esquerdo, que agrupa itens iguais e desaparece automaticamente. Inventário e progresso são salvos.
- Fase 5 (decoração): cadeira pode ser posicionada em grade no ateliê, movida ou guardada; a posição persiste no save.
- Fase 6 (polimento mobile): parcialmente adiantada pelo áudio; há música, efeitos e um controle persistido no navegador. A validação em aparelhos reais e os ajustes finais continuam pendentes.

A Fase 4 usa cinco pontos fixos de madeira e três de pedra, coletáveis desde o início; cada ponto reaparece três minutos após a coleta. Durante a espera, um ícone e o tempo restante aparecem sobre o marcador. Os marcadores visuais ainda são provisórios. Saves V1 a V4 são aceitos e passam a V5 no próximo salvamento. Ainda não há cinemática de abertura. O interior e as colisões usam elementos provisórios. O piso externo atual tem cerca de 3 MB; seu carregamento e o áudio ainda precisam ser validados em celular. O fluxo da primeira missão e do save passou em testes automatizados no Chrome desktop; ainda falta validar em aparelhos Android e iOS reais.

## Verificar

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```

O teste E2E atual usa o Chrome instalado no caminho padrão do Windows, configurado em `playwright.config.ts`.

Leia o [documento de design](vila-dos-pequenos-encantos-gdd-mvp.md) e a [especificação técnica](vila-dos-pequenos-encantos-especificacao-tecnica-mvp.md) para o escopo completo do MVP.
