using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class CatalogoModeloGeracaoPotencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // O catálogo mudou (fabricante → modelo → geração → potência): os dados de teste saem antes,
            // porque caminhões, intervalos e modelos antigos não têm como virar a estrutura nova.
            // Ficam acessos, mecânicos, tipos de manutenção, países e fabricantes. O catálogo novo vem do seed.
            migrationBuilder.Sql(@"
                DELETE FROM ""Chamados"";
                DELETE FROM ""Manutencoes"";
                DELETE FROM ""IntervalosVeiculo"";
                DELETE FROM ""IntervalosRecomendados"";
                DELETE FROM ""Veiculos"";
                DELETE FROM ""Modelos"";
                DELETE FROM ""GeracaoModelos"";");

            migrationBuilder.DropForeignKey(
                name: "FK_IntervalosRecomendados_Modelos_ModeloId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropForeignKey(
                name: "FK_Modelos_GeracaoModelos_GeracaoId",
                table: "Modelos");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiculos_Modelos_ModeloId",
                table: "Veiculos");

            migrationBuilder.DropTable(
                name: "GeracaoModelos");

            migrationBuilder.DropColumn(
                name: "EixoDianteiroPneus",
                table: "Modelos");

            migrationBuilder.DropColumn(
                name: "EixoTraseiroTandem",
                table: "Modelos");

            migrationBuilder.DropColumn(
                name: "PneusPorEixoTraseiro",
                table: "Modelos");

            migrationBuilder.DropColumn(
                name: "PotenciaCavalo",
                table: "Modelos");

            migrationBuilder.RenameColumn(
                name: "ModeloId",
                table: "Veiculos",
                newName: "PotenciaId");

            migrationBuilder.RenameIndex(
                name: "IX_Veiculos_ModeloId",
                table: "Veiculos",
                newName: "IX_Veiculos_PotenciaId");

            migrationBuilder.RenameColumn(
                name: "GeracaoId",
                table: "Modelos",
                newName: "FabricanteId");

            migrationBuilder.RenameIndex(
                name: "IX_Modelos_GeracaoId",
                table: "Modelos",
                newName: "IX_Modelos_FabricanteId");

            migrationBuilder.RenameColumn(
                name: "ModeloId",
                table: "IntervalosRecomendados",
                newName: "GeracaoId");

            migrationBuilder.RenameIndex(
                name: "IX_IntervalosRecomendados_ModeloId",
                table: "IntervalosRecomendados",
                newName: "IX_IntervalosRecomendados_GeracaoId");

            migrationBuilder.AddColumn<int>(
                name: "Tracao",
                table: "Veiculos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Modelos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "Geracoes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ModeloId = table.Column<long>(type: "bigint", nullable: false),
                    AnoInicio = table.Column<int>(type: "integer", nullable: false),
                    AnoFim = table.Column<int>(type: "integer", nullable: true),
                    NormaEmissao = table.Column<int>(type: "integer", nullable: false),
                    Motor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Caixa = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Geracoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Geracoes_Modelos_ModeloId",
                        column: x => x.ModeloId,
                        principalTable: "Modelos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Potencias",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Cv = table.Column<int>(type: "integer", nullable: false),
                    GeracaoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Potencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Potencias_Geracoes_GeracaoId",
                        column: x => x.GeracaoId,
                        principalTable: "Geracoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Geracoes_ModeloId",
                table: "Geracoes",
                column: "ModeloId");

            migrationBuilder.CreateIndex(
                name: "IX_Potencias_GeracaoId_Cv",
                table: "Potencias",
                columns: new[] { "GeracaoId", "Cv" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_IntervalosRecomendados_Geracoes_GeracaoId",
                table: "IntervalosRecomendados",
                column: "GeracaoId",
                principalTable: "Geracoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Modelos_Fabricantes_FabricanteId",
                table: "Modelos",
                column: "FabricanteId",
                principalTable: "Fabricantes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veiculos_Potencias_PotenciaId",
                table: "Veiculos",
                column: "PotenciaId",
                principalTable: "Potencias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Volta só a estrutura antiga: os dados apagados no Up não voltam.

            migrationBuilder.DropForeignKey(
                name: "FK_IntervalosRecomendados_Geracoes_GeracaoId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropForeignKey(
                name: "FK_Modelos_Fabricantes_FabricanteId",
                table: "Modelos");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiculos_Potencias_PotenciaId",
                table: "Veiculos");

            migrationBuilder.DropTable(
                name: "Potencias");

            migrationBuilder.DropTable(
                name: "Geracoes");

            migrationBuilder.DropColumn(
                name: "Tracao",
                table: "Veiculos");

            migrationBuilder.RenameColumn(
                name: "PotenciaId",
                table: "Veiculos",
                newName: "ModeloId");

            migrationBuilder.RenameIndex(
                name: "IX_Veiculos_PotenciaId",
                table: "Veiculos",
                newName: "IX_Veiculos_ModeloId");

            migrationBuilder.RenameColumn(
                name: "FabricanteId",
                table: "Modelos",
                newName: "GeracaoId");

            migrationBuilder.RenameIndex(
                name: "IX_Modelos_FabricanteId",
                table: "Modelos",
                newName: "IX_Modelos_GeracaoId");

            migrationBuilder.RenameColumn(
                name: "GeracaoId",
                table: "IntervalosRecomendados",
                newName: "ModeloId");

            migrationBuilder.RenameIndex(
                name: "IX_IntervalosRecomendados_GeracaoId",
                table: "IntervalosRecomendados",
                newName: "IX_IntervalosRecomendados_ModeloId");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Modelos",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<int>(
                name: "EixoDianteiroPneus",
                table: "Modelos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EixoTraseiroTandem",
                table: "Modelos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PneusPorEixoTraseiro",
                table: "Modelos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PotenciaCavalo",
                table: "Modelos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "GeracaoModelos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FabricanteId = table.Column<long>(type: "bigint", nullable: false),
                    AnoFim = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AnoInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Caixa = table.Column<string>(type: "text", nullable: false),
                    Motor = table.Column<string>(type: "text", nullable: false),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NormaEmissao = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeracaoModelos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GeracaoModelos_Fabricantes_FabricanteId",
                        column: x => x.FabricanteId,
                        principalTable: "Fabricantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GeracaoModelos_FabricanteId",
                table: "GeracaoModelos",
                column: "FabricanteId");

            migrationBuilder.AddForeignKey(
                name: "FK_IntervalosRecomendados_Modelos_ModeloId",
                table: "IntervalosRecomendados",
                column: "ModeloId",
                principalTable: "Modelos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Modelos_GeracaoModelos_GeracaoId",
                table: "Modelos",
                column: "GeracaoId",
                principalTable: "GeracaoModelos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veiculos_Modelos_ModeloId",
                table: "Veiculos",
                column: "ModeloId",
                principalTable: "Modelos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
