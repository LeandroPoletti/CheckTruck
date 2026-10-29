# Domínio (classes)

O projeto `CheckTruck.Dominio` tem as entidades (o que o sistema guarda), os enums e os serviços (as regras). As
entidades são simples: só os dados e os relacionamentos. As regras ficam nos serviços.

## Entidades

Toda entidade implementa uma destas interfaces; o `Context` do EF usa a interface para saber como separar
os dados por empresa.

```mermaid
classDiagram
    direction LR
    class EntidadeBanco {
        <<interface>>
        +long Id
    }
    class EntidadeDaEmpresa {
        <<interface>>
        coluna EmpresaId só no banco
    }
    class ItemDoCatalogo {
        <<interface>>
        +long? EmpresaId
    }
    class EntidadeComVersao {
        <<interface>>
        +uint Versao
    }
    EntidadeBanco <|-- EntidadeDaEmpresa
    EntidadeBanco <|-- ItemDoCatalogo
```

### Catálogo

```mermaid
classDiagram
    direction LR
    class Pais {
        <<catálogo>>
        +string Nome
    }
    class Fabricante {
        <<catálogo>>
        +string Nome
    }
    class Modelo {
        <<catálogo>>
        +string Nome
    }
    class Geracao {
        <<catálogo>>
        +string Nome
        +int AnoInicio
        +int? AnoFim
        +NormaEmissao NormaEmissao
        +string? Motor
        +string? Caixa
    }
    class Potencia {
        <<catálogo>>
        +int Cv
    }
    class TipoManutencao {
        <<catálogo>>
        +string Nome
        +Componente Componente
    }
    class IntervaloRecomendado {
        <<catálogo>>
        +int IntervaloKm
        +int IntervaloKmPrimeira
        +int IntervaloMeses
        +string Fonte
    }
    Pais "1" --> "*" Fabricante : Fabricantes
    Fabricante "1" --> "*" Modelo : Modelos
    Modelo "1" --> "*" Geracao : Geracoes
    Geracao "1" *-- "*" Potencia : Potencias
    Geracao "1" --> "*" IntervaloRecomendado : IntervalosRecomendados
    TipoManutencao "1" <-- "*" IntervaloRecomendado : TipoManutencao
```

### Empresa, frota e chamados

```mermaid
classDiagram
    direction TB
    class Empresa {
        +string Nome
        +string? Documento
        +DateTime? DesativadaEm
        +bool Ativa
    }
    class Usuario {
        +string Nome
        +string? Cpf
        +Cargo Cargo
        +Permissao Permissoes
        +bool Ativo
        +TemaDeCor Tema
        +Pode(Permissao) bool
    }
    class Celular {
        +string Token
        +DateTime AtualizadoEm
    }
    class Veiculo {
        <<da empresa>>
        +string Placa
        +string Chassi
        +string? Renavam
        +Tracao Tracao
        +int KmAtual
        +bool Ativo
    }
    class Potencia
    class IntervaloVeiculo {
        <<da empresa>>
        +int IntervaloKm
        +int IntervaloMeses
    }
    class OrdemServico {
        <<da empresa>>
        +int Numero
        +DateTime RealizadoEm
        +int KmAtual
        +string? Concessionaria
        +DateTime CriadoEm
    }
    class ItemOrdemServico {
        <<da empresa>>
        +int KmProximaTroca
        +DateTime? DataProximaTroca
        +bool IsPrimeiraTroca
    }
    class Mecanico {
        <<da empresa>>
        +string Nome
        +string Funcao
        +bool Ativo
    }
    class RegistroKm {
        <<da empresa>>
        +int? KmAnterior
        +int KmNovo
        +OrigemKm Origem
        +string? Motivo
        +DateTime RegistradoEm
    }
    class Chamado {
        <<da empresa>>
        +TipoOcorrencia Tipo
        +UrgenciaChamado Urgencia
        +string Descricao
        +StatusChamado Status
        +DateTime AbertoEm
        +string? Solucao
    }
    class TipoManutencao
    Empresa "0..1" <-- "*" Usuario : Empresa
    Usuario "1" <-- "*" Celular : Usuario
    Potencia "1" <-- "*" Veiculo : Potencia
    Usuario "0..1" <-- "*" Veiculo : MotoristaAtual
    Veiculo "1" <-- "*" IntervaloVeiculo : Veiculo
    Veiculo "1" --> "*" OrdemServico : OrdensServico
    OrdemServico "1" *-- "1..*" ItemOrdemServico : Itens
    OrdemServico "*" --> "1..*" Mecanico : Mecanicos
    TipoManutencao "1" <-- "*" ItemOrdemServico : TipoManutencao
    TipoManutencao "1" <-- "*" IntervaloVeiculo : TipoManutencao
    Veiculo "1" *-- "*" RegistroKm : RegistrosKm
    Veiculo "1" <-- "*" Chamado : Veiculo
    Usuario "1" <-- "*" Chamado : AbertoPor
```

- **<<da empresa>>** implementa `EntidadeDaEmpresa` (dados de um cliente; a coluna da empresa fica só no banco).
  **<<catálogo>>** implementa `ItemDoCatalogo` (sem empresa = do sistema; com empresa = dela). `Empresa` e
  `Celular` são `EntidadeBanco` simples.
- `Veiculo` e `OrdemServico` também implementam `EntidadeComVersao`: a versão muda a cada gravação (no PostgreSQL, a
  coluna `xmin`). Quem edita manda a versão que abriu e, se alguém gravou antes, nada é gravado e a pessoa recebe
  "Alguém mudou isso enquanto você editava".
- `Usuario` herda de `IdentityUser` (ASP.NET Identity), que traz o e-mail, o hash da senha e o bloqueio.
- Composição (◆): a potência só existe dentro da geração, o item só dentro da OS e o histórico de km só dentro do
  caminhão.

## Enums

| Enum | Valores |
|------|---------|
| `Cargo` | Admin, Gestor, Almoxarife, Mecanico, ChefeManutencao, TecnicoLogistica, AuxiliarLogistica, Motorista, DonoDoSistema |
| `Permissao` (bits) | VerFrota, Veiculos, AtualizarKm, OrdemServico, Cadastros, Intervalos, AbrirChamados, AtenderChamados |
| `Componente` | Motor, Cambio, Diferencial1, Diferencial2, Filtro, Embreagem |
| `NormaEmissao` | AntesDoEuro5, Euro5, Euro6 |
| `Tracao` | QuatroPorDois, SeisPorDois, SeisPorQuatro, OitoPorDois, OitoPorQuatro |
| `OrigemKm` | Cadastro, AtualizarKm, OrdemServico, Edicao, Correcao |
| `OrigemIntervalo` | Veiculo, Empresa, Fabrica, Padrao (nessa ordem de prioridade) |
| `StatusManutencao` | Ok, Atencao, Critico |
| `TipoOcorrencia` | RuidoMotor, Freios, PneuSuspensao, EletricaPainel, Vazamento, ArCondicionado, PreventivaVencida, Outro |
| `UrgenciaChamado` | Baixa, Media, Alta (aparece como "Urgente") |
| `StatusChamado` | Pendente, Concluido |
| `TemaDeCor` | Verde, Azul, Amarelo, Preto (a cor do site e do app de cada pessoa; Verde é o padrão) |

`Permissao` é um enum de bits: as permissões de uma pessoa ficam num número só (ex.: VerFrota + AtualizarKm =
1 + 4 = 5). Admin e Gestor têm todas, sem precisar marcar.

## Serviços

```mermaid
classDiagram
    direction LR

    class IRepositorioCrud {
        <<interface>>
        GetById() Add() Update() Delete() Query()
    }
    class IUsuarioLogado {
        <<interface>>
        +Usuario? Usuario
    }
    class IEnviadorDeAvisos {
        <<interface>>
        +EnviarAsync(tokens, aviso)
    }

    class ServicoCrud~T~ {
        +List~string~ Mensagens
        +Valida(T) bool
        +Inserir(T) T?
        +Atualizar(T) T?
        +Deletar(id) T?
        +Query(filtro)
        #EmUso(id) bool
    }
    class ServicoCatalogo~T~ {
        <<abstract>>
        só o dono do sistema muda o item do sistema
    }
    ServicoCrud~T~ <|-- ServicoCatalogo~T~
    ServicoCatalogo~T~ <|-- ServicoPais
    ServicoCatalogo~T~ <|-- ServicoFabricante
    ServicoCatalogo~T~ <|-- ServicoModelo
    ServicoCatalogo~T~ <|-- ServicoGeracao
    ServicoCatalogo~T~ <|-- ServicoTipoManutencao
    ServicoCatalogo~T~ <|-- ServicoIntervaloRecomendado

    class ServicoVeiculo {
        +AtualizarKmVeiculo()
        +AtualizarKmDoMeuCaminhao()
        +CorrigirKm()
    }
    class ServicoOrdemServico {
        +Inserir(os)
        +Atualizar(os)
    }
    class ServicoChamado {
        +Abrir() Editar() Excluir()
        +Atender() Resolver()
    }
    ServicoCrud~T~ <|-- ServicoVeiculo
    ServicoCrud~T~ <|-- ServicoOrdemServico
    ServicoCrud~T~ <|-- ServicoChamado
    ServicoCrud~T~ <|-- ServicoMecanico
    ServicoCrud~T~ <|-- ServicoIntervaloVeiculo
    ServicoCrud~T~ <|-- ServicoEmpresa

    class ServicoSituacaoVeiculo {
        +ObterSituacaoVeiculos()
        +ObterSituacao(id)
        +ObterSituacaoDoMotorista()
        +TabelaDaGeracao() TabelaDoVeiculo()
    }
    class IntervalosPadrao {
        <<static>>
        +Obter(componente, norma)
        +EmOrdem(caminhao, empresa, fabrica)
    }
    class ServicoDashboard {
        +ObterSituacaoFrota()
    }
    class ServicoUsuario {
        +CriarAsync() AtualizarAsync()
        +AlterarAtivoAsync() AlterarTemaAsync()
        +ListarMotoristasAtivos()
        +DefinirSenhaDoAdminAsync()
    }
    class ServicoCelular {
        +Registrar() Esquecer()
        +AvisarChamadoNovoAsync()
    }
    class ServicoEmpresa {
        +Listar() CriarAsync()
        +AlterarAtiva()
    }

    ServicoCrud~T~ ..> IRepositorioCrud
    ServicoSituacaoVeiculo ..> IRepositorioCrud
    ServicoSituacaoVeiculo ..> IntervalosPadrao
    ServicoOrdemServico ..> ServicoSituacaoVeiculo
    ServicoDashboard ..> ServicoSituacaoVeiculo
    ServicoEmpresa ..> ServicoUsuario
    ServicoCelular ..> IEnviadorDeAvisos
    ServicoVeiculo ..> IUsuarioLogado
```

| Serviço | O que decide |
|---------|--------------|
| `ServicoSituacaoVeiculo` | A situação de cada caminhão: para cada item, a próxima troca (km e data), quanto falta e o status. É o coração do sistema; site, app e dashboard usam o mesmo cálculo. |
| `IntervalosPadrao` | A ordem em que os intervalos valem (caminhão → empresa → fábrica → padrão seguro) e o padrão seguro de cada componente. É o único lugar com essa ordem. |
| `ServicoOrdemServico` | Lançar e editar OS: calcula a próxima troca de cada item (quando a OS não traz), sobe o km do caminhão e troca o motorista atual. |
| `ServicoVeiculo` | Cadastro do caminhão e o km: só sobe (Atualizar km, OS, edição); a correção (Admin e Gestor) pode baixar, com motivo. Toda mudança vai para o histórico. |
| `ServicoChamado` | Abrir (o motorista só do caminhão dele), editar e excluir enquanto pendente, atender e resolver. |
| `ServicoCelular` | Guardar o celular de quem entrou e avisar de chamado novo quem pode atender. |
| `ServicoUsuario` | Acessos: cadastrar, editar, ativar e desativar (só Admin e Gestor; o acesso de um Admin, só um Admin), sempre na própria empresa. Para o dono do sistema, os Admins das empresas e a senha nova de cada um. |
| `ServicoEmpresa` | Empresas (só o dono do sistema): cadastrar com o primeiro acesso (Admin), desativar e ativar. |
| `ServicoCatalogo<T>` e filhos | Itens do catálogo: o do sistema só o dono do sistema muda; nome que não repete; não exclui o que está em uso. |
| `ServicoDashboard` | Resumo da frota para o dashboard: quantos itens em cada status, alertas e caminhões por geração. |

`ServicoCrud<T>` é a base: valida, grava pelo `IRepositorioCrud` e junta as mensagens de erro (em português) que
a API devolve. Os serviços nunca acessam o banco direto, só pelo repositório, por isso os testes trocam o banco
por um repositório em memória.
