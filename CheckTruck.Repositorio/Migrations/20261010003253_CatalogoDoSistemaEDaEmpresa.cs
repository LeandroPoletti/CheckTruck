using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class CatalogoDoSistemaEDaEmpresa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "TiposManutencao",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Potencias",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Paises",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Modelos",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "IntervalosRecomendados",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Geracoes",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "EmpresaId",
                table: "Fabricantes",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "EmpresaId",
                table: "AspNetUsers",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.CreateIndex(
                name: "IX_TiposManutencao_EmpresaId",
                table: "TiposManutencao",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Potencias_EmpresaId",
                table: "Potencias",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Paises_EmpresaId",
                table: "Paises",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Modelos_EmpresaId",
                table: "Modelos",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_IntervalosRecomendados_EmpresaId",
                table: "IntervalosRecomendados",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Geracoes_EmpresaId",
                table: "Geracoes",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Fabricantes_EmpresaId",
                table: "Fabricantes",
                column: "EmpresaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Fabricantes_Empresas_EmpresaId",
                table: "Fabricantes",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Geracoes_Empresas_EmpresaId",
                table: "Geracoes",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_IntervalosRecomendados_Empresas_EmpresaId",
                table: "IntervalosRecomendados",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Modelos_Empresas_EmpresaId",
                table: "Modelos",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Paises_Empresas_EmpresaId",
                table: "Paises",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Potencias_Empresas_EmpresaId",
                table: "Potencias",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TiposManutencao_Empresas_EmpresaId",
                table: "TiposManutencao",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fabricantes_Empresas_EmpresaId",
                table: "Fabricantes");

            migrationBuilder.DropForeignKey(
                name: "FK_Geracoes_Empresas_EmpresaId",
                table: "Geracoes");

            migrationBuilder.DropForeignKey(
                name: "FK_IntervalosRecomendados_Empresas_EmpresaId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropForeignKey(
                name: "FK_Modelos_Empresas_EmpresaId",
                table: "Modelos");

            migrationBuilder.DropForeignKey(
                name: "FK_Paises_Empresas_EmpresaId",
                table: "Paises");

            migrationBuilder.DropForeignKey(
                name: "FK_Potencias_Empresas_EmpresaId",
                table: "Potencias");

            migrationBuilder.DropForeignKey(
                name: "FK_TiposManutencao_Empresas_EmpresaId",
                table: "TiposManutencao");

            migrationBuilder.DropIndex(
                name: "IX_TiposManutencao_EmpresaId",
                table: "TiposManutencao");

            migrationBuilder.DropIndex(
                name: "IX_Potencias_EmpresaId",
                table: "Potencias");

            migrationBuilder.DropIndex(
                name: "IX_Paises_EmpresaId",
                table: "Paises");

            migrationBuilder.DropIndex(
                name: "IX_Modelos_EmpresaId",
                table: "Modelos");

            migrationBuilder.DropIndex(
                name: "IX_IntervalosRecomendados_EmpresaId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropIndex(
                name: "IX_Geracoes_EmpresaId",
                table: "Geracoes");

            migrationBuilder.DropIndex(
                name: "IX_Fabricantes_EmpresaId",
                table: "Fabricantes");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "TiposManutencao");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Potencias");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Paises");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Modelos");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "IntervalosRecomendados");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Geracoes");

            migrationBuilder.DropColumn(
                name: "EmpresaId",
                table: "Fabricantes");

            migrationBuilder.AlterColumn<long>(
                name: "EmpresaId",
                table: "AspNetUsers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);
        }
    }
}
