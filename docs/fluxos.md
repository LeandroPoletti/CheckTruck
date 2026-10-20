# Fluxos principais

Como as partes conversam nos casos de uso mais importantes.

## Situação do caminhão (o cálculo central)

Toda tela que mostra o status (lista de caminhões, detalhe, dashboard, painel do motorista, avisos do celular) pede
para a API, e a API calcula na hora em `ServicoSituacaoVeiculo`. Assim, site e app mostram sempre o mesmo resultado.

```mermaid
sequenceDiagram
    autonumber
    actor P as Pessoa
    participant C as Site ou app
    participant A as API (VeiculoController)
    participant S as ServicoSituacaoVeiculo
    participant I as IntervalosPadrao
    participant R as Repositório (EF Core)

    P->>C: abre o caminhão
    C->>A: GET /api/Veiculo/{id}/situacao (token)
    A->>A: confere o token e a permissão Ver frota
    A->>S: ObterSituacao(id)
    S->>R: caminhão, intervalos cadastrados, última OS de cada item, km de entrada
    R-->>S: dados (só da empresa de quem está logado)
    loop cada tipo de manutenção
        S->>I: EmOrdem(caminhão, empresa, fábrica, padrão)
        I-->>S: o intervalo que vale
        S->>S: próxima troca (km e data), quanto falta e o status
    end
    S-->>A: situação com todos os itens
    A-->>C: JSON
    C-->>P: placa, km, resumo e próximas trocas
```

Para cada item, o cálculo é este:

```mermaid
flowchart TD
    inicio(["Item do caminhão"]) --> intervalo{"Qual intervalo vale?<br/>(o primeiro que existir)"}
    intervalo -->|"1º"| iv["Do caminhão<br/>(plano da concessionária)"]
    intervalo -->|"2º"| ie["Da empresa<br/>para a geração"]
    intervalo -->|"3º"| ifab["De fábrica<br/>da geração"]
    intervalo -->|"4º"| ip["Padrão seguro<br/>do componente"]
    iv & ie & ifab & ip --> temos{"Tem OS desse item?"}
    temos -->|sim| comOs["Próxima troca = a gravada na última OS<br/>(km + intervalo; data + meses)"]
    temos -->|não| semOs["Conta do km com que o caminhão entrou no sistema:<br/>1ª troca pelo intervalo de amaciamento, se houver;<br/>depois, de intervalo em intervalo (vence só por km)"]
    comOs & semOs --> status{"Status"}
    status --> critico["Crítico: passou do km ou da data"]
    status --> atencao["Atenção: falta até 10% do ciclo<br/>(no mínimo 5.000 km) ou até 30 dias"]
    status --> ok["Ok: fora das margens"]
```

Vence o que chegar primeiro: o km ou a data. O status do item é o pior dos dois, e o do caminhão é o pior dos
itens.

## Lançar uma ordem de serviço

```mermaid
sequenceDiagram
    autonumber
    actor P as Almoxarife (ou autônomo)
    participant C as Site ou app
    participant A as API (OrdemServicoController)
    participant O as ServicoOrdemServico
    participant S as ServicoSituacaoVeiculo
    participant R as Repositório

    P->>C: escolhe o caminhão, a data, o km, os itens trocados e os mecânicos
    C->>C: confere os campos antes de enviar
    C->>A: POST /api/OrdemServico (token)
    A->>A: confere a permissão Ordem de serviço e valida o DTO
    A->>O: Inserir(os)
    O->>O: mecânicos e motorista precisam estar ativos
    loop cada item sem a próxima troca preenchida
        O->>S: ResolverIntervalo(caminhão, item)
        S-->>O: intervalo que vale
        O->>O: próximo km = km da OS + intervalo, e data = data da OS + meses
    end
    opt km da OS maior que o do caminhão
        O->>O: sobe o km do caminhão e grava no histórico de km (origem OS)
    end
    opt OS com motorista
        O->>O: ele vira o motorista atual do caminhão
    end
    O->>R: grava a OS com o número em sequência, quem lançou e quando
    O-->>A: OS
    A-->>C: OS criada
    C-->>P: volta para o caminhão, já com a situação nova
```

Se o item não tiver intervalo em nenhum lugar e a OS não trouxer o km da próxima troca, a API recusa com uma
mensagem: "Não há intervalo cadastrado para … Informe o km da próxima troca ou cadastre o intervalo."

## Abrir um chamado e avisar quem atende

```mermaid
sequenceDiagram
    autonumber
    actor M as Motorista
    participant AppM as App do motorista
    participant A as API (ChamadoController)
    participant Ch as ServicoChamado
    participant Ce as ServicoCelular
    participant E as Push do Expo
    participant AppA as App de quem atende
    actor T as Mecânico

    M->>AppM: Abrir chamado (tipo, urgência, o que aconteceu)
    AppM->>A: POST /api/Chamado (token)
    A->>Ch: Abrir(motorista, caminhão, dados)
    Ch->>Ch: o caminhão precisa estar com o motorista
    Ch-->>A: chamado pendente gravado
    A->>Ce: AvisarChamadoNovoAsync(chamado)
    Ce->>Ce: celulares de quem pode atender na mesma empresa, menos quem abriu
    Ce->>E: "Chamado novo: ABC-1D23" / "Vazamento · urgente"
    E-->>AppA: aviso no celular (mesmo com o app fechado)
    Note over Ce,E: se o aviso falhar, o chamado continua aberto (o erro vai para o log)
    A-->>AppM: chamado aberto
    T->>AppA: toca no aviso
    AppA->>A: GET /api/Chamado
    AppA-->>T: aba Chamados, com o novo no topo
    T->>AppA: Atender e depois Resolver (conta o que foi feito)
    AppA->>A: POST /api/Chamado/{id}/atender e /resolver
```

O celular entra nessa lista quando a pessoa abre o app logada e com os avisos ligados (`PUT /api/Celular`), e sai
quando ela toca em Sair (`DELETE /api/Celular`). Um celular fica com quem entrou nele por último.

## Entrar e continuar logado

```mermaid
sequenceDiagram
    autonumber
    actor P as Pessoa
    participant C as Site ou app
    participant A as API (AuthController)
    participant Id as ASP.NET Identity

    P->>C: e-mail e senha
    C->>A: POST /api/Auth/login
    A->>Id: confere a senha, se o acesso e a empresa estão ativos e o bloqueio
    Id-->>A: ok
    A-->>C: accessToken (1 hora) e refreshToken (14 dias)
    C->>A: GET /api/Usuario/me
    A-->>C: nome, cargo, permissões, empresa e tipo de conta
    C-->>P: tela inicial do perfil

    Note over C,A: mais de 1 hora depois
    C->>A: qualquer pedido com o token vencido
    A-->>C: 401
    C->>A: POST /api/Auth/renovar (refreshToken)
    alt chave válida, mesma senha e e-mail, acesso e empresa ativos
        A-->>C: tokens novos
        C->>A: repete o pedido
        A-->>C: resposta normal (a pessoa nem percebe)
    else chave vencida, senha ou e-mail trocados, ou acesso ou empresa desativados
        A-->>C: 401
        C-->>P: volta para a tela de entrar
    end
```

O site guarda os tokens no navegador; o app, no cofre do celular. Vários pedidos vencidos ao mesmo tempo
esperam uma renovação só.

## Dono do sistema cadastra uma empresa

Não existe criar conta: o login de cada empresa nasce aqui, e o Admin dela cadastra o resto da equipe.

```mermaid
sequenceDiagram
    autonumber
    actor D as Dono do sistema
    participant S as Site (Empresas)
    participant A as API (EmpresaController)
    participant E as ServicoEmpresa
    participant U as ServicoUsuario
    actor Ad as Admin da empresa

    D->>S: Nova empresa: nome, CNPJ e o login do Admin
    S->>A: POST /api/Empresa
    A->>A: é o dono do sistema? (SomenteDonoDoSistema)
    A->>E: CriarAsync
    E->>E: nome, CNPJ válido e que não repete, CPF do Admin
    E->>U: CriarPrimeiroAcessoAsync (Admin, gravado junto com a empresa)
    U-->>E: Admin criado
    A-->>S: 201 com a empresa e o Admin
    S-->>D: o login para passar ao dono da empresa
    D-->>Ad: e-mail e senha
    Ad->>S: entra e cadastra a equipe em Acesso
```

Desativar a empresa (`PUT /api/Empresa/{id}/ativa` com `false`) não apaga nada: ninguém dela entra, quem estava
dentro recebe 401 no próximo pedido e a renovação do login também é recusada. Ativar de novo devolve o acesso a
todos.

## Motorista atualiza o km

```mermaid
sequenceDiagram
    autonumber
    actor M as Motorista
    participant App as App
    participant A as API (MeusCaminhoesController)
    participant V as ServicoVeiculo

    M->>App: Atualizar km (digita o km do painel)
    App->>App: confere que é maior que o atual e mostra quanto rodou
    App->>A: PUT /api/MeusCaminhoes/{id}/kilometragem (distância rodada)
    A->>V: AtualizarKmDoMeuCaminhao(motorista, caminhão, distância)
    V->>V: o caminhão precisa estar com ele, e a distância, ser maior que zero
    V->>V: soma ao km e grava no histórico de km (origem Atualizar km)
    V-->>A: ok
    A-->>App: 200
    App-->>M: situação nova do caminhão
```

Ninguém baixa o km pelo Atualizar km. Se alguém digitar errado (ex.: um zero a mais), o Admin ou o Gestor usa
**Corrigir km**, com motivo, e não pode baixar para menos que o km da maior OS.

## Avisos de troca (no próprio celular)

```mermaid
sequenceDiagram
    autonumber
    participant App as App
    participant A as API
    participant SO as Celular (agenda do sistema)

    App->>A: toda vez que a tela inicial aparece: situação dos caminhões
    A-->>App: itens com status e próximas trocas
    App->>App: planeja os avisos (resumo diário e "vence hoje")
    App->>SO: cancela os avisos antigos e agenda os novos
    Note over SO: às 8:00, mesmo sem internet e com o app fechado
    SO-->>App: "ABC-1D23: 1 troca vencida e 1 chegando"
```

Os avisos de troca não passam pelo servidor: o celular agenda sozinho (até 60 avisos) e o app refaz a agenda
toda vez que abre. Ao sair, os avisos são apagados.
