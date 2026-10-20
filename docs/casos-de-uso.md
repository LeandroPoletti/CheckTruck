# Casos de uso

No CheckTruck, o que cada pessoa faz não depende só do cargo: o Admin ou o Gestor libera **permissões**, uma por
uma, para cada acesso (ver a tabela em [Acessos](../README.md#acessos)). Os diagramas mostram o uso típico de cada
perfil, e a tabela no fim diz exatamente qual permissão libera cada caso de uso.

## Motorista e mecânico (campo)

```mermaid
flowchart LR
    mot["Motorista"]
    mec["Mecânico /<br/>chefe de manutenção"]

    subgraph ct["CheckTruck (app)"]
        uc01(["UC01 Entrar"])
        uc04(["UC04 Ver o caminhão<br/>que está comigo"])
        uc05(["UC05 Atualizar km"])
        uc12(["UC12 Abrir chamado"])
        uc14(["UC14 Receber aviso de troca"])
        uc03(["UC03 Ver a situação<br/>dos caminhões"])
        uc07(["UC07 Ver histórico<br/>de OS e de km"])
        uc13(["UC13 Atender e<br/>resolver chamado"])
        uc15(["UC15 Receber aviso<br/>de chamado novo"])
    end

    mot --- uc01
    mot --- uc04
    mot --- uc05
    mot --- uc12
    mot --- uc14
    mec --- uc01
    mec --- uc03
    mec --- uc05
    mec --- uc07
    mec --- uc13
    mec --- uc14
    mec --- uc15
```

O motorista só vê e mexe no caminhão em que ele é o **motorista atual** (quem coloca é o gestor, no cadastro do
caminhão, ou a OS). Sem caminhão, o app avisa para falar com o gestor.

## Escritório (almoxarife, gestor e admin)

```mermaid
flowchart LR
    alm["Almoxarife /<br/>logística"]
    ges["Admin / Gestor"]

    subgraph ct["CheckTruck (site e app)"]
        uc16(["UC16 Ver o dashboard"])
        uc08(["UC08 Lançar OS"])
        uc09(["UC09 Cadastrar caminhão"])
        uc10(["UC10 Cadastrar intervalos<br/>de troca"])
        uc11(["UC11 Cadastros: catálogo da empresa,<br/>tipos de manutenção e mecânicos"])
        uc06(["UC06 Corrigir km"])
        uc17(["UC17 Gerenciar acessos"])
        uc18(["UC18 Minha empresa"])
    end

    alm --- uc16
    alm --- uc08
    alm --- uc11
    ges --- uc16
    ges --- uc08
    ges --- uc09
    ges --- uc10
    ges --- uc11
    ges --- uc06
    ges --- uc17
    ges --- uc18
```

Admin e Gestor podem tudo, inclusive os casos de uso do campo. Só eles cuidam dos acessos e corrigem o km.

## Autônomo

```mermaid
flowchart LR
    aut["Autônomo"]

    subgraph ct["CheckTruck (site e app)"]
        uc03(["UC03 Ver a situação<br/>dos caminhões"])
        uc05(["UC05 Atualizar km"])
        uc06(["UC06 Corrigir km"])
        uc08(["UC08 Lançar OS"])
        uc09(["UC09 Cadastrar caminhão"])
        uc10(["UC10 Cadastrar intervalos"])
        uc11(["UC11 Cadastros"])
        uc14(["UC14 Receber aviso de troca"])
        uc18(["UC18 Minha empresa<br/>(virar Frota)"])
    end

    aut --- uc03
    aut --- uc05
    aut --- uc06
    aut --- uc08
    aut --- uc09
    aut --- uc10
    aut --- uc11
    aut --- uc14
    aut --- uc18
```

O Autônomo é o dono de um ou poucos caminhões e faz tudo sozinho. Não tem chamados nem outros acessos; se
contratar gente, **vira Frota** em Minha empresa e ganha os dois.

## Dono do sistema

```mermaid
flowchart LR
    dono["Dono do sistema"]

    subgraph ct["CheckTruck (site)"]
        uc02(["UC02 Gerenciar empresas<br/>cadastrar com o Admin · desativar · senha nova do Admin"])
        uc19(["UC19 Manter o catálogo do sistema<br/>e os intervalos de fábrica"])
    end

    dono --- uc02
    dono --- uc19
```

O dono do sistema é um login à parte, sem empresa. Ele cadastra cada empresa cliente com o login do Admin dela
(não existe criar conta), e o Admin cadastra o resto da equipe (UC17). Também mantém os fabricantes, modelos,
gerações e intervalos de fábrica que todas as empresas usam.

## Casos de uso × permissões

| Caso de uso | Quem pode | Onde |
|---|---|---|
| UC01 Entrar (o login renova sozinho) | Todos os acessos ativos | Site e app |
| UC02 Gerenciar empresas (cadastrar com o Admin, desativar, senha nova do Admin) | Dono do sistema | Site |
| UC03 Ver a situação dos caminhões | Ver frota | Site e app |
| UC04 Ver o caminhão que está comigo | Motorista que é o motorista atual | App |
| UC05 Atualizar km | Atualizar km; o motorista, no caminhão dele (pelo app) | Site e app |
| UC06 Corrigir km (com motivo) | Admin e Gestor | Site e app |
| UC07 Ver histórico de OS e de km | Ver frota | Site e app |
| UC08 Lançar, editar e excluir OS | Ordem de serviço | Site e app |
| UC09 Cadastrar, editar e desativar caminhão | Veículos | Site e app |
| UC10 Cadastrar intervalos (do caminhão e da empresa) | Intervalos | Site e app |
| UC11 Cadastros (catálogo da empresa, tipos, mecânicos) | Cadastros | Site e app |
| UC12 Abrir chamado | Abrir chamados (só na Frota; o motorista, só do caminhão dele) | Site e app |
| UC13 Atender e resolver chamado | Atender chamados (só na Frota) | Site e app |
| UC14 Receber aviso de troca | Motorista e quem tem Ver frota | App |
| UC15 Receber aviso de chamado novo | Atender chamados (menos quem abriu) | App |
| UC16 Ver o dashboard | Ver frota | Site |
| UC17 Gerenciar acessos | Admin e Gestor (só na Frota) | Site |
| UC18 Minha empresa / virar Frota | Admin e Gestor (e o Autônomo) | Site e app |
| UC19 Manter o catálogo do sistema | Dono do sistema | Site |

## Antes e depois

| Etapa | Antes (sem o sistema) | Com o CheckTruck |
|---|---|---|
| Fazer a manutenção | O registro fica só no sistema da concessionária | O almoxarife (ou o autônomo) lança a OS no mesmo dia, pelo site ou pelo app |
| Guardar o histórico | Espalhado entre concessionárias; a empresa não tem cópia | Histórico de OS e de km de cada caminhão, sempre à mão |
| Saber a próxima troca | Memória do gestor ou anotação | O sistema calcula por km e por data, pelo intervalo que vale para aquele caminhão |
| Ser avisado | Descobre quando já venceu | Atenção quando falta 10% do ciclo (no mínimo 5.000 km) ou 30 dias; crítico quando vence; aviso no celular |
| Problema no caminhão | Recado de boca ou por WhatsApp | O motorista abre um chamado pelo app e quem atende recebe o aviso na hora |
