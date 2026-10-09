using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Dominio.Interfaces;

/// <summary>Quem está logado na ação de agora (para gravar no histórico). A API preenche pelo token.</summary>
public interface IUsuarioLogado
{
    Usuario? Usuario { get; }
}
