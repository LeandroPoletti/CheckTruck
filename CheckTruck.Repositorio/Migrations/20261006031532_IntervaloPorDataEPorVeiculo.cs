using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class IntervaloPorDataEPorVeiculo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IntervaloMeses",
                table: "IntervalosRecomendados",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "IntervalosVeiculo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VeiculoId = table.Column<long>(type: "bigint", nullable: false),
                    TipoManutencaoId = table.Column<long>(type: "bigint", nullable: false),
                    IntervaloKm = table.Column<int>(type: "integer", nullable: false),
                    IntervaloMeses = table.Column<int>(type: "integer", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntervalosVeiculo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IntervalosVeiculo_TiposManutencao_TipoManutencaoId",
                        column: x => x.TipoManutencaoId,
                        principalTable: "TiposManutencao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IntervalosVeiculo_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IntervalosVeiculo_TipoManutencaoId",
                table: "IntervalosVeiculo",
                column: "TipoManutencaoId");

            migrationBuilder.CreateIndex(
                name: "IX_IntervalosVeiculo_VeiculoId_TipoManutencaoId",
                table: "IntervalosVeiculo",
                columns: new[] { "VeiculoId", "TipoManutencaoId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IntervalosVeiculo");

            migrationBuilder.DropColumn(
                name: "IntervaloMeses",
                table: "IntervalosRecomendados");
        }
    }
}
