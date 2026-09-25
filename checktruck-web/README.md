# CheckTruck — Web (Gerente · Mecânico · Motorista)

Aplicação web do CheckTruck construída em **React + Vite + Tailwind CSS v4**,
replicando o protótipo visual fornecido (`CheckTruck_Web_Gerente.html`) e
estendendo o mesmo padrão de design para os perfis de **Mecânico** e
**Motorista**, conforme descrito no TCC.

## Como rodar localmente

```bash
npm install
npm run dev       # ambiente de desenvolvimento (http://localhost:5173)
npm run build     # build de produção em /dist
npm run preview   # serve o build de produção
```

## Contas de demonstração

Todos os dados são mockados em memória (`src/data/mockData.js`) e a sessão
fica salva no `localStorage` do navegador — não há backend real ainda.

| Perfil     | E-mail                              | Senha    |
|------------|--------------------------------------|----------|
| Gerente    | admin@admin.com                      | admin123 |
| Mecânico   | wesley.martins@checktruck.com.br     | 123456   |
| Motorista  | joao.pereira@transp.com.br           | 123456   |

## Estrutura

```
src/
  data/                # mock data + regras de negócio (RN-01 a RN-08)
  context/             # AppContext — autenticação e CRUD em memória
  components/          # Sidebar, Layout, UI (badges, forms, modal/drawer)
  components/modals/   # Novo veículo, Nova pessoa, Atualizar km,
                        # Registrar manutenção, Novo chamado
  pages/gerente/       # Dashboard, Veículos, Pessoas, Catálogo, Intervalos, Chamados
  pages/mecanico/      # Dashboard, Veículos, Chamados
  pages/motorista/     # Meu veículo, Meus chamados, Meu perfil
```

## Perfis e permissões

- **Gerente**: acesso total — cadastra veículos, motoristas e técnicos,
  configura catálogo/intervalos e acompanha todos os chamados.
- **Mecânico**: vê a frota, registra manutenções, atualiza km e abre/atende chamados.
- **Motorista**: vê apenas o veículo atribuído a ele, atualiza a quilometragem
  e abre chamados para a equipe de manutenção.

## Próximos passos sugeridos

- Substituir o `AppContext` mock por chamadas reais à API .NET 8 descrita no TCC
  (mesmos endpoints já usados como legenda nos modais, ex. `POST /api/vehicles`).
- Persistir autenticação com Bearer Token real (JWT) em vez de localStorage simples.
- Ao aprovar esta versão web, portar as telas para React Native (Expo) reaproveitando
  `data/domain.js` (regras de negócio) e o modelo de dados.
