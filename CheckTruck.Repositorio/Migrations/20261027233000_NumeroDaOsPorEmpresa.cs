using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <summary>
    /// O número da OS passa a ser da empresa: cada uma tem a sua sequência (1, 2, 3...). As OS que já existem são
    /// numeradas na ordem em que foram lançadas, dentro de cada empresa.
    /// </summary>
    public partial class NumeroDaOsPorEmpresa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // O índice único da empresa com o número também serve à chave estrangeira da empresa
            migrationBuilder.DropIndex(
                name: "IX_OrdensServico_EmpresaId",
                table: "OrdensServico");

            migrationBuilder.AddColumn<int>(
                name: "Numero",
                table: "OrdensServico",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""
                UPDATE "OrdensServico" AS o
                SET "Numero" = n."Numero"
                FROM (
                    SELECT "Id", (ROW_NUMBER() OVER (PARTITION BY "EmpresaId" ORDER BY "Id"))::integer AS "Numero"
                    FROM "OrdensServico"
                ) AS n
                WHERE o."Id" = n."Id";
                """);

            migrationBuilder.CreateIndex(
                name: "IX_OrdensServico_EmpresaId_Numero",
                table: "OrdensServico",
                columns: new[] { "EmpresaId", "Numero" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OrdensServico_EmpresaId_Numero",
                table: "OrdensServico");

            migrationBuilder.DropColumn(
                name: "Numero",
                table: "OrdensServico");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensServico_EmpresaId",
                table: "OrdensServico",
                column: "EmpresaId");
        }
    }
}
