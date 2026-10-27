using CheckTruck.Api.Acesso;
using CheckTruck.Api.Avisos;
using CheckTruck.Api.Dtos.Celulares;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Celular de quem está logado, para receber aviso (push) mesmo com o app fechado, como o de chamado novo.
/// O app manda ao entrar e apaga ao sair. Basta estar logado. Não aparece em nenhuma tela: não avisa ninguém.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
[SemAvisoDeMudanca]
public class CelularController(ServicoCelular servicoCelular) : CheckTruckController
{
    /// <summary>Grava o celular para quem está logado. Se estava com outra pessoa, passa para quem entrou agora.</summary>
    [HttpPut]
    public IActionResult Put([FromBody] CelularRequestDto dto) =>
        servicoCelular.Registrar(HttpContext.UsuarioLogado(), dto.Token)
            ? NoContent()
            : Erro(servicoCelular.Mensagens);

    /// <summary>Saiu do app: o celular para de receber os avisos de quem saiu.</summary>
    [HttpDelete]
    public IActionResult Delete([FromBody] CelularRequestDto dto)
    {
        servicoCelular.Esquecer(HttpContext.UsuarioLogado(), dto.Token);
        return NoContent();
    }
}
