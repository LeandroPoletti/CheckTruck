using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Util;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Gerações de um modelo, com as potências em que foram vendidas. As potências chegam junto com a
/// geração (lista de cv): ao salvar, entram as novas e saem as que não vieram. Potência com caminhão
/// cadastrado não pode sair, e geração com caminhão ou intervalo cadastrado não pode ser excluída.
/// A geração do sistema só o dono do sistema muda (ver <see cref="ServicoCatalogo{T}"/>).
/// </summary>
public class ServicoGeracao(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Potencia> servicoPotencia,
    ServicoCrud<Veiculo> servicoVeiculo,
    ServicoCrud<IntervaloRecomendado> servicoIntervalo,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoGeracao> logger) : ServicoCatalogo<Geracao>(repositorioCrud, usuarioLogado, logger)
{
    public const int PotenciaMinimaCv = 100;
    public const int PotenciaMaximaCv = 1000;

    public override bool Valida(Geracao entidade)
    {
        entidade.Nome = entidade.Nome.Trim();
        entidade.Potencias = entidade.Potencias.DistinctBy(p => p.Cv).OrderBy(p => p.Cv).ToList();

        if (entidade.Nome.Length == 0)
        {
            Mensagens.Add("Informe o nome da geração.");
        }

        if (!Enum.IsDefined(entidade.NormaEmissao))
        {
            Mensagens.Add("Escolha a norma de emissão.");
        }

        if (!AnoUtil.IsValido(entidade.AnoInicio))
        {
            Mensagens.Add($"O primeiro ano-modelo vai de {AnoUtil.AnoMinimo} a {AnoUtil.AnoMaximo}.");
        }
        else if (entidade.AnoFim is { } anoFim && (anoFim < entidade.AnoInicio || anoFim > AnoUtil.AnoMaximo))
        {
            Mensagens.Add($"O último ano-modelo vai do primeiro até {AnoUtil.AnoMaximo}.");
        }

        if (entidade.Potencias.Count == 0)
        {
            Mensagens.Add("Informe pelo menos uma potência.");
        }
        else if (entidade.Potencias.Any(p => p.Cv < PotenciaMinimaCv || p.Cv > PotenciaMaximaCv))
        {
            Mensagens.Add($"A potência vai de {PotenciaMinimaCv} a {PotenciaMaximaCv} cv.");
        }

        var nome = entidade.Nome.ToLower();
        var modeloId = entidade.Modelo.Id;
        if (Query(g => g.Id != entidade.Id && g.Modelo.Id == modeloId && g.Nome.ToLower() == nome).Any())
        {
            Mensagens.Add("Esse modelo já tem uma geração com esse nome.");
        }

        return base.Valida(entidade);
    }

    public override Geracao? Atualizar(Geracao entidade)
    {
        if (!PodeMexer(entidade.Id) || !Valida(entidade))
        {
            return null;
        }

        // As potências que já existem ficam como estão: entram as novas e saem as que não vieram
        var cvs = entidade.Potencias.Select(p => p.Cv).ToList();
        var atuais = servicoPotencia.Query(p => p.Geracao.Id == entidade.Id)
            .Select(p => new { p.Id, p.Cv })
            .ToList();
        var saem = atuais.Where(p => !cvs.Contains(p.Cv)).Select(p => p.Id).ToList();

        // O catálogo é de todas as empresas: caminhão de qualquer uma segura a potência
        var emUso = servicoVeiculo.QueryTodasAsEmpresas(v => saem.Contains(v.Potencia.Id))
            .Select(v => v.Potencia.Cv)
            .Distinct()
            .OrderBy(cv => cv)
            .ToList();
        if (emUso.Count > 0)
        {
            Mensagens.Add($"Não dá para tirar {string.Join(", ", emUso)} cv: tem caminhão cadastrado com essa potência.");
            return null;
        }

        entidade.Potencias = entidade.Potencias.Where(p => atuais.All(a => a.Cv != p.Cv)).ToList();
        var salvou = MakeTransaction(repositorio =>
        {
            foreach (var potenciaId in saem)
            {
                repositorio.Delete<Potencia>(potenciaId);
            }

            repositorio.Update(entidade);
        });

        return salvou ? entidade : null;
    }

    /// <summary>Geração com caminhão ou intervalo não sai. As potências saem junto com ela (cascata no banco).</summary>
    protected override bool EmUso(long id)
    {
        var veiculos = servicoVeiculo.QueryTodasAsEmpresas(v => v.Potencia.Geracao.Id == id).Count();
        var intervalos = servicoIntervalo.QueryTodasAsEmpresas(i => i.Geracao.Id == id).Count();
        if (veiculos == 0 && intervalos == 0)
        {
            return false;
        }

        Mensagens.Add($"Não dá para excluir: a geração tem {veiculos} caminhão(ões) e {intervalos} intervalo(s) cadastrado(s).");
        return true;
    }
}
