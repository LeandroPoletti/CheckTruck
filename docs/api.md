# API REST

Base: `/api`. Tudo em JSON. Toda rota, menos as de `Auth`, exige o token no cabeçalho
`Authorization: Bearer <accessToken>`. Com a API rodando em desenvolvimento, a documentação interativa (Scalar)
fica em `/docs`.

- **Erros** saem sempre como ProblemDetails, com a mensagem para o usuário em `detail` (400 dado inválido,
  401 sem login, acesso inativo ou empresa desativada, 403 sem permissão, 404 não encontrado).
- **Listas** com OData aceitam `$filter`, `$orderby`, `$top` (até 100), `$skip` e `$count`
  (ex.: `GET /api/OrdemServico?$filter=Veiculo/Id eq 7`).
- **Listas que crescem sempre** (OS da frota, chamados concluídos e histórico de km) vêm das mais novas para as mais
  velhas, as primeiras `quantos` (50 se não disser, até 500) com o `total`: `{ itens, total }`. Para ver mais, a
  tela pede de novo com um `quantos` maior.
- **Permissão** na tabela: o que a rota exige além de estar logado. "Gestão" = Admin ou Gestor; "Dono" = dono do
  sistema.
- **Versão** (caminhão e OS): a resposta traz `versao`; ao editar, mande a que veio. Se alguém salvou antes, a API
  responde 400 com "Alguém mudou isso enquanto você editava. Feche e abra de novo para ver como ficou." e nada é gravado.
- **Enums** vão como texto (ex.: `"Vazamento"`, `"Alta"`), menos o componente do tipo de manutenção, que vai como número.
- **Canal de mudanças:** `/hubs/mudancas` (SignalR, com o token em `access_token`). Depois de toda mudança que deu
  certo (POST, PUT ou DELETE), a API manda `mudou` para os sites e apps abertos da mesma empresa (a do dono do
  sistema vai para todos), e eles recarregam a tela. Vários avisos seguidos viram uma recarga só, e a aba do
  navegador escondida só recarrega quando volta a aparecer. Quem fez a mudança manda o id da conexão dele no
  cabeçalho `X-Conexao` e não recebe o próprio aviso. O celular (`api/Celular`) não avisa ninguém.

## Login

Não existe criar conta: o dono do sistema cadastra a empresa e o Admin dela (`POST /api/Empresa`), e o Admin
cadastra o resto da equipe (`POST /api/Usuario`).

| Método | Rota | O que faz | Permissão |
|---|---|---|---|
| POST | `/api/Auth/login` | Entra; devolve `accessToken` (1 hora) e `refreshToken` (14 dias) | Público |
| POST | `/api/Auth/renovar` | Troca o `refreshToken` por tokens novos, sem a senha | Público (com a chave) |
| GET | `/api/Usuario/me` | Quem está logado: cargo, permissões, empresa e tema de cor | — |
| PUT | `/api/Usuario/me/tema` | Troca a cor de quem está logado (corpo: `"Verde"`, `"Azul"`, `"Amarelo"` ou `"Preto"`); vale no site e no app | — |

## Empresas

| Método | Rota | O que faz | Permissão |
|---|---|---|---|
| GET | `/api/Empresa` | Todas as empresas (ativas e desativadas), com os Admins de cada uma | Dono |
| POST | `/api/Empresa` | Cadastra a empresa (nome e CNPJ) e o Admin dela (nome, CPF, e-mail e senha) | Dono |
| PUT | `/api/Empresa/{id}/ativa` | Ativa ou desativa (corpo: `true` ou `false`); desativada, ninguém dela entra | Dono |
| PUT | `/api/Empresa/{id}/admins/{usuarioId}/senha` | Senha nova para o Admin da empresa (corpo: `{ "senha" }`) | Dono |
| GET | `/api/Empresa/minha` | Dados da empresa de quem está logado | Gestão |

## Acessos

| Método | Rota | O que faz | Permissão |
|---|---|---|---|
| GET | `/api/Usuario` | Todos os acessos da empresa | Gestão |
| GET | `/api/Usuario/{id}` | Um acesso | Gestão |
| POST | `/api/Usuario` | Cadastra (cargo e permissões) | Gestão |
| PUT | `/api/Usuario/{id}` | Edita; senha em branco mantém a atual | Gestão |
| PUT | `/api/Usuario/{id}/ativo` | Ativa ou desativa (corpo: `true` ou `false`) | Gestão |
| GET | `/api/Usuario/motoristas` | Motoristas ativos, para escolher no caminhão e na OS | — |

## Caminhões

| Método | Rota | O que faz | Permissão |
|---|---|---|---|
| GET | `/api/Veiculo` | Cadastro dos caminhões (OData) | Ver frota |
| GET | `/api/Veiculo/situacao` | Lista com o status e o item mais urgente de cada um | Ver frota |
| GET | `/api/Veiculo/{id}` | Cadastro de um caminhão | Ver frota |
| GET | `/api/Veiculo/{id}/situacao` | Situação completa: cada item, km e dias que faltam, de onde veio o intervalo | Ver frota |
| GET | `/api/Veiculo/placa/{placa}/situacao` | A mesma situação, pela placa (com ou sem hífen) | Ver frota |
| GET | `/api/Veiculo/{id}/historico-km?quantos=` | Histórico de km, do mais novo para o mais velho (`{ itens, total }`) | Ver frota |
| POST | `/api/Veiculo` | Cadastra | Veículos |
| PUT | `/api/Veiculo/{id}` | Edita (inclusive desativar) | Veículos |
| PUT | `/api/Veiculo/{id}/km` | Grava o km do painel, maior que o registrado (corpo: `{ km }`) | Atualizar km |
| PUT | `/api/Veiculo/{id}/corrigir-km` | Corrige o km, com motivo | Gestão |
| GET | `/api/MeusCaminhoes` | Situação dos caminhões que estão com quem está logado (motorista) | — |
| PUT | `/api/MeusCaminhoes/{id}/km` | O motorista grava o km do painel do caminhão dele | — (precisa estar com o caminhão) |
| GET | `/api/Dashboard` | Resumo da frota: itens por status, alertas e caminhões por geração | Ver frota |

## Ordens de serviço

| Método | Rota | O que faz | Permissão |
|---|---|---|---|
| GET | `/api/OrdemServico` | Lista (OData) | Ver frota |
| GET | `/api/OrdemServico/pagina?tipoId=&busca=&de=&ate=&quantos=` | OS da frota, da troca mais nova para a mais velha (`{ itens, total }`); busca pela placa ou pelo nº, período em aaaa-mm-dd | Ver frota |
| GET | `/api/OrdemServico/{id}` | Uma OS | Ver frota |
| POST | `/api/OrdemServico` | Lança com o próximo número da empresa: itens, mecânicos, km, data, motorista; calcula a próxima troca que não vier | Ordem de serviço |
| PUT | `/api/OrdemServico/{id}` | Edita | Ordem de serviço |
| DELETE | `/api/OrdemServico/{id}` | Exclui | Ordem de serviço |

## Chamados

| Método | Rota | O que faz | Permissão |
|---|---|---|---|
| GET | `/api/Chamado?quantosConcluidos=` | Todos os pendentes e os concluídos mais novos (`{ pendentes, concluidos: { itens, total } }`); quem só abre vê os próprios | Abrir ou Atender chamados |
| GET | `/api/Chamado/veiculos` | Placas para escolher (o motorista, só a dele) | Abrir chamados |
| POST | `/api/Chamado` | Abre e avisa no celular quem pode atender | Abrir chamados |
| PUT | `/api/Chamado/{id}` | Edita enquanto pendente | Abrir chamados |
| DELETE | `/api/Chamado/{id}` | Exclui enquanto pendente | Abrir chamados |
| POST | `/api/Chamado/{id}/atender` | Grava quem está cuidando | Atender chamados |
| POST | `/api/Chamado/{id}/resolver` | Conclui, com o que foi feito | Atender chamados |

## Celular

| Método | Rota | O que faz | Permissão |
|---|---|---|---|
| PUT | `/api/Celular` | Grava o celular (token do Expo) de quem está logado | — |
| DELETE | `/api/Celular` | Saiu do app: o celular para de receber avisos | — |

## Intervalos de troca

| Método | Rota | O que faz | Permissão |
|---|---|---|---|
| GET | `/api/IntervaloRecomendado` | Intervalos de fábrica e da empresa (OData) | — |
| GET | `/api/IntervaloRecomendado/{id}` | Um intervalo | — |
| GET | `/api/IntervaloRecomendado/tabela/{geracaoId}` | Para cada item da geração, os intervalos na ordem em que valem | — |
| POST, PUT, DELETE | `/api/IntervaloRecomendado[/{id}]` | Cadastra, edita e exclui (o de fábrica, só o dono do sistema) | Intervalos |
| GET | `/api/IntervaloVeiculo` | Intervalos dos caminhões (OData) | — |
| GET | `/api/IntervaloVeiculo/{id}` | Um intervalo | — |
| GET | `/api/IntervaloVeiculo/veiculos` | Caminhões ativos com a geração, para a tela Intervalos | Intervalos |
| GET | `/api/IntervaloVeiculo/tabela/{veiculoId}` | Para cada item do caminhão, os intervalos na ordem em que valem | — |
| POST, PUT, DELETE | `/api/IntervaloVeiculo[/{id}]` | Cadastra, edita e exclui | Intervalos |

## Catálogo e cadastros

Todos com o mesmo formato: `GET` lista (OData), `GET /{id}`, `POST`, `PUT /{id}` e `DELETE /{id}`. Ver é para
qualquer logado; mudar exige **Cadastros** (e o item do sistema, só o dono do sistema).

| Recurso | Rota | Observação |
|---|---|---|
| Países | `/api/Pais` | Não exclui país com fabricante |
| Fabricantes | `/api/Fabricante` | Não exclui fabricante com modelo |
| Modelos | `/api/Modelo` | Não exclui modelo com geração |
| Gerações | `/api/Geracao` | As potências vão junto (lista de cv); não exclui geração com caminhão ou intervalo |
| Tipos de manutenção | `/api/TipoManutencao` | Não exclui tipo com OS ou intervalo |
| Mecânicos | `/api/Mecanico` | Não exclui mecânico com OS (desativa) |
