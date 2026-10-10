using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Base de todos os controllers. Todo erro sai num formato só, o ProblemDetails (status, title e detail):
/// o detail é a mensagem para o usuário, e é ela que o front mostra.
/// </summary>
public abstract class CheckTruckController : ControllerBase
{
    /// <summary>Erro com a mensagem para o usuário (400, se não disser outro status).</summary>
    protected ObjectResult Erro(string mensagem, int status = StatusCodes.Status400BadRequest) =>
        Problem(detail: mensagem, statusCode: status);

    /// <summary>Erro com as mensagens que o serviço juntou.</summary>
    protected ObjectResult Erro(IEnumerable<string> mensagens) => Erro(string.Join(" ", mensagens));
}
