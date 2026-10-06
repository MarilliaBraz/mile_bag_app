# mile_bag_app

Front-end do **Milebag**, sistema de gestão da última milha de bagagens: aplicação SaaS multi-tenant para digitalizar a devolução de bagagens extraviadas no transporte aéreo brasileiro.

Este repositório reúne duas aplicações:

- **Back-office:** interface administrativa para o tenant (empresa de entrega) e para o provedor: cadastro de empresas, motoristas, tarifas, praças de pedágio e relatórios de fechamento.
- **Aplicação do motorista:** Progressive Web App (PWA) para uso em campo, com captura do BDO por foto, autoatribuição de entrega, escolha de rota e registro do comprovante de entrega (foto, recebedor, data, hora e geolocalização), com operação offline e sincronização automática.

## Stack

- **Framework:** React com TypeScript
- **Build:** Vite
- **PWA (motorista):** Service worker via Workbox, armazenamento local em IndexedDB (Dexie.js)
- **Mapas:** Leaflet sobre camadas do OpenStreetMap

## Organização

Estrutura por **feature** (`features/<dominio>`), com pasta `shared/` para componentes, hooks e utils usados por duas ou mais features. Veja o `CONVENTIONS.md` no repositório [`mile_bag_audite`](https://github.com/MarilliaBraz/mile_bag_audite) para o detalhamento das convenções técnicas e de código.

## Repositórios relacionados

- [`mile_bag_documentacao`](https://github.com/MarilliaBraz/mile_bag_documentacao): documentação do projeto (TAP, escopo, sessões)
- [`mile_bag_api`](https://github.com/MarilliaBraz/mile_bag_api): back-end (Java/Spring Boot)
- [`mile_bag_infra`](https://github.com/MarilliaBraz/mile_bag_infra): infraestrutura e implantação
- [`mile_bag_audite`](https://github.com/MarilliaBraz/mile_bag_audite): constituição e convenções técnicas do projeto
