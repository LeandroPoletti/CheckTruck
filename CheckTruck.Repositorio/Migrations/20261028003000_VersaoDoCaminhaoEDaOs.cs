using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <summary>
    /// O caminhão e a OS passam a conferir a versão ao gravar (duas pessoas editando ao mesmo tempo). A versão é a
    /// coluna xmin, que o PostgreSQL já tem em toda tabela e muda sozinho a cada gravação: nada muda nas tabelas.
    /// </summary>
    public partial class VersaoDoCaminhaoEDaOs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
