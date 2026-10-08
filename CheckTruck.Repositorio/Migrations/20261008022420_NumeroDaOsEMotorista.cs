using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class NumeroDaOsEMotorista : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LancadoPorId",
                table: "Manutencoes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotoristaId",
                table: "Manutencoes",
                type: "text",
                nullable: true);

            // Antes de apagar o login gravado como texto, liga as OS antigas ao usuário com esse login.
            // Login que não bate com nenhum usuário fica sem "lançada por".
            migrationBuilder.Sql("""
                UPDATE "Manutencoes" AS m
                SET "LancadoPorId" = u."Id"
                FROM "AspNetUsers" AS u
                WHERE u."NormalizedUserName" = UPPER(m."LancadoPor");
                """);

            migrationBuilder.DropColumn(
                name: "LancadoPor",
                table: "Manutencoes");

            // O número da OS passa a ser o Id
            migrationBuilder.DropColumn(
                name: "NumNotaFiscal",
                table: "Manutencoes");

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_LancadoPorId",
                table: "Manutencoes",
                column: "LancadoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_MotoristaId",
                table: "Manutencoes",
                column: "MotoristaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_AspNetUsers_LancadoPorId",
                table: "Manutencoes",
                column: "LancadoPorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_AspNetUsers_MotoristaId",
                table: "Manutencoes",
                column: "MotoristaId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_AspNetUsers_LancadoPorId",
                table: "Manutencoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_AspNetUsers_MotoristaId",
                table: "Manutencoes");

            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_LancadoPorId",
                table: "Manutencoes");

            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_MotoristaId",
                table: "Manutencoes");

            migrationBuilder.AddColumn<string>(
                name: "LancadoPor",
                table: "Manutencoes",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NumNotaFiscal",
                table: "Manutencoes",
                type: "text",
                nullable: false,
                defaultValue: "");

            // Volta o login de quem lançou para o texto antigo
            migrationBuilder.Sql("""
                UPDATE "Manutencoes" AS m
                SET "LancadoPor" = u."UserName"
                FROM "AspNetUsers" AS u
                WHERE u."Id" = m."LancadoPorId";
                """);

            migrationBuilder.DropColumn(
                name: "LancadoPorId",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "MotoristaId",
                table: "Manutencoes");
        }
    }
}
