using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

public class ServicoVeiculo(IRepositorioCrud repositorioCrud, ILogger<ServicoVeiculo> logger) : ServicoCrud<Veiculo>(repositorioCrud, logger)
{
    public override bool Valida(Veiculo entidade)
    {
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

    public float ObterDistanciaProximaManutencao(long veiculoId, TipoManutencao tipoManutencao)
    {
        var veiculo = GetById(veiculoId);

        if (veiculo is null)
        {
            Mensagens.Add("Veículo não encontrado.");
            return 0;
        }

        var intervaloRecomendado = veiculo.Modelo.IntervaloRecomendados
            .FirstOrDefault(i => i.TipoManutencao == tipoManutencao);

        if (intervaloRecomendado is null)
        {
            Mensagens.Add("Intervalo de manutenção não encontrado para o tipo especificado.");
            return 0;
        }

        var ultimaManutencao = veiculo.Manutencoes
            .OrderBy(m => m.Id)
            .FirstOrDefault();


        var distanciaParaProximaManutencao =
            (ultimaManutencao?.KmProximaTroca ?? intervaloRecomendado.IntervaloKmPrimeira) - veiculo.KmAtual;

        return distanciaParaProximaManutencao;
    }

    public bool AtualizarKmVeiculo(long veiculoId, int distancia)
    {
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