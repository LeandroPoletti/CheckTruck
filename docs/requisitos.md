# Requisitos e regras de negócio

Os requisitos do documento do TCC (RF-01 a RF-09, RNF-01 a RNF-07 e RN-01 a RN-08), atualizados para o sistema
como ele é hoje, mais os que surgiram no desenvolvimento. **Situação:** ✅ feito · 🟡 parcial · ⏳ futuro.

## Requisitos funcionais

| ID | Requisito | Situação | Observação |
|----|-----------|----------|------------|
| RF-01 | Cadastrar, editar e desativar caminhões (placa, potência, tração, chassi, anos e km) | ✅ | Caminhão não é excluído, só desativado |
| RF-02 | Lançar ordem de serviço com data, km, itens trocados, mecânicos e primeira troca | ✅ | Uma OS tem vários itens e vários mecânicos; a nota fiscal saiu do projeto |
| RF-03 | Consultar o histórico de manutenções de cada caminhão | ✅ | Busca por placa ou nº da OS, filtro por tipo e por período (Este mês, Últimos 3 meses, Este ano ou De e Até), no site e no app |
| RF-04 | Atualizar o km do caminhão sem deixar diminuir | ✅ | Correção só por Admin e Gestor, com motivo |
| RF-05 | Calcular e mostrar alertas por km e por data | ✅ | Margem fixa (10% do ciclo, mínimo 5.000 km, ou 30 dias); não é configurável |
| RF-06 | Entrar no sistema e controlar o acesso | ✅ | Por cargo e permissões, não por 3 perfis fixos |
| RF-07 | Dashboard com o estado da frota (ok, atenção, crítico) | ✅ | No site |
| RF-08 | Listar as trocas próximas ou vencidas de um caminhão | ✅ | Situação do caminhão, no site e no app |
| RF-09 | Consultar os intervalos de troca por geração e por caminhão | ✅ | Tela Intervalos, no site e no app |
| RF-10 | Abrir, atender e resolver chamados | ✅ | Novo |
| RF-11 | Cadastrar as empresas clientes com o login do Admin de cada uma, desativar e ativar | ✅ | Novo. Multiempresa. Só o dono do sistema; não existe criar conta |
| RF-12 | Cadastrar acessos, cargos e permissões; ativar e desativar | ✅ | Novo. Só Admin e Gestor |
| RF-13 | Manter o catálogo (país, fabricante, modelo, geração, potências) e os tipos de manutenção | ✅ | Novo. Do sistema (dono do sistema) e da empresa |
| RF-14 | Cadastrar intervalos da empresa (por geração) e do caminhão | ✅ | Novo. Valem antes do de fábrica |
| RF-15 | Guardar e mostrar o histórico de km (quem, quando, de quanto para quanto e por quê) | ✅ | Novo |
| RF-16 | Avisar no celular as trocas vencidas ou chegando | ✅ | Novo. O próprio celular agenda |
| RF-17 | Avisar no celular, na hora, quem atende chamados quando um chamado é aberto | ✅ | Novo. Push do Expo; no Android só com versão própria do app |
| RF-18 | Cadastrar mecânicos e oficinas que fazem as trocas | ✅ | Novo. Só cadastro, sem login |
| RF-19 | Cada pessoa escolher a cor do sistema (verde, azul, amarelo ou preto) | ✅ | Novo. Fica na conta e vale no site e no app; o padrão é o verde |

## Requisitos não funcionais

| ID | Requisito | Situação | Como está |
|----|-----------|----------|-----------|
| RNF-01 | App para iPhone e Android | ✅ | React Native + Expo; também há o site (React) |
| RNF-02 | Respostas da API em menos de 3 segundos | 🟡 | Ainda não medido com carga. O cálculo da situação é feito no servidor; o aviso pelo Expo espera no máximo 5 s |
| RNF-03 | Dados no PostgreSQL, na nuvem, com backup | 🟡 | PostgreSQL ✅; hoje roda local (Docker), sem nuvem e sem backup automático ⏳ |
| RNF-04 | Segurança | ✅ | Token Bearer de 1 hora com renovação, senhas com hash, bloqueio por tentativas erradas, dados separados por empresa, empresa desativada não entra, HTTPS fora de desenvolvimento |
| RNF-05 | Escalabilidade | 🟡 | Um banco para todas as empresas (multiempresa); ainda não foi publicada nem testada com carga |
| RNF-06 | Integridade dos dados em camadas | ✅ | Banco (chaves, únicos, obrigatórios) + API (todas as regras) + telas (avisam antes de enviar) |
| RNF-07 | API documentada | 🟡 | Scalar em `/docs` em desenvolvimento e a lista de rotas em [api.md](api.md); falta publicar |
| RNF-08 | Testes automáticos e integração contínua | ✅ | Novo. 129 testes (xUnit) e GitHub Actions a cada push |
| RNF-09 | Fácil para quem tem pouca prática com celular | ✅ | Novo. Botões grandes, textos simples, ações onde se procura |
| RNF-10 | Site e app com os mesmos dados na hora | ✅ | Novo. O que muda num aparece no outro sem recarregar (SignalR): as telas abertas da empresa recarregam sozinhas |

## Regras de negócio

| ID | Regra | Onde está | Testes |
|----|-------|-----------|--------|
| RN-01 | **Placa única e obrigatória**, dentro da empresa. Aceita ABC-1234 e Mercosul ABC-1D23; pode ser digitada de qualquer jeito e é gravada maiúscula e com hífen | `ServicoVeiculo`, `PlacaUtil`, índice único (empresa, placa) | `VeiculoTests`, `PlacaUtilTests` |
| RN-02 | **O km só sobe** (cadastro, Atualizar km, OS e edição). Para um km digitado errado, Admin ou Gestor usam Corrigir km: pode baixar, com motivo, mas não para menos que o km da maior OS. Toda mudança fica no histórico | `ServicoVeiculo` | `VeiculoTests`, `OrdemServicoTests` |
| RN-03 | **Todo caminhão tem potência** (e, por ela, geração, modelo e fabricante), porque é a geração que dá os intervalos de fábrica | Chave obrigatória `PotenciaId` | — |
| RN-04 | **Chassi obrigatório, com 17 caracteres** (ISO 3779), único na empresa | DTO, `ServicoVeiculo`, índice único (empresa, chassi) | — |
| RN-05 | **O km da OS atualiza o caminhão** quando é maior que o atual (e vai para o histórico, ligado à OS); um km menor não baixa o do caminhão | `ServicoOrdemServico` | `OrdemServicoTests` |
| RN-06 | **Primeira troca (amaciamento):** sem OS de um item, a primeira troca usa o intervalo da 1ª troca, se houver, contando do km com que o caminhão entrou no sistema; depois, o intervalo normal | `ServicoSituacaoVeiculo` | `SituacaoDoCaminhaoTests` |
| RN-07 | **Próxima troca calculada pela API:** se a OS não trouxer, km = km da OS + intervalo e data = data da OS + meses. Sem intervalo em lugar nenhum, a OS precisa trazer o km | `ServicoOrdemServico` | `OrdemServicoTests` |
| RN-08 | **Alertas:** atenção quando falta 10% do ciclo (no mínimo 5.000 km) ou 30 dias; crítico quando passa do km ou da data. Vale o pior dos dois, e o caminhão fica com o pior item | `ServicoSituacaoVeiculo` | `RegrasDeAlertaTests`, `SituacaoDoCaminhaoTests` |
| RN-09 | **Ordem dos intervalos:** do caminhão → da empresa → de fábrica → padrão seguro (abaixo do que os fabricantes permitem). Embreagem não tem padrão | `IntervalosPadrao` | `IntervalosPadraoTests` |
| RN-10 | **Item sem OS depois do cadastro vence:** o sistema supõe feitas só as trocas de antes do cadastro; depois, só a OS conta como troca | `ServicoSituacaoVeiculo` | `SituacaoDoCaminhaoTests` |
| RN-11 | **OS válida:** pelo menos um item e um mecânico, cada item uma vez, data que não está no futuro, próxima troca depois do km da OS, mecânicos e motorista ativos. O motorista informado vira o motorista atual | `ServicoOrdemServico` | `OrdemServicoTests` |
| RN-12 | **Motorista só no caminhão dele:** vê, atualiza o km e abre chamado só do caminhão em que é o motorista atual; abrir chamado não troca o motorista | `ServicoVeiculo`, `ServicoChamado`, `ServicoSituacaoVeiculo` | `MotoristaTests` |
| RN-13 | **Chamados:** quem abriu edita e exclui enquanto está pendente (Admin e Gestor, qualquer um); atender grava quem está cuidando; resolver exige contar o que foi feito | `ServicoChamado` | — |
| RN-14 | **Aviso de chamado novo** para quem pode atender na mesma empresa, menos quem abriu; se o aviso falhar, o chamado continua aberto | `ServicoCelular` | `CelularTests` |
| RN-15 | **Dados separados por empresa:** a empresa nunca vem do front; o banco filtra todas as consultas e alterações pela empresa de quem está logado | `Context` (filtro global) | `SeparacaoEntreEmpresasTests` |
| RN-16 | **Catálogo do sistema e da empresa:** o do sistema só o dono do sistema muda; o da empresa só ela vê. Nomes não repetem; não se exclui o que está em uso | `ServicoCatalogo` e filhos | `SeparacaoEntreEmpresasTests` (só a separação) |
| RN-17 | **Acessos:** só Admin e Gestor cadastram, editam e desativam; ninguém tira o próprio cargo de gestão; CPF único na empresa | `ServicoUsuario` | `DocumentosTests` (CPF e CNPJ) |
| RN-18 | **Valores aceitos:** nenhum número negativo; anos de 1900 até o ano que vem, e o ano modelo é o de fabricação ou o seguinte; Renavam opcional, com 11 números | `ServicoVeiculo` e demais serviços | `VeiculoTests` |
| RN-19 | **Empresas:** só o dono do sistema cadastra, sempre com o Admin dela; CNPJ válido e que não repete; empresa desativada não entra nem renova o login, e os dados ficam guardados | `ServicoEmpresa`, filtros de acesso, `ConfirmacaoUsuarioAtivo` | `EmpresaTests` |

As regras ficam na API (serviços do `CheckTruck.Dominio`). O banco garante o que dá para garantir com chaves,
obrigatórios e índices únicos, e o site e o app conferem antes de enviar, só para avisar mais rápido.
