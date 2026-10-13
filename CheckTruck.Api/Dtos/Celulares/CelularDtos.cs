using System.ComponentModel.DataAnnotations;

namespace CheckTruck.Api.Dtos.Celulares;

/// <summary>O endereço do celular no serviço de avisos do Expo (ExponentPushToken[...]), que o app pega.</summary>
public class CelularRequestDto
{
    [Required(ErrorMessage = "Não deu para ligar os avisos neste celular.")]
    public string Token { get; set; } = "";
}
