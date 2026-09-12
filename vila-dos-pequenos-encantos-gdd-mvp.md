# Vila dos Pequenos Encantos

## Documento de conceito e escopo do MVP

**Gênero:** cozy game de crafting, decoração e narrativa  
**Plataforma inicial:** dispositivos móveis  
**Perspectiva:** visão elevada com ambientes e construções em composição isométrica/frontal  
**Direção visual:** pixel art baseada em tiles de 32 px  
**Status:** conceito definido; protótipo técnico em desenvolvimento (Fase 0 concluída, Fases 1 a 3 implementadas, com validação mobile pendente)

### Estado atual do protótipo

- A base web abre em tela horizontal com o mapa ocupando toda a área visível, sem faixas laterais ou texto de protótipo sobreposto.
- O mapa provisório é maior que a tela. A câmera acompanha o personagem e centraliza o mapa em qualquer eixo no qual ele seja menor que a área visível.
- Há seleção entre coelhinho, gatinho e cachorrinho. Cada personagem usa imagens próprias para frente, costas, esquerda e direita, com pose parada e um passo alternado. As imagens originais são preservadas e exibidas em 28 × 48 px, dentro da célula lógica de 32 × 48 px.
- Teclado (WASD/setas) e joystick por toque movem o personagem somente para norte, sul, leste ou oeste. O eixo predominante do joystick define a direção; o movimento diagonal foi removido por decisão de design.
- O exterior e o interior provisórios do ateliê têm porta de entrada/saída, obstáculos e ação contextual por botão ou teclas `E`/`Enter`. Cinco caixas e três teias podem ser removidas; a janela pode ser aberta e libera a inspeção de uma fotografia.
- O Caderno dos Encantos e o HUD acompanham a primeira missão. A limpeza, a janela e a fotografia avançam objetivos sem contagem duplicada; ao concluir, a bancada ganha brilho.
- O progresso é salvo localmente: personagem, área, posição e estado da primeira missão retornam após recarregar. Há opção confirmada de novo jogo.
- A fachada, o piso externo e os objetos interativos agora usam os PNGs enviados. O piso externo atual tem cerca de 3 MB e ainda precisa ser validado em celular. Ainda não há cinemática, crafting ou decoração jogável. O fluxo foi testado automaticamente em Chrome desktop, mas ainda precisa de validação manual em celular.

---

## 1. Visão do jogo

**Vila dos Pequenos Encantos** é um cozy game para celular focado em coleta de materiais, crafting e decoração de ambientes. O jogador deixa uma vida corporativa triste para começar de novo como artesão em uma vila habitada por animais e criaturas fofas.

Ao chegar, porém, descobre que o ateliê comprado pela internet e a própria vila estão muito diferentes do anúncio: os espaços estão abandonados, as cores desapareceram e os moradores perderam a esperança.

O jogador deverá reconstruir seu ateliê, ajudar os moradores e restaurar os ambientes da vila. Cada lugar recuperado revela memórias, histórias e pistas sobre o misterioso **Desbotamento**.

### Resumo em uma frase

> Um cozy game de crafting e decoração em que cada ambiente restaurado recupera as memórias e os encantos de uma vila mágica.

### Fantasia principal do jogador

Recomeçar a vida em um lugar acolhedor, transformar espaços abandonados em ambientes encantadores e perceber que pequenas criações podem reconstruir toda uma comunidade.

---

## 2. Pilares da experiência

### 2.1 Crafting com propósito

O jogador coleta materiais e utiliza mesas de trabalho para produzir móveis, objetos decorativos, tecidos e tintas. Os itens criados são necessários para avançar nas missões e transformar os ambientes.

### 2.2 Decoração que afeta o mundo

A decoração não deve ser apenas estética. A escolha e o posicionamento de determinados itens podem:

- Atender às necessidades de um morador.
- Cumprir requisitos de uma missão.
- Desbloquear receitas ou interações.
- Atrair criaturas especiais.
- Recuperar uma memória.
- Revelar um Pequeno Encanto.

### 2.3 Narrativa leve e emocional

A história aborda recomeço, criatividade, pertencimento e cuidado com a comunidade. O conflito existe, mas o jogo deve permanecer acolhedor e esperançoso.

### 2.4 Progressão visual

O jogador deve perceber claramente o impacto de suas ações. Locais sem vida recuperam cores, iluminação, vegetação, música e movimento conforme são restaurados.

### 2.5 Experiência adequada para celular

O jogo deve permitir sessões curtas, com objetivos que possam ser concluídos em aproximadamente 5 a 10 minutos, sem transformar a experiência cozy em uma obrigação.

---

## 3. Referências e diferenciação

As principais referências iniciais são **Bandle Tale** e **Stardew Valley**, especialmente pela sensação de progressão, crafting, exploração e transformação do ambiente.

O diferencial de Vila dos Pequenos Encantos será colocar a **decoração funcional e narrativa** no centro da experiência. Os ambientes restaurados não servem apenas para exibição: eles mudam o comportamento do mundo e revelam partes da história.

O universo, os personagens, os ambientes, a narrativa e a identidade visual deverão ser originais.

---

## 4. Mundo e atmosfera

A Vila dos Pequenos Encantos já foi um local colorido e conhecido por seus artesãos. A magia da vila era alimentada pelas criações, relações e celebrações de seus moradores.

Com o tempo, surgiu o **Desbotamento**, uma força misteriosa que começou a retirar as cores, as memórias e a motivação dos habitantes. Lojas fecharam, áreas foram abandonadas e os Pequenos Encantos desapareceram.

O Desbotamento não precisa ser representado inicialmente como um vilão. Ele pode ser consequência do afastamento entre os moradores e da perda do hábito de criar, compartilhar e cuidar uns dos outros.

### Tom

- Aconchegante.
- Melancólico no início, mas nunca assustador.
- Esperançoso.
- Divertido e gentil.
- Mágico sem perder a simplicidade cotidiana.

---

## 5. Personagem do jogador

No início, o jogador poderá escolher entre três espécies:

- Coelhinho.
- Gatinho.
- Cachorrinho.

Para manter o MVP simples, a escolha será inicialmente estética. Todos terão as mesmas habilidades, receitas e possibilidades de progressão.

### Identidade visual aprovada

| Personagem | Características | Roupa e paleta |
| --- | --- | --- |
| Coelhinho | Pelagem creme e orelhas longas | Jardineira lilás, lenço amarelo, botas e bolsa marrons |
| Gatinho | Pelagem laranja e creme, listras e olhos verdes | Jardineira azul-petróleo, lenço coral, botas e bolsa marrons |
| Cachorrinho | Pelagem caramelo e creme, orelhas caídas | Jardineira mostarda, lenço verde-sálvia, botas e bolsa marrons |

Os três usam a mesma estrutura de roupa de artesão para que nenhuma espécie pareça representar uma classe ou vantagem diferente.

### Especificação dos sprites

- Célula lógica: **32 × 48 px**.
- Quatro direções: norte, sul, leste e oeste.
- Um sprite parado por direção.
- Ciclo de caminhada com dois frames por direção neste MVP: pose base e um passo. A estrutura de arquivos permite adicionar mais frames depois.
- Perspectiva compatível com os ambientes do jogo.
- Silhuetas diferentes, mas escala e importância visual equivalentes.

---

## 6. Cinemática de abertura

O personagem trabalha em um escritório de uma cidade grande. O ambiente utiliza tons frios de cinza e azul para transmitir repetição, isolamento e tristeza.

Durante o expediente, ele abre o computador e encontra um anúncio:

> **Recomece sua vida na encantadora Vila dos Pequenos Encantos. Ateliê mobiliado, vista privilegiada e vizinhos acolhedores.**

O personagem decide mudar de vida, compra o ateliê, pede demissão e viaja cheio de expectativas.

Ao chegar, encontra:

- A placa da vila quebrada.
- A praça sem cor e coberta por folhas.
- Casas e estabelecimentos abandonados.
- Poucos moradores circulando.
- Um ateliê menor, deteriorado e muito diferente do anúncio.

A partir desse momento, o controle é entregue ao jogador.

---

## 7. O ateliê

O ateliê é a casa, oficina e principal espaço de progressão do jogador. No começo, ele é pequeno e possui poucas funcionalidades.

### Exterior inicial

- Fachada voltada diretamente para o jogador.
- Visão elevada, mantendo o telhado visível.
- Porta e caminho centralizados.
- Telhado lilás desgastado, com buracos, tábuas e musgo.
- Paredes de reboco creme e estrutura de madeira envelhecida.
- Uma janela com luz fraca e outra bloqueada por tábuas.
- Placa quebrada com símbolos de carretel de linha e martelo.
- Vegetação alta, folhas, caixas, vaso caído e cerca quebrada.
- Pequeno brilho âmbar indicando que ainda existe magia no local.

O design exterior deverá possuir uma futura versão restaurada com a mesma arquitetura, permitindo que a evolução visual seja imediatamente reconhecida.

### Interior inicial

- Espaço pequeno e parcialmente bloqueado por caixas e sujeira.
- Poucos locais disponíveis para decoração.
- Uma bancada de crafting quebrada.
- Outras mesas e áreas bloqueadas.
- O **Caderno dos Encantos**, responsável por introduzir missões, receitas e fragmentos da história.

### Evolução futura

O ateliê poderá crescer por meio de melhorias, novos cômodos e novas estações. Para o MVP, a progressão deverá se limitar à limpeza, reparo e primeira restauração do espaço existente.

---

## 8. Loop principal de gameplay

1. Receber uma missão ou pedido.
2. Explorar uma área pequena.
3. Coletar os materiais necessários.
4. Produzir itens nas mesas de crafting.
5. Decorar ou restaurar um ambiente.
6. Cumprir requisitos e concluir o desafio.
7. Desbloquear uma história, receita, personagem ou área.
8. Receber um novo objetivo.

---

## 9. Sistemas do MVP

### 9.1 Coleta

O jogador coleta recursos em pontos específicos do mapa. Os recursos deverão reaparecer de forma simples e previsível.

Materiais iniciais:

- Madeira.
- Pedra.
- Folhas.
- Fibra.
- Flores coloridas.
- Pó de Encanto.

### 9.2 Crafting

O jogador seleciona uma receita, verifica os materiais necessários e produz o item em uma mesa compatível.

Estações planejadas para o MVP:

1. **Bancada de marcenaria:** móveis e objetos de madeira.
2. **Mesa de costura:** tapetes, almofadas e cortinas.
3. **Mesa de pintura:** tintas e variações de cor.

O jogador inicia somente com a bancada de marcenaria. As outras estações são desbloqueadas durante as missões.

### 9.3 Decoração

O modo de decoração deverá permitir:

- Selecionar um item do inventário.
- Visualizar uma prévia no ambiente.
- Posicionar o item em espaços permitidos.
- Mover e guardar itens já colocados.
- Conferir o progresso dos requisitos da missão.

Rotação livre, grandes catálogos e personalização avançada de cores podem ficar fora do primeiro MVP.

### 9.4 Missões

As missões orientam a progressão e apresentam as mecânicas gradualmente. Cada missão deverá possuir um objetivo narrativo e ensinar apenas uma ou duas ações novas.

### 9.5 Caderno dos Encantos

O livro funciona como centro de progressão e pode reunir:

- Missões ativas.
- Receitas desbloqueadas.
- Materiais descobertos.
- Fragmentos de memória.
- Pequenos Encantos recuperados.

No MVP, ele pode começar apenas como diário de missões e receitas.

---

## 10. Locais do MVP

Para limitar a complexidade, o primeiro arco utilizará somente quatro locais:

1. **Ateliê:** casa, oficina e espaço pessoal do jogador.
2. **Praça:** centro visual e narrativo da vila.
3. **Floresta:** pequena área de coleta de madeira, fibras e flores.
4. **Loja de Amora:** primeiro ambiente externo restaurado pelo jogador.

Os mapas deverão ser compactos e interligados por transições curtas.

---

## 11. Personagens do MVP

### Amora — gatinha confeiteira

É a primeira moradora que confia no jogador. Sua pequena confeitaria está fechada desde que a vila começou a perder as cores. Amora apresenta as encomendas de decoração e oferece o primeiro grande espaço para restauração.

### Pingo — cachorrinho inventor

Ajuda o jogador a reparar as mesas de crafting e ensina novas receitas. Parte de sua história envolve recuperar ferramentas e voltar a criar.

### Lilo — coelho guardião

Cuida da praça e conhece parte da história do Desbotamento. No início, não acredita que a vila possa ser restaurada. Sua mudança de atitude acompanha o avanço do jogador.

---

## 12. Progressão narrativa do MVP

O primeiro arco deverá entregar uma história curta e completa: **restaurar o ateliê e devolver o primeiro Pequeno Encanto à praça da vila**.

| Missão | Desenvolvimento da história | Mecânica apresentada |
| --- | --- | --- |
| 1. Um recomeço empoeirado | O jogador limpa o ateliê e encontra uma fotografia antiga. | Interação, limpeza e organização |
| 2. A mesa quebrada | O jogador coleta madeira e conserta a primeira bancada. | Coleta e crafting |
| 3. Um pouco de conforto | O jogador produz uma cama, uma luminária e uma cadeira. | Decoração do espaço pessoal |
| 4. A primeira visitante | Amora aparece procurando abrigo e conhece o novo artesão. | Diálogo e introdução aos NPCs |
| 5. A loja sem brilho | Amora pede ajuda para reabrir parte de sua confeitaria. | Encomenda de decoração |
| 6. Cores esquecidas | O jogador procura flores mágicas na floresta. | Exploração, coleta e novos materiais |
| 7. O pedido especial | A loja deve ser decorada seguindo requisitos específicos. | Desafio de decoração |
| 8. O primeiro encanto | A restauração revela um fragmento levado até a fonte. | Conclusão narrativa e transformação da vila |

---

## 13. Primeira missão detalhada

### Um recomeço empoeirado

Ao entrar no ateliê, o jogador encontra caixas, teias, móveis quebrados e janelas fechadas. O Caderno dos Encantos desperta e apresenta a mensagem:

> **Todo grande recomeço precisa de um pequeno primeiro passo.**

### Objetivos

- Retirar cinco caixas.
- Limpar três teias.
- Abrir a janela.
- Encontrar a fotografia antiga do ateliê.

Ao abrir a janela, a luz entra e o ambiente recupera discretamente parte de suas cores. O jogador encontra uma fotografia mostrando o ateliê e a praça durante seus melhores dias.

No verso está escrito:

> **Enquanto alguém continuar criando, a vila nunca perderá completamente sua magia.**

Uma bancada quebrada começa a emitir uma luz suave, iniciando a segunda missão.

---

## 14. Tipos de desafios

Os desafios deverão ser simples de compreender, mas variar a forma como o jogador utiliza crafting e decoração.

- Decorar usando uma quantidade limitada de itens.
- Utilizar somente determinadas cores.
- Alcançar atributos como aconchegante, iluminado ou natural.
- Manter áreas de circulação livres.
- Encontrar materiais disponíveis apenas em uma região.
- Descobrir combinações de materiais.
- Identificar objetos relacionados à memória de um morador.
- Restaurar um local antes de um pequeno evento da vila.

Para o MVP, devem ser priorizados desafios baseados em requisitos claros, sem sistemas complexos de física, combate ou tempo real.

---

## 15. Final do MVP

Depois de restaurar a loja de Amora, o jogador encontra o primeiro fragmento de um Pequeno Encanto e o leva até a fonte da praça.

Ao posicionar o fragmento:

- A água volta a correr.
- Parte da praça recupera suas cores.
- Flores começam a crescer.
- A música se transforma.
- Alguns moradores saem de suas casas.
- Uma nova região aparece ao fundo, ainda coberta pelo Desbotamento.

Lilo observa a transformação e diz:

> **Então era verdade... a vila não estava perdida. Ela só estava esperando alguém recomeçar.**

O jogador desbloqueia a decoração livre do ateliê e recebe uma carta misteriosa:

> **Se você conseguiu despertar um encanto, talvez ainda exista esperança para o Bosque dos Sussurros.**

Esse momento encerra o primeiro arco e cria o gancho para uma futura expansão.

---

## 16. Direção de arte

### Estilo

- Pixel art com formas arredondadas e acolhedoras.
- Ambientes baseados em tiles de 32 px.
- Personagens com células lógicas de 32 × 48 px.
- Contornos escuros e legíveis.
- Paleta limitada e harmoniosa.
- Texturas construídas com agrupamentos intencionais de pixels.
- Sem antialiasing nos assets finais.

### Paleta inicial

- Creme e madeira quente.
- Lilás empoeirado.
- Azul-petróleo suave.
- Mostarda.
- Coral.
- Verde-sálvia.

Durante o Desbotamento, as cores aparecem menos saturadas. Conforme um espaço é restaurado, a paleta recupera brilho, contraste e pequenos efeitos mágicos.

### Câmera e composição

- Visão elevada adequada para celular.
- Personagens e objetos devem permanecer legíveis em telas pequenas.
- Fachadas importantes podem ficar voltadas para o jogador, com o telhado visível.
- O caminho e a entrada dos edifícios devem ser visualmente claros.
- Elementos interativos devem possuir silhueta e contraste reconhecíveis.

---

## 17. Escopo recomendado do MVP

### Incluído

- Escolha entre três personagens.
- Cinemática curta de abertura.
- Um ateliê inicial restaurável.
- Quatro pequenos locais.
- Três NPCs principais.
- Seis materiais.
- Três mesas de crafting.
- Aproximadamente oito missões.
- Sistema básico de coleta, crafting e decoração.
- Uma grande transformação visual da praça.
- Encerramento narrativo com gancho para o próximo capítulo.

### Fora do MVP

- Multiplayer.
- Combate.
- Agricultura complexa.
- Relacionamentos românticos.
- Habilidades exclusivas por espécie.
- Sistema completo de estações e clima.
- Ciclo avançado de dia e noite.
- Grande mundo aberto.
- Dezenas de NPCs.
- Customização detalhada de roupas e aparência.
- Economia complexa ou loja online.
- Eventos sazonais extensos.

---

## 18. Princípios para monetização futura

O modelo de monetização ainda não foi definido. Independentemente da escolha, a experiência cozy não deve utilizar pressão excessiva, perda punitiva de progresso ou tempos de espera que interrompam constantemente o loop principal.

Possibilidades a avaliar futuramente:

- Jogo premium.
- Compra única para desbloquear capítulos.
- Itens cosméticos opcionais.
- Expansões narrativas.

---

## 19. Decisões em aberto

- Nome definitivo do protagonista e possibilidade de o jogador nomeá-lo.
- Nome definitivo e personalidade detalhada dos NPCs.
- Engine de desenvolvimento.
- Orientação principal da tela no celular.
- Estrutura do inventário.
- Regras de posicionamento e rotação de móveis.
- Forma de aquisição e reaparecimento dos recursos.
- Sistema de atributos decorativos.
- Duração total desejada para o MVP.
- Modelo de monetização.
- Quantidade de customização do personagem.

---

## 20. Próximos passos recomendados

1. Definir a experiência completa dos primeiros 10 minutos.
2. Criar um mapa simples do ateliê, praça, floresta e loja de Amora.
3. Detalhar as receitas e quantidades de materiais das três primeiras missões.
4. Projetar o modo de decoração para celular.
5. Criar o interior inicial do ateliê.
6. Criar a versão restaurada do exterior do ateliê.
7. Definir os sprites e retratos dos três NPCs.
8. Construir um protótipo jogável do loop coletar → criar → decorar → concluir missão.

---

## 21. Essência narrativa

O jogador chega à vila tentando reconstruir a própria vida. Ao restaurar o primeiro ambiente, percebe que sua criatividade também pode reconstruir a vida de todos ao redor.
