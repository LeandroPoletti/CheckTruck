using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Util;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

public class ServicoVeiculo(IRepositorioCrud repositorioCrud, ILogger<ServicoVeiculo> logger) : ServicoCrud<Veiculo>(repositorioCrud, logger)
{
    public override bool Valida(Veiculo entidade)
    {
        if (!Enum.IsDefined(entidade.Tracao))
        {
            Mensagens.Add("Escolha a tração do caminhão.");
        }

        if (entidade.KmAtual < 0)
        {
            Mensagens.Add("O km do caminhão não pode ser negativo.");
        }

        // Ano modelo = ano de fabricação ou o seguinte (ex.: fabricado em 2019, modelo 2019 ou 2020)
        var anoFabricacao = entidade.AnoFabricacao.Year;
        var anoModelo = entidade.AnoModelo.Year;
        if (!AnoUtil.IsValido(anoFabricacao) || !AnoUtil.IsValido(anoModelo))
        {
            Mensagens.Add($"Os anos de fabricação e modelo vão de {AnoUtil.AnoMinimo} a {AnoUtil.AnoMaximo}.");
        }
        else if (anoModelo != anoFabricacao && anoModelo != anoFabricacao + 1)
        {
            Mensagens.Add("O ano modelo é o ano de fabricação ou o seguinte (ex.: fabricado em 2019, modelo 2019 ou 2020).");
        }

        if (entidade.Id != 0)
        {
            // Projeção evita rastrear a entidade antiga (conflito de tracking no Update)
            var kmAnterior = Query(v => v.Id == entidade.Id).Select(v => (int?)v.KmAtual).FirstOrDefault();

            if (kmAnterior is null)
            {
                Mensagens.Add("Veículo não encontrado para atualização.");
            }
            else if (kmAnterior > entidade.KmAtual)
            {
                Mensagens.Add("A quilometragem atual não pode ser menor que a quilometragem anterior.");
            }
        }
        return base.Valida(entidade);
    }

    /// <summary>Soma ao km do caminhão a distância que ele rodou (maior que zero).</summary>
    public bool AtualizarKmVeiculo(long veiculoId, int distancia)
    {
        if (distancia <= 0)
        {
            Mensagens.Add("Informe quantos km o caminhão rodou (maior que zero).");
            return false;
        }

        var veiculo = GetById(veiculoId);
        if (veiculo is null)
        {
            Mensagens.Add("Veículo não encontrado.");
            return false;
        }
        
        veiculo.KmAtual += distancia;
        Atualizar(veiculo);
        if (Mensagens.Count <= 0) return true;
        Mensagens.Add("Erro ao atualizar");
        return false;
    }
}
