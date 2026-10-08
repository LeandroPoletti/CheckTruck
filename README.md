# CheckTruck

Sistema web para controlar a manutenção de uma frota de caminhões: avisa o que está perto de vencer
(por km e por prazo), guarda o histórico de ordens de serviço de cada caminhão e recebe os chamados
dos motoristas.

## Tecnologias

| Parte | Tecnologia |
|-------|------------|
| API | .NET 10 · ASP.NET Core · Entity Framework Core · ASP.NET Identity (token Bearer) · OData |
| Banco | PostgreSQL |
| Front | React 19 · Vite · Tailwind CSS 4 · React Router · axios |

## Estrutura

```
CheckTruck.Api/         controllers, DTOs e filtros de acesso (quem pode o quê)
CheckTruck.Dominio/     entidades, enums e as regras do negócio (serviços)
CheckTruck.Repositorio/ Entity Framework: contexto, configuração das tabelas e migrations
Checktruck.Web/         front (React)
  src/paginas.jsx       todas as telas: rota, item do menu e permissão
  src/pages/            uma tela por arquivo
  src/components/       menu, modais e componentes de tela
  src/services/         chamadas da API e conversão dos dados
compose.yaml            PostgreSQL (e Adminer) em Docker
```

## Como rodar

Precisa de: .NET 10 SDK, Node.js e PostgreSQL (ou Docker).

**1. Banco**

Com Docker, na raiz do projeto:

```bash
docker compose up -d db
```

A API já vem configurada para esse banco (usuário e senha `postgres`, em `appsettings.Development.json`).
Se o seu PostgreSQL tiver outra senha, informe a conexão só no terminal, sem salvar em arquivo:

```powershell
$env:ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=CheckTruck;Username=postgres;Password=SUA_SENHA"
```

**2. API** (na raiz do projeto)

```bash
dotnet ef database update --project CheckTruck.Repositorio --startup-project CheckTruck.Api
dotnet run --project CheckTruck.Api --launch-profile https
```

A API sobe em `https://localhost:7013`, e a documentação dos endpoints fica em `https://localhost:7013/docs`.
Na primeira vez, confie no certificado de desenvolvimento: `dotnet dev-certs https --trust`.

**3. Front** (na pasta `Checktruck.Web`)

```bash
npm install
npm run dev
```

O front abre em `http://localhost:5173` e chama a API do endereço em `Checktruck.Web/.env.development`.

**Primeiro acesso:** a API cria o admin do sistema, `admin@admin.com` com a senha `Admin@123`.
Troque a senha fora do ambiente de desenvolvimento.

## Acessos

Cada pessoa tem um **cargo** e as **permissões** que o Admin ou o Gestor marcarem. O menu mostra só o que ela pode usar.

- **Cargos:** Admin, Gestor, Almoxarife, Mecânico, Chefe de Manutenção, Técnico de Logística, Auxiliar de Logística e Motorista.
- **Admin e Gestor** têm todas as permissões e são os únicos que cadastram, editam e desativam acessos.
- Acesso **desativado** não entra no sistema.

| Permissão | Libera |
|-----------|--------|
| Ver frota | Dashboard, veículos, histórico e ordens de serviço (só ver) |
| Veículos | Cadastrar, editar e desativar caminhões |
| Atualizar km | Somar km no caminhão |
| Ordem de serviço | Lançar, corrigir e excluir ordens de serviço |
| Cadastros | Países, fabricantes, gerações, modelos, tipos de manutenção, mecânicos e catálogo |
| Intervalos | Intervalos de troca por modelo e por caminhão |
| Abrir chamados | Abrir chamados e editar ou excluir os próprios enquanto estão pendentes |
| Atender chamados | Ver todos os chamados, atender e resolver |

Marcar Veículos, Atualizar km ou Ordem de serviço já liga o Ver frota.

## Regras principais

- **Intervalo de troca:** vale o primeiro que existir: o do caminhão (ex.: plano da concessionária), o do
  modelo ou o padrão do sistema. Vence o que chegar primeiro: o km ou o prazo em meses.
- **Ordem de serviço:** o número é gerado em sequência. Se a OS não trouxer a próxima troca, o sistema
  calcula pelo intervalo (km da troca + intervalo). O km da OS atualiza o km do caminhão quando é maior.
  O motorista informado vira o motorista atual do caminhão, e quem lançou fica gravado com data e hora.
- **Chamado:** quem abre conta o problema (tipo, urgência e descrição). Se for Motorista, ele vira o
  motorista atual do caminhão. Quem atende resolve contando o que foi feito, e o chamado vai para Concluídos.
- **Alertas:** o item fica em atenção quando faltam 5.000 km ou 30 dias, e crítico quando vence.
