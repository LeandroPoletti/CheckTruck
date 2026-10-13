# Telas e navegação

O site e o app mostram só o que as permissões de quem entrou liberam. Quem decide de verdade é a API: esconder
uma tela é só para não confundir.

## Site

```mermaid
flowchart LR
    login["Entrar"] <--> criar["Criar conta"]
    login --> menu{{"Menu lateral<br/>(só o que a pessoa pode)"}}

    menu --> dash["Dashboard"]
    menu --> veic["Veículos"]
    veic --> det["Detalhe do caminhão<br/>situação · OS · histórico de km"]
    det --> acoes["Atualizar km · Corrigir km<br/>Editar · Lançar OS"]
    menu --> cat["Catálogo"]
    menu --> os["Ordens de serviço"]
    menu --> cham["Chamados"]
    menu --> int["Intervalos"]
    menu --> cad["Países · Fabricantes · Modelos<br/>Gerações · Tipos de manutenção · Mecânicos"]
    menu --> acesso["Acesso"]
    menu --> emp["Minha empresa"]
```

| Grupo do menu | Tela | Precisa de |
|---|---|---|
| — | Dashboard | Ver frota |
| Frota | Veículos (e o detalhe de cada um) | Ver frota |
| Frota | Catálogo | Cadastros |
| Manutenção | Ordens de serviço | Ver frota |
| Manutenção | Chamados | Abrir ou Atender chamados (só na Frota) |
| Manutenção | Intervalos | Intervalos |
| Cadastros | Países, Fabricantes, Modelos, Gerações, Tipos de manutenção | Cadastros |
| Cadastros | Mecânicos (no Autônomo, "Oficinas e mecânicos") | Cadastros (não aparece para o dono do sistema) |
| — | Acesso | Admin ou Gestor (só na Frota) |
| — | Minha empresa | Admin ou Gestor (e o Autônomo) |

Os botões dentro das telas também seguem as permissões: Atualizar km (Atualizar km), Corrigir km (Admin e
Gestor), Editar (Veículos), Lançar OS (Ordem de serviço).

## App

A tela inicial muda conforme quem entrou. As janelas de formulário sobem por cima da tela (modal) e voltam para
onde a pessoa estava.

```mermaid
flowchart TB
    login["Entrar"] <--> criar["Criar conta"]
    login --> inicio{"Quem entrou?"}

    inicio -->|Motorista| mot["Painel do motorista<br/>o caminhão que está com ele"]
    inicio -->|"Frota com Ver frota<br/>ou Atender chamados"| frota["Painel da frota<br/>abas Caminhões · Chamados · OS"]
    inicio -->|Autônomo| aut["Painel da frota<br/>(com 1 caminhão, a situação direto)"]
    inicio -->|"Frota sem essas permissões"| site["Aviso: use o site"]

    mot --> km["Atualizar km"]
    mot --> abrir["Abrir chamado"]
    mot --> avisos["Avisos de troca"]

    frota --> det["Caminhão<br/>situação · OS · histórico de km"]
    aut --> det
    det --> km
    det --> corrigir["Corrigir km"]
    det --> lancar["Lançar OS"]
    det --> cadCam["Editar caminhão"]
    det --> ints["Intervalos do caminhão"]
    frota --> abrir
    frota --> resolver["Resolver chamado"]
    frota --> novo["Cadastrar caminhão"]

    frota --> atalhos["Atalhos no fim da tela"]
    aut --> atalhos
    atalhos --> avisos
    atalhos --> mec["Mecânicos"]
    atalhos --> tipos["Tipos de manutenção"]
    atalhos --> catalogo["Catálogo → modelos → gerações"]
    atalhos --> emp["Minha empresa"]
```

| Tela (arquivo em `src/app`) | O que faz | Quem vê |
|---|---|---|
| `login`, `criar-conta` | Entrar e criar conta (Frota ou Autônomo) | Todos |
| `(app)/index` | Tela inicial de cada perfil (`src/telas`) | Logado |
| `(app)/caminhao/[id]` | Situação, próximas trocas, OS e histórico de km do caminhão | Ver frota |
| `(app)/atualizar-km` | Atualizar km (o motorista, no caminhão dele) | Atualizar km ou motorista |
| `(app)/corrigir-km` | Baixar um km digitado errado, com motivo | Admin e Gestor |
| `(app)/lancar-os` | Lançar OS (cadastrando o mecânico ali mesmo) | Ordem de serviço |
| `(app)/cadastro-caminhao` | Cadastrar e editar caminhão | Veículos |
| `(app)/abrir-chamado`, `(app)/resolver-chamado` | Abrir, atender e resolver chamados | Abrir / Atender chamados |
| `(app)/intervalos`, `(app)/intervalo` | Intervalos por caminhão e por geração | Intervalos |
| `(app)/mecanicos`, `(app)/mecanico` | Mecânicos (no Autônomo, oficinas e mecânicos) | Cadastros |
| `(app)/tipos-manutencao`, `(app)/tipo-manutencao` | Tipos de manutenção | Cadastros |
| `(app)/catalogo`, `modelos`, `geracoes`, `fabricante`, `modelo`, `geracao` | Catálogo, um nível por vez | Cadastros |
| `(app)/avisos` | Avisos de troca: se estão ligados, os próximos e um aviso de teste | Motorista e Ver frota |
| `(app)/minha-empresa` | Dados da conta e virar Frota | Admin e Gestor (e o Autônomo) |

Ficam só no site: o **dashboard**, os **acessos** (cadastrar pessoas e permissões) e as telas do **dono do
sistema**.

## Visual

- Mesma paleta verde no site e no app; títulos em Barlow Semi Condensed (fonte de placa de estrada) e texto em Inter.
- Status em cores: verde (ok), amarelo (atenção) e vermelho (crítico). No app, a placa aparece no padrão Mercosul.
- Pensado para quem tem pouca prática com celular: botões com cara de botão, textos curtos e simples, e cada
  ação no lugar onde a pessoa procura.
