using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class MecanicoNaManutencao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_Tecnicos_TecnicoId",
                table: "Manutencoes");

            migrationBuilder.DropTable(
                name: "Tecnicos");

            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_TecnicoId",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "TecnicoId",
                table: "Manutencoes");

            migrationBuilder.AlterColumn<string>(
                name: "Observacao",
                table: "Manutencoes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Concessionaria",
                table: "Manutencoes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "LancadoPor",
                table: "Manutencoes",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Mecanico",
                table: "Manutencoes",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Mecanicos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioGuid = table.Column<string>(type: "text", nullable: false),
                    Cpf = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mecanicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mecanicos_AspNetUsers_UsuarioGuid",
                        column: x => x.UsuarioGuid,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Mecanicos_UsuarioGuid",
                table: "Mecanicos",
                column: "UsuarioGuid",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Mecanicos");

            migrationBuilder.DropColumn(
                name: "LancadoPor",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "Mecanico",
                table: "Manutencoes");

            migrationBuilder.AlterColumn<string>(
                name: "Observacao",
                table: "Manutencoes",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Concessionaria",
                table: "Manutencoes",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "TecnicoId",
                table: "Manutencoes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "Tecnicos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Cpf = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    UsuarioGuid = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tecnicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tecnicos_AspNetUsers_UsuarioGuid",
                        column: x => x.UsuarioGuid,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_TecnicoId",
                table: "Manutencoes",
                column: "TecnicoId");

            migrationBuilder.CreateIndex(
                name: "IX_Tecnicos_UsuarioGuid",
                table: "Tecnicos",
                column: "UsuarioGuid",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_Tecnicos_TecnicoId",
                table: "Manutencoes",
                column: "TecnicoId",
                principalTable: "Tecnicos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
