using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class CorrecoesDaRevisao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Placas que já estavam no banco ficam no formato do sistema: maiúscula e com hífen (ABC-1234 ou ABC-1D23).
            // Placa fora do padrão fica como está: ao editar o caminhão, a tela pede para arrumar. (O Down não desfaz.)
            migrationBuilder.Sql(
                "UPDATE \"Veiculos\" " +
                "SET \"Placa\" = REGEXP_REPLACE(UPPER(REGEXP_REPLACE(\"Placa\", '[^A-Za-z0-9]', '', 'g')), '^([A-Z]{3})', '\\1-') " +
                "WHERE UPPER(REGEXP_REPLACE(\"Placa\", '[^A-Za-z0-9]', '', 'g')) ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$';");

            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_Veiculos_VeiculoId",
                table: "Manutencoes");

            migrationBuilder.DropIndex(
                name: "IX_IntervalosRecomendados_GeracaoId",
                table: "IntervalosRecomendados");

            migrationBuilder.CreateIndex(
                name: "IX_IntervalosRecomendados_GeracaoId_TipoManutencaoId",
                table: "IntervalosRecomendados",
                columns: new[] { "GeracaoId", "TipoManutencaoId" },
                unique: true,
                filter: "\"EmpresaId\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_IntervalosRecomendados_GeracaoId_TipoManutencaoId_EmpresaId",
                table: "IntervalosRecomendados",
                columns: new[] { "GeracaoId", "TipoManutencaoId", "EmpresaId" },
                unique: true,
                filter: "\"EmpresaId\" IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_Veiculos_VeiculoId",
                table: "Manutencoes",
                column: "VeiculoId",
                principalTable: "Veiculos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_Veiculos_VeiculoId",
                table: "Manutencoes");

            migrationBuilder.DropIndex(
                name: "IX_IntervalosRecomendados_GeracaoId_TipoManutencaoId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropIndex(
                name: "IX_IntervalosRecomendados_GeracaoId_TipoManutencaoId_EmpresaId",
                table: "IntervalosRecomendados");

            migrationBuilder.CreateIndex(
                name: "IX_IntervalosRecomendados_GeracaoId",
                table: "IntervalosRecomendados",
                column: "GeracaoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_Veiculos_VeiculoId",
                table: "Manutencoes",
                column: "VeiculoId",
                principalTable: "Veiculos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
