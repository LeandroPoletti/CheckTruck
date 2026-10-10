using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class ContaFrotaOuAutonomo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Documento",
                table: "Empresas",
                type: "character varying(14)",
                maxLength: 14,
                nullable: true);

            // As empresas que já existem (a do TCC) são Frota (1). Depois a API sempre grava o tipo
            migrationBuilder.AddColumn<int>(
                name: "TipoConta",
                table: "Empresas",
                type: "integer",
                nullable: false,
                defaultValue: 1);
            migrationBuilder.Sql("ALTER TABLE \"Empresas\" ALTER COLUMN \"TipoConta\" DROP DEFAULT;");

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_Documento",
                table: "Empresas",
                column: "Documento",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Empresas_Documento",
                table: "Empresas");

            migrationBuilder.DropColumn(
                name: "Documento",
                table: "Empresas");

            migrationBuilder.DropColumn(
                name: "TipoConta",
                table: "Empresas");
        }
    }
}
