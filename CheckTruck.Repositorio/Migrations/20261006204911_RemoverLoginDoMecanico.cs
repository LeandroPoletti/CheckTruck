using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class RemoverLoginDoMecanico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mecanicos_AspNetUsers_UsuarioGuid",
                table: "Mecanicos");

            migrationBuilder.DropIndex(
                name: "IX_Mecanicos_UsuarioGuid",
                table: "Mecanicos");

            migrationBuilder.DropColumn(
                name: "UsuarioGuid",
                table: "Mecanicos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UsuarioGuid",
                table: "Mecanicos",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mecanicos_UsuarioGuid",
                table: "Mecanicos",
                column: "UsuarioGuid",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Mecanicos_AspNetUsers_UsuarioGuid",
                table: "Mecanicos",
                column: "UsuarioGuid",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
