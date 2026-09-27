using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class A : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cpf",
                table: "Tecnicos",
                type: "character varying(14)",
                maxLength: 14,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Cpf",
                table: "Motoristas",
                type: "character varying(14)",
                maxLength: 14,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cpf",
                table: "Tecnicos");

            migrationBuilder.DropColumn(
                name: "Cpf",
                table: "Motoristas");
        }
    }
}
