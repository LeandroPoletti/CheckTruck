using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class HistoricoDeKm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RegistrosKm",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VeiculoId = table.Column<long>(type: "bigint", nullable: false),
                    KmAnterior = table.Column<int>(type: "integer", nullable: true),
                    KmNovo = table.Column<int>(type: "integer", nullable: false),
                    Origem = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    OrdemServicoId = table.Column<long>(type: "bigint", nullable: true),
                    RegistradoPorId = table.Column<string>(type: "text", nullable: true),
                    RegistradoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosKm", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrosKm_AspNetUsers_RegistradoPorId",
                        column: x => x.RegistradoPorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RegistrosKm_Manutencoes_OrdemServicoId",
                        column: x => x.OrdemServicoId,
                        principalTable: "Manutencoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RegistrosKm_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosKm_OrdemServicoId",
                table: "RegistrosKm",
                column: "OrdemServicoId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosKm_RegistradoPorId",
                table: "RegistrosKm",
                column: "RegistradoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosKm_VeiculoId",
                table: "RegistrosKm",
                column: "VeiculoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RegistrosKm");
        }
    }
}
