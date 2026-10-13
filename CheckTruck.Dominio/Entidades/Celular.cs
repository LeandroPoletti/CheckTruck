using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Celular em que alguém entrou no app, para receber aviso (push) mesmo com o app fechado (ex.: chamado novo).
/// O token é o endereço do celular no serviço de avisos do Expo. Um celular fica com quem entrou nele por último.
/// A empresa é a da pessoa (não tem coluna própria).
/// </summary>
public class Celular : EntidadeBanco
{
    public const int TamanhoDoToken = 200;

    public long Id { get; set; }
    public string Token { get; set; } = "";
    public Usuario Usuario { get; set; } = null!;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}
