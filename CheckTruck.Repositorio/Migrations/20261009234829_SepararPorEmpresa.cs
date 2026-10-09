using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class SepararPorEmpresa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.Id);
                });

            // Empresa do TCC (fica com o id 1): tudo o que já existia no banco passa a ser dela
            migrationBuilder.Sql("INSERT INTO \"Empresas\" (\"Nome\") VALUES ('Transportadora Almeida');");

            migrationBuilder.DropIndex(
                name: "IX_Veiculos_Chassi",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_Veiculos_Placa",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_Cpf",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Veiculos",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "RegistrosKm",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Mecanicos",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Manutencoes",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "IntervalosVeiculo",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Chamados",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "AspNetUsers",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            // O 1 só valia para as linhas que já existiam: daqui pra frente a API sempre grava a empresa
            foreach (var tabela in new[] { "Veiculos", "RegistrosKm", "Mecanicos", "Manutencoes", "IntervalosVeiculo", "Chamados", "AspNetUsers" })
            {
                migrationBuilder.Sql($"ALTER TABLE \"{tabela}\" ALTER COLUMN \"EmpresaId\" DROP DEFAULT;");
            }

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_EmpresaId_Chassi",
                table: "Veiculos",
                columns: new[] { "EmpresaId", "Chassi" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_EmpresaId_Placa",
                table: "Veiculos",
                columns: new[] { "EmpresaId", "Placa" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosKm_EmpresaId",
                table: "RegistrosKm",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Mecanicos_EmpresaId",
                table: "Mecanicos",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_EmpresaId",
                table: "Manutencoes",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_IntervalosVeiculo_EmpresaId",
                table: "IntervalosVeiculo",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Chamados_EmpresaId",
                table: "Chamados",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_EmpresaId_Cpf",
                table: "AspNetUsers",
                columns: new[] { "EmpresaId", "Cpf" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Empresas_EmpresaId",
                table: "AspNetUsers",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Chamados_Empresas_EmpresaId",
                table: "Chamados",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_IntervalosVeiculo_Empresas_EmpresaId",
                table: "IntervalosVeiculo",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_Empresas_EmpresaId",
                table: "Manutencoes",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Mecanicos_Empresas_EmpresaId",
                table: "Mecanicos",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosKm_Empresas_EmpresaId",
                table: "RegistrosKm",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veiculos_Empresas_EmpresaId",
                table: "Veiculos",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Empresas_EmpresaId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_Chamados_Empresas_EmpresaId",
                table: "Chamados");

            migrationBuilder.DropForeignKey(
                name: "FK_IntervalosVeiculo_Empresas_EmpresaId",
                table: "IntervalosVeiculo");

            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_Empresas_EmpresaId",
                table: "Manutencoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Mecanicos_Empresas_EmpresaId",
                table: "Mecanicos");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosKm_Empresas_EmpresaId",
                table: "RegistrosKm");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiculos_Empresas_EmpresaId",
                table: "Veiculos");

            migrationBuilder.DropTable(
                name: "Empresas");

            migrationBuilder.DropIndex(
                name: "IX_Veiculos_EmpresaId_Chassi",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_Veiculos_EmpresaId_Placa",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosKm_EmpresaId",
                table: "RegistrosKm");

            migrationBuilder.DropIndex(
                name: "IX_Mecanicos_EmpresaId",
                table: "Mecanicos");

            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_EmpresaId",
                table: "Manutencoes");

            migrationBuilder.DropIndex(
                name: "IX_IntervalosVeiculo_EmpresaId",
                table: "IntervalosVeiculo");

            migrationBuilder.DropIndex(
                name: "IX_Chamados_EmpresaId",
                table: "Chamados");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_EmpresaId_Cpf",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Veiculos");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "RegistrosKm");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Mecanicos");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "IntervalosVeiculo");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Chamados");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "AspNetUsers");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_Chassi",
                table: "Veiculos",
                column: "Chassi",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_Placa",
                table: "Veiculos",
                column: "Placa",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_Cpf",
                table: "AspNetUsers",
                column: "Cpf",
                unique: true);
        }
    }
}
