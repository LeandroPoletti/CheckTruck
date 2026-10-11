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
    /// Situação de manutenção da frota ativa: quantos itens estão em cada status, caminhões em
    /// atenção/crítico com os itens que precisam de cuidado (o mais urgente primeiro) e quantidade de veículos por geração.
    /// </summary>
    /// <param name="limiteAlertas">Máximo de caminhões na lista de alertas; sem valor, retorna todos.</param>
    [HttpGet]
    public ActionResult<DashboardResponseDto> Get([FromQuery] int? limiteAlertas = null)
    {
        return servicoDashboard.ObterSituacaoFrota(limiteAlertas).ToResponseDto();
    }
}
