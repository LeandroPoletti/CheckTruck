# Documentação do CheckTruck

Documentação técnica do sistema como ele é hoje: arquitetura, banco, classes, casos de uso, fluxos, requisitos,
telas e rotas da API. Para instalar e rodar, veja o [README principal](../README.md).

| Documento | O que tem |
|-----------|-----------|
| [Arquitetura](arquitetura.md) | Visão geral, containers (site, app, API, banco, push), camadas do backend, decisões, segurança e como roda |
| [Banco de dados](banco-de-dados.md) | Diagramas ER (gerados do modelo do EF), separação por empresa e restrições |
| [Domínio](dominio.md) | Diagramas de classes das entidades e dos serviços, e os enums |
| [Casos de uso](casos-de-uso.md) | Casos de uso por perfil, casos de uso × permissões e o antes e depois |
| [Fluxos](fluxos.md) | Diagramas de sequência: situação do caminhão, lançar OS, chamado com aviso, login e renovação, km e avisos de troca |
| [Requisitos](requisitos.md) | Requisitos funcionais e não funcionais e regras de negócio, com a situação de cada um |
| [Telas](telas.md) | Navegação do site e do app e quem vê cada tela |
| [API](api.md) | Todas as rotas, com a permissão de cada uma |

## Diagramas

Os diagramas são escritos em [Mermaid](https://mermaid.js.org), dentro dos próprios arquivos `.md`: o GitHub
desenha na hora, e eles mudam junto com o código (um commit atualiza o texto e o diagrama). Para usar num documento
ou num slide, copie o bloco para o [Mermaid Live](https://mermaid.live) e exporte em PNG ou SVG.

## Diferenças em relação ao documento do TCC (junho de 2026)

O sistema cresceu depois do documento. Para atualizá-lo:

| No documento | Hoje |
|---|---|
| App Android | Site + app (iPhone e Android), multiempresa (Frota e Autônomo) |
| .NET 8 | .NET 10 |
| Projetos API / Application / Domain / Infrastructure | Api / Dominio / Repositorio / Testes, mais Web e Mobile ([arquitetura](arquitetura.md#camadas-do-backend)) |
| 8 entidades; Fabricante → Geração → Modelo | 17 entidades; País → Fabricante → Modelo → Geração → Potência ([banco](banco-de-dados.md)) |
| Intervalo por modelo | Por geração (fábrica e empresa) e por caminhão, mais o padrão seguro (RN-09) |
| Perfis gerente, mecânico e motorista | Cargos e permissões por pessoa ([casos de uso](casos-de-uso.md#casos-de-uso--permissões)) |
| RegistroManutencao com nota fiscal | Ordem de serviço com itens e mecânicos, sem nota fiscal |
| km nunca diminui, com trigger no banco | Só sobe nos serviços; Admin e Gestor corrigem, com motivo e histórico (RN-02) |
| Alerta 5.000 km antes | 10% do ciclo (no mínimo 5.000 km) ou 30 dias (RN-08) |
| Rotas em inglês (`/api/vehicles`...) | Rotas em português ([API](api.md)) |
| Seed com os intervalos oficiais do Volvo FH | Catálogo inicial com 5 marcas e 46 gerações; intervalos de fábrica cadastrados pelo dono do sistema |
| — | Chamados, avisos no celular, histórico de km, testes automáticos e CI, renovação do login |
