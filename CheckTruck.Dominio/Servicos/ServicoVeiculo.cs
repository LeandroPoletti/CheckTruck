using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Servicos;

public class ServicoVeiculo(IRepositorioCrud repositorioCrud) : ServicoCrud<Veiculo>(repositorioCrud)
{
    public override bool Valida(Veiculo entidade)
    {
        if (entidade.Id != 0)
        {
            var oldValue = GetById(entidade.Id);

            if (oldValue is null)
            {
                Mensagens.Add("Veículo não encontrado para atualização.");
            }

            if (oldValue.KmAtual > entidade.KmAtual)
            {
                Mensagens.Add("A quilometragem atual não pode ser menor que a quilometragem anterior.");
            }
        }
        return base.Valida(entidade);
    }
}