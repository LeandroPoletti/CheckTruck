# CheckTruck — Web (Gerente · Mecânico · Motorista)

Aplicação web do CheckTruck construída em **React + Vite + Tailwind CSS v4**,
replicando o protótipo visual fornecido (`CheckTruck_Web_Gerente.html`) e
estendendo o mesmo padrão de design para os perfis de **Mecânico** e
**Motorista**, conforme descrito no TCC.

Os dados vêm da API `CheckTruck.Api` (.NET + OData + ASP.NET Identity).

## Como rodar localmente

1. Suba o banco e a API (na raiz do repositório):

   ```bash
   docker compose up -d db
   dotnet ef database update --project CheckTruck.Repositorio --startup-project CheckTruck.Api
   dotnet run --project CheckTruck.Api --launch-profile http   # http://localhost:5202
   ```

2. Rode o front:

   ```bash
   npm install
   npm run dev       # http://localhost:5173
   npm run build     # build de produção em /dist
   npm run preview   # serve o build de produção
   ```

A API não tem CORS configurado, então em desenvolvimento as chamadas passam pelo
proxy do Vite: `/backend/*` → `http://localhost:5202/*` (ver `vite.config.js`).

| Variável               | Uso                                                    | Padrão                  |
|------------------------|--------------------------------------------------------|-------------------------|
| `VITE_API_PROXY`       | Destino do proxy do Vite em dev                        | `http://localhost:5202` |
| `VITE_API_BASE_URL`    | Base das requisições (ex.: URL da API em produção)     | `/backend`              |

## Acesso

O seed da API cria o usuário **`Admin` / `Admin@123`**. O `POST /login` do Identity
autentica pelo *UserName*, por isso o admin entra com `Admin` e não com o e-mail.
O token Bearer fica salvo no `localStorage`.

## Estrutura

```
src/
  services/            # clientes da API (um por controller) + mappers API ↔ telas
  data/domain.js       # regras de negócio (RN-01 a RN-08) sobre os dados da API
  context/             # AppContext — sessão, carga dos dados e mutações via services
  components/          # Sidebar, Layout, UI (badges, forms, modal/drawer)
  components/modals/   # Novo veículo, Nova pessoa, Atualizar km,
                        # Registrar manutenção, Novo chamado
  pages/gerente/       # Dashboard, Veículos, Pessoas, Catálogo, Intervalos, Chamados
  pages/mecanico/      # Dashboard, Veículos, Chamados
  pages/motorista/     # Meu veículo, Meus chamados, Meu perfil
```

## Endpoints ainda não implementados na API

Os services abaixo têm `// TODO` com o contrato esperado. Até existirem, leituras
retornam vazio e escritas retornam o erro "Endpoint não implementado".

| Service                           | Endpoint                          | Impacto no front                                               |
|-----------------------------------|-----------------------------------|----------------------------------------------------------------|
| `usuarioService.obterMe`          | `GET /api/Usuario/me`             | Perfil do usuário logado — hoje todo login entra como gerente   |
| `usuarioService.listar`           | `GET /api/Usuario`                | Nome, e-mail e status das pessoas (a tela mostra o CPF)        |
| `usuarioService.criarPessoa`      | `POST /api/Usuario`               | Cadastro de motorista/técnico com conta de acesso              |
| `usuarioService.atualizar`        | `PUT /api/Usuario/{id}`           | Alterar nome / inativar pessoa                                 |
| `chamadoService.*`                | `GET/POST/PUT /api/Chamado`       | Tela de chamados (entidade não existe na API)                  |

## Perfis e permissões

- **Gerente**: acesso total — cadastra veículos, motoristas e técnicos,
  configura catálogo/intervalos e acompanha todos os chamados.
- **Mecânico**: vê a frota, registra manutenções, atualiza km e abre/atende chamados.
- **Motorista**: vê apenas o veículo atribuído a ele, atualiza a quilometragem
  e abre chamados para a equipe de manutenção.
