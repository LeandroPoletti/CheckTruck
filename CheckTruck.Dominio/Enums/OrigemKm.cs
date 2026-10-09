using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>O que mudou o km do caminhão (histórico de km).</summary>
[JsonConverter(typeof(JsonStringEnumConverter<OrigemKm>))]
public enum OrigemKm
{
    /// <summary>Km com que o caminhão foi cadastrado.</summary>
    Cadastro = 1,
    /// <summary>Tela Atualizar km (soma o que o caminhão rodou).</summary>
    AtualizarKm = 2,
    /// <summary>OS com km maior que o do caminhão.</summary>
    OrdemServico = 3,
    /// <summary>Km alterado no Editar veículo.</summary>
    Edicao = 4,
    /// <summary>Correção feita por Admin ou Gestor (pode baixar o km; tem motivo).</summary>
    Correcao = 5,
}
