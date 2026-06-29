using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaTecnicosEMotoristas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_AspNetUsers_UsuarioGuid",
                table: "Manutencoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiculos_AspNetUsers_MotoristaGuid",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_Veiculos_MotoristaGuid",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_UsuarioGuid",
                table: "Manutencoes");

            migrationBuilder.AddColumn<long>(
                name: "MotoristaId",
                table: "Veiculos",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "TecnicoId",
                table: "Manutencoes",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Motoristas",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioGuid = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Motoristas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Motoristas_AspNetUsers_UsuarioGuid",
                        column: x => x.UsuarioGuid,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tecnicos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
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

            migrationBuilder.Sql(
                """
                INSERT INTO "Motoristas" ("UsuarioGuid")
                SELECT DISTINCT "MotoristaGuid"
                FROM "Veiculos";

                UPDATE "Veiculos" AS v
                SET "MotoristaId" = m."Id"
                FROM "Motoristas" AS m
                WHERE m."UsuarioGuid" = v."MotoristaGuid";

                INSERT INTO "Tecnicos" ("UsuarioGuid")
                SELECT DISTINCT "UsuarioGuid"
                FROM "Manutencoes";

                UPDATE "Manutencoes" AS ma
                SET "TecnicoId" = t."Id"
                FROM "Tecnicos" AS t
                WHERE t."UsuarioGuid" = ma."UsuarioGuid";
                """);

            migrationBuilder.AlterColumn<long>(
                name: "MotoristaId",
                table: "Veiculos",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "TecnicoId",
                table: "Manutencoes",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "MotoristaGuid",
                table: "Veiculos");

            migrationBuilder.DropColumn(
                name: "UsuarioGuid",
                table: "Manutencoes");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_Chassi",
                table: "Veiculos",
                column: "Chassi",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_MotoristaId",
                table: "Veiculos",
                column: "MotoristaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_Placa",
                table: "Veiculos",
                column: "Placa",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_TecnicoId",
                table: "Manutencoes",
                column: "TecnicoId");

            migrationBuilder.CreateIndex(
                name: "IX_Motoristas_UsuarioGuid",
                table: "Motoristas",
                column: "UsuarioGuid",
                unique: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Veiculos_Motoristas_MotoristaId",
                table: "Veiculos",
                column: "MotoristaId",
                principalTable: "Motoristas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manutencoes_Tecnicos_TecnicoId",
                table: "Manutencoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiculos_Motoristas_MotoristaId",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_Veiculos_Chassi",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_Veiculos_MotoristaId",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_Veiculos_Placa",
                table: "Veiculos");

            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_TecnicoId",
                table: "Manutencoes");

            migrationBuilder.AddColumn<string>(
                name: "MotoristaGuid",
                table: "Veiculos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioGuid",
                table: "Manutencoes",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "Veiculos" AS v
                SET "MotoristaGuid" = m."UsuarioGuid"
                FROM "Motoristas" AS m
                WHERE m."Id" = v."MotoristaId";

                UPDATE "Manutencoes" AS ma
                SET "UsuarioGuid" = t."UsuarioGuid"
                FROM "Tecnicos" AS t
                WHERE t."Id" = ma."TecnicoId";
                """);

            migrationBuilder.AlterColumn<string>(
                name: "MotoristaGuid",
                table: "Veiculos",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UsuarioGuid",
                table: "Manutencoes",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "MotoristaId",
                table: "Veiculos");

            migrationBuilder.DropColumn(
                name: "TecnicoId",
                table: "Manutencoes");

            migrationBuilder.DropTable(
                name: "Motoristas");

            migrationBuilder.DropTable(
                name: "Tecnicos");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_MotoristaGuid",
                table: "Veiculos",
                column: "MotoristaGuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_UsuarioGuid",
                table: "Manutencoes",
                column: "UsuarioGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_AspNetUsers_UsuarioGuid",
                table: "Manutencoes",
                column: "UsuarioGuid",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veiculos_AspNetUsers_MotoristaGuid",
                table: "Veiculos",
                column: "MotoristaGuid",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
