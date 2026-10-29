namespace CheckTruck.Dominio.Interfaces;

/// <summary>
/// Registro que duas pessoas podem estar editando ao mesmo tempo (o caminhão e a OS). A versão muda a cada gravação:
/// quem salva manda a versão que abriu e, se alguém salvou antes, nada é gravado (<see cref="ConflitoDeEdicaoException"/>).
/// </summary>
public interface EntidadeComVersao
{
    /// <summary>A versão que estava no banco quando a pessoa abriu (no PostgreSQL, a coluna xmin).</summary>
    public uint Versao { get; set; }
}

/// <summary>Alguém gravou o mesmo registro antes: a gravação de agora não acontece.</summary>
public class ConflitoDeEdicaoException(Exception causa) : Exception("Alguém gravou esse registro antes.", causa)
{
}
