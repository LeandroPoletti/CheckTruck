using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.Empresas;

/// <summary>Dados da empresa de quem está logado (tela Minha empresa).</summary>
public class EmpresaResponseDto
{
    public string Nome { get; set; } = "";
    public TipoConta TipoConta { get; set; }

    /// <summary>Sem máscara: CNPJ na Frota, CPF no Autônomo. null na empresa do TCC.</summary>
    public string? Documento { get; set; }
}

public static class EmpresaDtoExtensions
{
    public static EmpresaResponseDto ToResponseDto(this Empresa entidade) => new()
    {
        Nome = entidade.Nome,
        TipoConta = entidade.TipoConta,
        Documento = entidade.Documento
    };
}
