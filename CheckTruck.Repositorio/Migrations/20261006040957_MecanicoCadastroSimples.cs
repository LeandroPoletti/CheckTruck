using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class MecanicoCadastroSimples : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cpf",
                table: "Mecanicos");

            migrationBuilder.DropColumn(
                name: "Mecanico",
                table: "Manutencoes");

            migrationBuilder.AlterColumn<string>(
                name: "UsuarioGuid",
                table: "Mecanicos",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Mecanicos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Funcao",
                table: "Mecanicos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Nome",
                table: "Mecanicos",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "MecanicoId",
                table: "Manutencoes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_MecanicoId",
                table: "Manutencoes",
                column: "MecanicoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_Mecanicos_MecanicoId",
                table: "Manutencoes",
                column: "MecanicoId",
                principalTable: "Mecanicos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_Mecanicos_MecanicoId",
                table: "Manutencoes");

            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_MecanicoId",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Mecanicos");

            migrationBuilder.DropColumn(
                name: "Funcao",
                table: "Mecanicos");

            migrationBuilder.DropColumn(
                name: "Nome",
                table: "Mecanicos");

            migrationBuilder.DropColumn(
                name: "MecanicoId",
                table: "Manutencoes");

            migrationBuilder.AlterColumn<string>(
                name: "UsuarioGuid",
                table: "Mecanicos",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cpf",
                table: "Mecanicos",
                type: "character varying(14)",
                maxLength: 14,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Mecanico",
                table: "Manutencoes",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");
        }
    }
}
