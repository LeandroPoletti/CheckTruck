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
| Cadastros | Países, fabricantes, modelos, gerações (com as potências), tipos de manutenção, mecânicos e catálogo |
| Intervalos | Intervalos de troca por geração e por caminhão |
| Abrir chamados | Abrir chamados e editar ou excluir os próprios enquanto estão pendentes |
| Atender chamados | Ver todos os chamados, atender e resolver |

Marcar Veículos, Atualizar km ou Ordem de serviço já liga o Ver frota.

## Regras principais

- **Intervalo de troca:** vale o primeiro que existir: o do caminhão (ex.: plano da concessionária), o da
  geração ou o padrão do sistema. Vence o que chegar primeiro: o km ou o prazo em meses. O padrão do óleo
  do motor depende da norma da geração (Euro 6: 40.000 km; antes disso: 30.000 km).
- **Ordem de serviço:** o número é gerado em sequência. Se a OS não trouxer a próxima troca, o sistema
  calcula pelo intervalo (km da troca + intervalo). O km da OS atualiza o km do caminhão quando é maior.
  O motorista informado vira o motorista atual do caminhão, e quem lançou fica gravado com data e hora.
- **Chamado:** quem abre conta o problema (tipo, urgência e descrição). Se for Motorista, ele vira o
  motorista atual do caminhão. Quem atende resolve contando o que foi feito, e o chamado vai para Concluídos.
- **Alertas:** o item fica em atenção quando faltam 5.000 km ou 30 dias, e crítico quando vence.
- **Valores aceitos:** nenhum número digitado pode ser negativo (km, intervalos, potência). Os anos vão de 1900
  (o primeiro caminhão é de 1896) até o ano que vem, e o ano modelo é o de fabricação ou o seguinte. A OS não
  pode ter data no futuro, e atualizar o km só aceita um valor maior que o atual. A API valida tudo isso e a
  tela avisa antes de enviar.
- **Km do caminhão:** só sobe (cadastro, Atualizar km, OS e Editar veículo). Se alguém digitar errado (ex.: um
  zero a mais), Admin ou Gestor usam **Corrigir km** na tela do caminhão: pode baixar, mas não para menos que o
  km da maior OS, e o motivo é obrigatório. Toda mudança de km fica no **histórico de km** (quem, quando, de
  quanto pra quanto e por quê).

## Catálogo

O caminhão é cadastrado em cascata: **fabricante → modelo → geração → potência**, e a tração (4x2, 6x2, 6x4,
8x2 ou 8x4) fica no próprio caminhão.

| Nível | O que é | Exemplo |
|-------|---------|---------|
| Fabricante | Marca, com o país de origem | Volvo (Suécia) |
| Modelo | Linha do fabricante | FH, FM, FMX, VM |
| Geração | Época do modelo no Brasil: anos (ano-modelo), norma de emissão, motor e câmbio | Novo FH (FH 4): 2015–2021, Euro 5, D13C |
| Potência | Potências (cv) em que a geração foi vendida | 420, 460, 500, 540 |

Os intervalos recomendados ficam na geração. Potência com caminhão cadastrado não pode sair da geração, e
geração com caminhão ou intervalo não pode ser excluída.

### Catálogo inicial

Num banco sem nenhum modelo, a API já cadastra os pesados mais comuns no Brasil (46 gerações e as potências
de cada uma): **Volvo** FH, FM, FMX e VM · **Scania** R, G, P e S · **Mercedes-Benz** Actros · **Iveco** Stralis
e S-Way · **DAF** XF. Os dados ficam em `CheckTruck.Repositorio/Seed/CatalogoInicial.cs`.

Os anos são o **ano-modelo da Tabela FIPE**. Valores duvidosos ficaram de fora (ex.: FH Euro 6 com 380 cv, que
a Volvo cita para o motor D13K mas a FIPE não lista). "FH Clássico", "FH 4" e "FH 5" são apelidos do mercado,
não nomes oficiais da Volvo.

<details>
<summary>Fontes</summary>

**Volvo:** [V1](https://www.volvogroup.com/br/news-and-media/news/2014/mar/news-146584.html) ·
[V2](https://www.volvogroup.com/br/news-and-media/news/2014/mar/news-146582.html) ·
[V3](https://www.volvogroup.com/br/news-and-media/news/2014/mar/news-146578.html) ·
[V4](https://www.volvogroup.com/br/news-and-media/news/2011/oct/news-121124.html) ·
[V5](https://www.volvogroup.com/br/news-and-media/news/2014/mar/news-146575.html) ·
[V6](https://www.volvogroup.com/br/news-and-media/news/2014/oct/news-148539.html) ·
[V7](https://omecanico.com.br/volvo-atualiza-sua-linha-de-caminhoes-no-brasil/) ·
[V8](https://www.volvogroup.com/br/news-and-media/news/2024/nov/volvo-fh-completa-30-anos-de-brasil-como-o-caminhao-mais-vendido.html) ·
[V9](https://www.volvogroup.com/br/news-and-media/news/2021/jun/novo-volvo-fh-traz-inovacoes-para-toda-a-linha-de-pesados-da-marca.html) ·
[V10](https://www.autodata.com.br/?p=33813) ·
[V11](https://www.volvogroup.com/br/news-and-media/news/2022/oct/novo-volvo-fh-euro-6-concilia-reducao-de-emissoes-e-alto-desempenho-com-mais-economia.html) ·
[V12](https://www.volvogroup.com/br/news-and-media/news/2023/feb/Volvo-celebra-inicio-da-producao-de-caminhoes-e-onibus-euro-6-no-brasil.html) ·
[V13](https://www.volvogroup.com/br/news-and-media/news/2022/nov/volvo-exibe-os-novos-fh-fm-e-fmx-euro-6-na-fenatran.html) ·
[V14](https://www.volvogroup.com/br/news-and-media/news/2008/nov/news-51794.html) ·
[V15](https://www.volvogroup.com/br/news-and-media/news/2010/nov/news-92445.html) ·
[V16](https://www.volvogroup.com/br/news-and-media/news/2013/oct/news-145108.html) ·
[V17](https://www.autodata.com.br/noticias/2022/10/04/com-a-linha-euro-6-precos-de-caminhoes-volvo-deverao-subir-20/46714/) ·
[V18](https://www.volvogroup.com/br/news-and-media/news/2009/jun/news-64379.html) ·
[V19](https://www.volvogroup.com/br/news-and-media/news/2026/mar/melhorias-aerodinamicas-aprimoram-ainda-mais-a-eficiencia-do-vol.html)

**Scania:** [S1](https://carzin.com.br/caminhoes/60-anos-scania-brasil.html) ·
[S2](https://en.wikipedia.org/wiki/Scania_PRT-range) ·
[S3](https://mecanicaonline.com.br/2007/11/renovacao-completa-na-linha-de-caminhoes-series-p-g-e-r-com-novas-cabines-e-motores) ·
[S4](https://mecanicaonline.com.br/?p=173832) ·
[S5](https://carzin.com.br/caminhoes/lancamento-da-linha-scania-streamline.html) ·
[S6](https://www.autodata.com.br/?p=25263) ·
[S7](https://setcesp.org.br/noticias/scania-entrega-primeiros-modelos-de-caminhoes-com-novas-motorizacoes/) ·
[S8](https://omecanico.com.br/nova-geracao-de-caminhoes-scania-chega-ao-brasil-em-fevereiro-de-2019/) ·
[S9](https://www.scania.com/content/dam/www/market/br/pdfs1/especificacoes/caminhoes/00033-2019_Folheto_Powertrain_Scania_Low.pdf) ·
[S10](https://www.autodata.com.br/noticias/2022/10/06/euro-6-da-scania-promete-reduzir-ate-8-o-consumo-de-combustivel/46911/) ·
[S11](https://autopapo.com.br/noticia/scania-r-450-r-540-plus/) ·
[S12](https://autopapo.com.br/noticia/scania-brasil-770-v8-caminhao-mais-potente-mundo) ·
[S13](https://garagem360.com.br/scania-lanca-aluguel-de-caminhoes-motores-euro-6-fenatran)

**Mercedes-Benz:** [M1](https://omecanico.com.br/actros-comeca-a-ser-vendido-no-brasil-com-muita-tecnologia/) ·
[M2](https://mecanicaonline.com.br/2015/10/desenvolvida-e-produzida-no-brasil-nova-linha-actros-esta-mais-preparada-para-as-estradas-brasileiras/) ·
[M3](https://carroscomcamanzi.com.br/wp-content/uploads/2019/03/Ficha-Técnica-Actros-2651.pdf) ·
[M4](https://www.autodata.com.br/?p=29678) ·
[M5](https://www.autodata.com.br/?p=29835) ·
[M6](https://mecanicaonline.com.br/2022/10/testados-no-brasil-linha-2023-dos-caminhoes-mercedes-benz-reduz-emissoes-consumo-de-combustivel-e-custos-operacionais/) ·
[M7](http://setcesp.org.br/noticias/linha-actros-mercedes-benz-euro-6-o-caminhao-mais-conectado-do-brasil-entrega-mais-performance-e-economia/) ·
[M8](https://www.tribunapr.com.br/noticias/automoveis/mercedes-benz-inicia-as-vendas-do-actros-2553-6x2/)

**Iveco:** [I1](https://mecanicaonline.com.br/2006/07/iveco-lanca-quatro-novos-modelos-do-stralis/) ·
[I2](https://mecanicaonline.com.br/2010/03/stralis-nr-chega-com-novo-sistema-de-transmissao/) ·
[I3](https://mecanicaonline.com.br/?p=173826) ·
[I4](https://atarde.com.br/autos/novo-stralis-tem-10-opcoes-de-motor-460028) ·
[I5](https://omecanico.com.br/?p=11319) ·
[I6](https://dol.com.br/colunistas/auto-destaque/783109/iveco-entra-numa-nova-era-com-o-s-way) ·
[I7](https://abcdoabc.com.br/aposta-maior-iveco-espera-projecao-maior-com-s-way/) ·
[I8](https://www.autodata.com.br/noticias/2025/09/19/veiculos-comerciais-de-carga/93539/)

**DAF:** [D1](https://carzin.com.br/caminhoes/daf-xf105.html) ·
[D2](https://www.americanmachinist.com/news/article/21898171/paccar-starts-brazilian-truck-plant) ·
[D3](https://mecanicaonline.com.br/2015/07/daf-brasil-lanca-motor-510-cv-para-o-xf105/) ·
[D4](https://mecanicaonline.com.br/2016/10/daf-caminhoes-comemora-tres-anos-de-producao-no-brasil/) ·
[D5](https://omecanico.com.br/novo-daf-xf-tem-motor-e-cambio-ineditos/) ·
[D6](https://www.autodata.com.br/?p=48164)

**Tabela FIPE (anos e potências):** [Volvo](https://www.tabelafipebrasil.com/caminhoes/VOLVO) ·
[Scania](https://www.tabelafipebrasil.com/caminhoes/SCANIA) · páginas de cada modelo em
`https://valorfinal.com.br/tabela-fipe/caminhoes/{marca}/{modelo}` (ex.: `volvo/fh-540`, `scania/r-450`,
`mercedes-benz/actros-2651`, `iveco/s-way-480`, `daf/xf`).

</details>
