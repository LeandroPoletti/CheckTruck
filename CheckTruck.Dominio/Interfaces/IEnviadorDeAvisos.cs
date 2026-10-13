namespace CheckTruck.Dominio.Interfaces;

/// <summary>Aviso que aparece no celular: título, texto e o chamado que ele abre ao tocar.</summary>
public record AvisoNoCelular(string Titulo, string Texto, long ChamadoId);

/// <summary>Manda aviso (push) para celulares. A API manda pelo serviço do Expo.</summary>
public interface IEnviadorDeAvisos
{
    /// <returns>Os tokens que não valem mais (ex.: o app foi apagado do celular), para não mandar de novo.</returns>
    Task<IReadOnlyList<string>> EnviarAsync(IReadOnlyList<string> tokens, AvisoNoCelular aviso);
}
