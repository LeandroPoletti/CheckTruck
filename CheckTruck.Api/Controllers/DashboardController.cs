using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Dashboard;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

// Só quem vê a frota
[ApiController]
[Route("api/[controller]")]
[ExigePermissao(Permissao.VerFrota)]
public class DashboardController(ServicoDashboard servicoDashboard) : CheckTruckController
{
    /// <summary>
    /// Situação de manutenção da frota ativa: contagem por status, item mais urgente de cada
    /// veículo em atenção/crítico (ordenado pelo km restante) e quantidade de veículos por geração.
    /// </summary>
    /// <param name="limiteAlertas">Máximo de alertas retornados; sem valor, retorna todos.</param>
    [HttpGet]
    public ActionResult<DashboardResponseDto> Get([FromQuery] int? limiteAlertas = null)
    {
        return servicoDashboard.ObterSituacaoFrota(limiteAlertas).ToResponseDto();
    }
}
