using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class Chamados : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Chamados",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VeiculoId = table.Column<long>(type: "bigint", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Urgencia = table.Column<int>(type: "integer", nullable: false),
                    Descricao = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AbertoPorId = table.Column<string>(type: "text", nullable: false),
                    AbertoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AtendidoPorId = table.Column<string>(type: "text", nullable: true),
                    AtendidoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Solucao = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ConcluidoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Chamados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Chamados_AspNetUsers_AbertoPorId",
                        column: x => x.AbertoPorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Chamados_AspNetUsers_AtendidoPorId",
                        column: x => x.AtendidoPorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Chamados_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Chamados_AbertoPorId",
                table: "Chamados",
                column: "AbertoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_Chamados_AtendidoPorId",
                table: "Chamados",
                column: "AtendidoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_Chamados_Status",
                table: "Chamados",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Chamados_VeiculoId",
                table: "Chamados",
                column: "VeiculoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Chamados");
        }
    }
}
