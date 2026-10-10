using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>Tipo da conta da empresa, escolhido ao criar a conta. O autônomo pode virar frota sem perder nada.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<TipoConta>))]
public enum TipoConta
{
    /// <summary>Empresa com equipe: acessos com cargos e permissões, motoristas e chamados.</summary>
    Frota = 1,

    /// <summary>O dono faz tudo (motorista, mecânico e gestor): um acesso só e sem chamados.</summary>
    Autonomo = 2,
}
