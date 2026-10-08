using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class TipoDeManutencaoSemCascata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IntervalosRecomendados_TiposManutencao_TipoManutencaoId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_TiposManutencao_TipoManutencaoId",
                table: "Manutencoes");

            migrationBuilder.AddForeignKey(
                name: "FK_IntervalosRecomendados_TiposManutencao_TipoManutencaoId",
                table: "IntervalosRecomendados",
                column: "TipoManutencaoId",
                principalTable: "TiposManutencao",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_TiposManutencao_TipoManutencaoId",
                table: "Manutencoes",
                column: "TipoManutencaoId",
                principalTable: "TiposManutencao",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IntervalosRecomendados_TiposManutencao_TipoManutencaoId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_TiposManutencao_TipoManutencaoId",
                table: "Manutencoes");

            migrationBuilder.AddForeignKey(
                name: "FK_IntervalosRecomendados_TiposManutencao_TipoManutencaoId",
                table: "IntervalosRecomendados",
                column: "TipoManutencaoId",
                principalTable: "TiposManutencao",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_TiposManutencao_TipoManutencaoId",
                table: "Manutencoes",
                column: "TipoManutencaoId",
                principalTable: "TiposManutencao",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
