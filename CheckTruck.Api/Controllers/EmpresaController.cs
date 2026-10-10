using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Empresas;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>A empresa de quem está logado (tela Minha empresa). Só Admin e Gestor.</summary>
[ApiController]
[Route("api/[controller]")]
[SomenteGestao]
public class EmpresaController(ServicoEmpresa servicoEmpresa) : CheckTruckController
{
    [HttpGet("minha")]
    public ActionResult<EmpresaResponseDto> Minha()
    {
        var empresa = servicoEmpresa.ObterAtual();
        if (empresa is null)
        {
            return NotFound();
        }

        return empresa.ToResponseDto();
    }

    /// <summary>O Autônomo vira Frota: libera os acessos (motoristas, mecânicos, gestor) e os chamados. Não volta.</summary>
    [HttpPut("minha/virar-frota")]
    public ActionResult<EmpresaResponseDto> VirarFrota()
    {
        var empresa = servicoEmpresa.VirarFrota();
        if (empresa is null)
        {
            return Erro(servicoEmpresa.Mensagens);
        }

        return empresa.ToResponseDto();
    }
}
