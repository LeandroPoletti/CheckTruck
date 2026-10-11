using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Veiculos;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Meus caminhões: o motorista vê e atualiza o km só dos caminhões em que ele é o motorista atual.
/// Estar com o caminhão é a permissão (não precisa de Ver frota nem de Atualizar km).
/// Quem põe o motorista no caminhão é o gestor (cadastro do caminhão) ou a OS.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class MeusCaminhoesController(ServicoVeiculo servicoVeiculo, ServicoSituacaoVeiculo servicoSituacao)
    : CheckTruckController
{
    /// <summary>Situação completa (todos os itens) de cada caminhão ativo que está com quem está logado. Vazio = nenhum.</summary>
    [HttpGet]
    public ActionResult<IEnumerable<VeiculoSituacaoResponseDto>> Get() =>
        servicoSituacao.ObterSituacaoDoMotorista(HttpContext.UsuarioLogado().Id)
            .Select(s => s.ToResponseDto(incluirItens: true))
            .ToList();

    /// <summary>Soma ao km a distância rodada (maior que zero). Só no caminhão que está com quem está logado.</summary>
    [HttpPut("{id:long}/kilometragem")]
    public IActionResult AtualizarKilometragem(long id, [FromBody] int distancia) =>
        servicoVeiculo.AtualizarKmDoMeuCaminhao(HttpContext.UsuarioLogado(), id, distancia)
            ? Ok()
            : Erro(servicoVeiculo.Mensagens);
}
