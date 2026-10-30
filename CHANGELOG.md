# Changelog

Todas as mudanças relevantes do mile_bag_app ficam registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa
[Versionamento Semântico](https://semver.org/lang/pt-BR/), como pede o item 2.3 do `CONVENTIONS.md`
(repositório `mile_bag_audite`). Enquanto a versão for 0.x, mudanças de comportamento podem acontecer
entre versões menores.

## [Não lançado]

Em validação no ambiente de homologação (`mile_bag_infra/scripts/implantar.sh homologacao`).

### Adicionado

- Encaminhamento da bagagem encontrada para entrega (HU37): na ficha de uma bagagem registrada, a companhia escolhe
  uma empresa de entrega parceira e informa o processo e o passageiro; a empresa recebe o BDO pronto e os motoristas
  são avisados. A ficha e a consulta mostram a etapa da entrega (aguardando motorista, motorista designado, a caminho,
  entregue, não entregue), e o encaminhamento pode ser cancelado até um motorista assumir. A plataforma define as
  empresas parceiras de cada companhia em "Companhias aéreas". O motorista vê o selo "Companhia aérea" nesses BDOs.
- Consulta de bagagens encontradas (HU36): o administrador e os funcionários da companhia filtram os registros
  por aeroporto, período, tipo, tipo de volume, cor, situação e texto (etiqueta, código SID ou passageiro),
  exportam a busca em CSV e abrem a ficha de cada bagagem, com foto, dados, mapa e autoria, para baixar em PDF.
  A busca nacional procura um número de etiqueta em todas as companhias e mostra por qual companhia, onde e
  quando a bagagem foi registrada. O funcionário passa a ter a área da companhia, com o próprio menu.
- Registro de bagagem encontrada sem etiqueta (HU35): o funcionário fotografa a bagagem; o Milebag sugere a cor
  pela foto e o aeroporto pelo local; o funcionário descreve com toques (tipo, tamanho, cor, sinais particulares,
  marca e observações) e registra. O registro gera o código SID (ex.: `SID-GRU-2026-000123`), único no país, numa
  etiqueta com QR code para imprimir e colar na bagagem, que pode ser reaberta pelos registros recentes.
- Registro de bagagem encontrada pela foto da etiqueta (HU34): o funcionário da companhia fotografa a
  etiqueta; o Milebag lê o código de barras e o texto, usa o GPS da foto ou do celular e sugere o aeroporto
  mais próximo; o funcionário confere e registra, ou descarta. O início mostra os rascunhos por conferir e os
  registros recentes da companhia.
- Companhias aéreas (HU33): a plataforma cadastra as companhias (com código IATA) em "Companhias aéreas" e
  convida o primeiro administrador; o administrador da companhia cadastra os funcionários, um a um ou em lote,
  em "Funcionários"; o funcionário entra numa área própria, onde chegará o registro de bagagens encontradas.
- Aviso de bagagem nova (HU32): quando um BDO chega por e-mail, o app do motorista aberto toca um sinal
  sonoro, vibra e mostra "Nova bagagem para retirar no aeroporto" em qualquer tela (consulta a cada 30 s, ou
  na hora com notificações ativadas). Com o app fechado, notificação do sistema para quem ativou os avisos na
  Conta; tocar nela abre o painel. Sair da conta desativa os avisos do aparelho.
- "Acompanhe sua bagagem" (HU31): página pública `/acompanhar/:codigo`, aberta pelo link que o passageiro
  recebe ao iniciar a viagem, com a etapa da entrega, o mapa com a posição do motorista e o destino, atualizada
  a cada 15 s. Entregue ou não entregue, mostra só o resultado, sem a posição. Com viagem em andamento, o app
  do motorista envia a posição a cada 15 s de qualquer tela, só com o app aberto e com conexão.
- Interface em português, espanhol e inglês, trocada pelas bandeiras do Brasil, da Espanha e dos EUA no
  login e nas demais telas de entrada, na Conta do motorista e na barra do back-office. A escolha fica
  salva no aparelho. Os textos ficam em `src/shared/i18n/textos/`, com o português como referência:
  faltando uma frase em algum idioma, o build falha. Mensagens vindas da API, textos enviados ao
  passageiro e dados cadastrados continuam em português.
- Datas, horas, números e valores no formato do idioma escolhido (os valores continuam em reais).
- Faixa "Ambiente de Homologação" no topo de todas as telas, com a versão implantada, quando
  `VITE_AMBIENTE` está preenchida (produção fica sem faixa).
- Estado da conexão sempre visível na barra superior do motorista ("Conectado", "Sem conexão" ou
  "N a enviar"), levando aos registros do aparelho.
- Etapas da entrega no detalhe (Assumida, A caminho, No endereço, Entregue), mostrando em qual
  etapa a entrega está e quantas faltam.
- Login com painel da marca no computador.
- Transição curta entre telas (View Transitions), desligada com `prefers-reduced-motion`.

### Alterado

- A tela de motoristas passou a ser o cadastro de contas compartilhado (`shared/components/contas`), usado
  também pelos funcionários das companhias aéreas, sem mudança de comportamento.
- Design system v2: escalas de tipografia e espaço como tokens, paleta refinada, sombras e cantos
  mais suaves, botão "Capturar" em amarelo de sinalização (alto contraste ao sol).
- Estilos soltos nos componentes (`style={{...}}`) trocados por classes utilitárias baseadas nos tokens.
- Ícones deixam de ser "desenhados" a cada tela; a animação ficou só nos estados vazio e de sucesso.
- O brilho dos esqueletos de carregamento anima só `transform` (sem repintar a tela a cada quadro).
- Seção atual do menu do back-office marcada também por uma barra lateral, não só pela cor.
- Organização interna conforme o `CONVENTIONS.md` §1.2, sem mudança de comportamento:
  - toda feature separa `components/`, `hooks/`, `services/`, `types/` e `utils/` e expõe um `index.ts`;
    os tipos saíram dos arquivos de service e os `*Api.ts` passaram a se chamar `*Service.ts`;
  - nenhuma feature importa de outra: o que é usado por duas ou mais (layouts `TelaMotorista` e `Pagina`,
    fila offline, services de motoristas, planos, BDO, ocorrências e identidade visual) subiu para `shared/`,
    agora organizado por tipo; o que só uma outra feature usava foi para dentro dela (mensageria e bagagem
    carona em `painel-entregas`, `TrocarPlanoTenant` em `tenant-onboarding`);
  - telas de login e senha em `features/auth`, com as chamadas à API em `authService`;
  - rotas protegidas do `App.tsx` agrupadas sob um único `RequireAuth` por papel.

## [0.1.0] - 2026-10-05

Primeira versão registrada neste arquivo. As funcionalidades anteriores (HU01 a HU27) estão no
histórico do Git e nas especificações do `mile_bag_documentacao`.

### Adicionado

- Design system único em `src/index.css`: cores, espaçamentos, cantos, sombras e movimento curto,
  respeitando `prefers-reduced-motion`.
- Aplicação do motorista pensada para uso no carro: textos maiores, alvos de toque de 48px a 56px,
  barra superior fixa e navegação inferior (Entregas, Capturar, Relatório, Conta).
- Tela "Conta" do motorista (`/motorista/conta`), com registros do aparelho, preferências de leitura
  e Sair.
- Back-office com barra lateral, cabeçalho de página com a ação principal no topo, painéis laterais
  para criar e editar, tabelas com selos de situação e indicadores numéricos.
- Busca e filtro por situação na lista de motoristas.
- Avisos de configuração incompleta: empresa sem tarifa padrão e praças de pedágio sem localização.
- Tema escuro em todo o app, com escolha "Automático", "Claro" ou "Escuro" nas preferências de leitura.
- Mapa da rota escurecido no tema escuro, para não ofuscar o motorista à noite.
- Componentes compartilhados `Alerta`, `Carregando` e `Vazio` (`src/shared/ui/Alerta.tsx`).
- Configuração por ambiente: `.env.example` documenta as variáveis e `.env.development` aponta para a
  API local.

### Alterado

- Detalhe da entrega mostra primeiro o destino e as ações (Rota, Ligar, Registrar entrega).
- Ocorrência de não entrega: motivos em opções grandes de toque no lugar da lista suspensa.
- Relatório quinzenal em cartões, com o total do período.
- Encerrar a viagem passa a pedir confirmação.
- Excluir tarifa e remover plano usam o diálogo de confirmação padrão.
- Valores ausentes aparecem por extenso ("Sem valor", "Não calculado") no lugar de um traço.
- O endereço da API deixa de ter valor fixo no código: sem `VITE_API_BASE_URL` o app avisa e não abre.

### Corrigido

- Mapa da rota passa a enquadrar a posição do motorista e o destino.
- Botão de encerrar a viagem não mostra mais "Encerrando…" enquanto a rota é recalculada.

[0.1.0]: https://github.com/MarilliaBraz/mile_bag_app/releases/tag/v0.1.0
