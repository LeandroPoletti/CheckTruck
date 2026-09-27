using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class CatalogoSemCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fabricantes_Paises_PaisOrigemId",
                table: "Fabricantes");

            migrationBuilder.DropForeignKey(
                name: "FK_GeracaoModelos_Fabricantes_FabricanteId",
                table: "GeracaoModelos");

            migrationBuilder.DropForeignKey(
                name: "FK_IntervalosRecomendados_Modelos_ModeloId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropForeignKey(
                name: "FK_Modelos_GeracaoModelos_GeracaoId",
                table: "Modelos");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiculos_Modelos_ModeloId",
                table: "Veiculos");

            migrationBuilder.AddForeignKey(
                name: "FK_Fabricantes_Paises_PaisOrigemId",
                table: "Fabricantes",
                column: "PaisOrigemId",
                principalTable: "Paises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GeracaoModelos_Fabricantes_FabricanteId",
                table: "GeracaoModelos",
                column: "FabricanteId",
                principalTable: "Fabricantes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fabricantes_Paises_PaisOrigemId",
                table: "Fabricantes");

            migrationBuilder.DropForeignKey(
                name: "FK_GeracaoModelos_Fabricantes_FabricanteId",
                table: "GeracaoModelos");

            migrationBuilder.DropForeignKey(
                name: "FK_IntervalosRecomendados_Modelos_ModeloId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropForeignKey(
                name: "FK_Modelos_GeracaoModelos_GeracaoId",
                table: "Modelos");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiculos_Modelos_ModeloId",
                table: "Veiculos");

            migrationBuilder.AddForeignKey(
                name: "FK_Fabricantes_Paises_PaisOrigemId",
                table: "Fabricantes",
                column: "PaisOrigemId",
                principalTable: "Paises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GeracaoModelos_Fabricantes_FabricanteId",
                table: "GeracaoModelos",
                column: "FabricanteId",
                principalTable: "Fabricantes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_IntervalosRecomendados_Modelos_ModeloId",
                table: "IntervalosRecomendados",
                column: "ModeloId",
                principalTable: "Modelos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Modelos_GeracaoModelos_GeracaoId",
                table: "Modelos",
                column: "GeracaoId",
                principalTable: "GeracaoModelos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Veiculos_Modelos_ModeloId",
                table: "Veiculos",
                column: "ModeloId",
                principalTable: "Modelos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
