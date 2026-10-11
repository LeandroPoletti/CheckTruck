using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <summary>
    /// A OS passa a ter vários itens e vários mecânicos. A tabela Manutencoes vira OrdensServico com os mesmos
    /// números de OS, e cada OS antiga vira uma OS com 1 item (o tipo, a próxima troca e a 1ª troca dela) e
    /// 1 mecânico. Escrita à mão: o EF apagaria a tabela antiga e criaria outra vazia.
    /// </summary>
    public partial class OrdemServicoComItens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Manutencoes vira OrdensServico (chaves estrangeiras saem e voltam com o nome novo no fim)
            migrationBuilder.DropForeignKey(name: "FK_RegistrosKm_Manutencoes_OrdemServicoId", table: "RegistrosKm");
            migrationBuilder.DropForeignKey(name: "FK_Manutencoes_AspNetUsers_LancadoPorId", table: "Manutencoes");
            migrationBuilder.DropForeignKey(name: "FK_Manutencoes_AspNetUsers_MotoristaId", table: "Manutencoes");
            migrationBuilder.DropForeignKey(name: "FK_Manutencoes_Empresas_EmpresaId", table: "Manutencoes");
            migrationBuilder.DropForeignKey(name: "FK_Manutencoes_Mecanicos_MecanicoId", table: "Manutencoes");
            migrationBuilder.DropForeignKey(name: "FK_Manutencoes_TiposManutencao_TipoManutencaoId", table: "Manutencoes");
            migrationBuilder.DropForeignKey(name: "FK_Manutencoes_Veiculos_VeiculoId", table: "Manutencoes");
            migrationBuilder.DropPrimaryKey(name: "PK_Manutencoes", table: "Manutencoes");

            migrationBuilder.RenameTable(name: "Manutencoes", newName: "OrdensServico");
            migrationBuilder.RenameIndex(name: "IX_Manutencoes_EmpresaId", table: "OrdensServico", newName: "IX_OrdensServico_EmpresaId");
            migrationBuilder.RenameIndex(name: "IX_Manutencoes_LancadoPorId", table: "OrdensServico", newName: "IX_OrdensServico_LancadoPorId");
            migrationBuilder.RenameIndex(name: "IX_Manutencoes_MotoristaId", table: "OrdensServico", newName: "IX_OrdensServico_MotoristaId");
            migrationBuilder.RenameIndex(name: "IX_Manutencoes_VeiculoId", table: "OrdensServico", newName: "IX_OrdensServico_VeiculoId");
            migrationBuilder.AddPrimaryKey(name: "PK_OrdensServico", table: "OrdensServico", column: "Id");

            // 2. Tabelas novas: itens da OS e mecânicos da OS
            migrationBuilder.CreateTable(
                name: "ItensOrdemServico",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrdemServicoId = table.Column<long>(type: "bigint", nullable: false),
                    TipoManutencaoId = table.Column<long>(type: "bigint", nullable: false),
                    KmProximaTroca = table.Column<int>(type: "integer", nullable: false),
                    DataProximaTroca = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsPrimeiraTroca = table.Column<bool>(type: "boolean", nullable: false),
                    EmpresaId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItensOrdemServico", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItensOrdemServico_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItensOrdemServico_OrdensServico_OrdemServicoId",
                        column: x => x.OrdemServicoId,
                        principalTable: "OrdensServico",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItensOrdemServico_TiposManutencao_TipoManutencaoId",
                        column: x => x.TipoManutencaoId,
                        principalTable: "TiposManutencao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrdemServicoMecanico",
                columns: table => new
                {
                    MecanicoId = table.Column<long>(type: "bigint", nullable: false),
                    OrdemServicoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdemServicoMecanico", x => new { x.MecanicoId, x.OrdemServicoId });
                    table.ForeignKey(
                        name: "FK_OrdemServicoMecanico_Mecanicos_MecanicoId",
                        column: x => x.MecanicoId,
                        principalTable: "Mecanicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrdemServicoMecanico_OrdensServico_OrdemServicoId",
                        column: x => x.OrdemServicoId,
                        principalTable: "OrdensServico",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // 3. Cada OS antiga vira 1 item e 1 mecânico
            migrationBuilder.Sql("""
                INSERT INTO "ItensOrdemServico" ("OrdemServicoId", "TipoManutencaoId", "KmProximaTroca", "DataProximaTroca", "IsPrimeiraTroca", "EmpresaId")
                SELECT "Id", "TipoManutencaoId", "KmProximaTroca", "DataProximaTroca", "IsPrimeiraTroca", "EmpresaId"
                FROM "OrdensServico";
                """);
            migrationBuilder.Sql("""
                INSERT INTO "OrdemServicoMecanico" ("MecanicoId", "OrdemServicoId")
                SELECT "MecanicoId", "Id"
                FROM "OrdensServico";
                """);

            // 4. O que agora fica no item sai da OS (o índice de cada coluna sai junto)
            migrationBuilder.DropColumn(name: "MecanicoId", table: "OrdensServico");
            migrationBuilder.DropColumn(name: "TipoManutencaoId", table: "OrdensServico");
            migrationBuilder.DropColumn(name: "KmProximaTroca", table: "OrdensServico");
            migrationBuilder.DropColumn(name: "DataProximaTroca", table: "OrdensServico");
            migrationBuilder.DropColumn(name: "IsPrimeiraTroca", table: "OrdensServico");

            migrationBuilder.CreateIndex(
                name: "IX_ItensOrdemServico_EmpresaId",
                table: "ItensOrdemServico",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensOrdemServico_OrdemServicoId_TipoManutencaoId",
                table: "ItensOrdemServico",
                columns: new[] { "OrdemServicoId", "TipoManutencaoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItensOrdemServico_TipoManutencaoId",
                table: "ItensOrdemServico",
                column: "TipoManutencaoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdemServicoMecanico_OrdemServicoId",
                table: "OrdemServicoMecanico",
                column: "OrdemServicoId");

            // 5. As chaves estrangeiras voltam com o nome novo
            migrationBuilder.AddForeignKey(
                name: "FK_OrdensServico_AspNetUsers_LancadoPorId",
                table: "OrdensServico",
                column: "LancadoPorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrdensServico_AspNetUsers_MotoristaId",
                table: "OrdensServico",
                column: "MotoristaId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrdensServico_Empresas_EmpresaId",
                table: "OrdensServico",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrdensServico_Veiculos_VeiculoId",
                table: "OrdensServico",
                column: "VeiculoId",
                principalTable: "Veiculos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosKm_OrdensServico_OrdemServicoId",
                table: "RegistrosKm",
                column: "OrdemServicoId",
                principalTable: "OrdensServico",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <summary>
        /// Volta para uma OS = um item e um mecânico. OS com vários itens ou mecânicos ficam só com o primeiro
        /// (os outros se perdem).
        /// </summary>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_RegistrosKm_OrdensServico_OrdemServicoId", table: "RegistrosKm");
            migrationBuilder.DropForeignKey(name: "FK_OrdensServico_AspNetUsers_LancadoPorId", table: "OrdensServico");
            migrationBuilder.DropForeignKey(name: "FK_OrdensServico_AspNetUsers_MotoristaId", table: "OrdensServico");
            migrationBuilder.DropForeignKey(name: "FK_OrdensServico_Empresas_EmpresaId", table: "OrdensServico");
            migrationBuilder.DropForeignKey(name: "FK_OrdensServico_Veiculos_VeiculoId", table: "OrdensServico");
            migrationBuilder.DropPrimaryKey(name: "PK_OrdensServico", table: "OrdensServico");

            migrationBuilder.RenameTable(name: "OrdensServico", newName: "Manutencoes");
            migrationBuilder.RenameIndex(name: "IX_OrdensServico_EmpresaId", table: "Manutencoes", newName: "IX_Manutencoes_EmpresaId");
            migrationBuilder.RenameIndex(name: "IX_OrdensServico_LancadoPorId", table: "Manutencoes", newName: "IX_Manutencoes_LancadoPorId");
            migrationBuilder.RenameIndex(name: "IX_OrdensServico_MotoristaId", table: "Manutencoes", newName: "IX_Manutencoes_MotoristaId");
            migrationBuilder.RenameIndex(name: "IX_OrdensServico_VeiculoId", table: "Manutencoes", newName: "IX_Manutencoes_VeiculoId");
            migrationBuilder.AddPrimaryKey(name: "PK_Manutencoes", table: "Manutencoes", column: "Id");

            migrationBuilder.AddColumn<long>(name: "MecanicoId", table: "Manutencoes", type: "bigint", nullable: false, defaultValue: 0L);
            migrationBuilder.AddColumn<long>(name: "TipoManutencaoId", table: "Manutencoes", type: "bigint", nullable: false, defaultValue: 0L);
            migrationBuilder.AddColumn<int>(name: "KmProximaTroca", table: "Manutencoes", type: "integer", nullable: false, defaultValue: 0);
            migrationBuilder.AddColumn<DateTime>(name: "DataProximaTroca", table: "Manutencoes", type: "timestamp with time zone", nullable: true);
            migrationBuilder.AddColumn<bool>(name: "IsPrimeiraTroca", table: "Manutencoes", type: "boolean", nullable: false, defaultValue: false);

            migrationBuilder.Sql("""
                UPDATE "Manutencoes" AS m
                SET "TipoManutencaoId" = i."TipoManutencaoId", "KmProximaTroca" = i."KmProximaTroca",
                    "DataProximaTroca" = i."DataProximaTroca", "IsPrimeiraTroca" = i."IsPrimeiraTroca"
                FROM (SELECT DISTINCT ON ("OrdemServicoId") * FROM "ItensOrdemServico" ORDER BY "OrdemServicoId", "Id") AS i
                WHERE i."OrdemServicoId" = m."Id";
                """);
            migrationBuilder.Sql("""
                UPDATE "Manutencoes" AS m
                SET "MecanicoId" = x."MecanicoId"
                FROM (SELECT "OrdemServicoId", MIN("MecanicoId") AS "MecanicoId" FROM "OrdemServicoMecanico" GROUP BY "OrdemServicoId") AS x
                WHERE x."OrdemServicoId" = m."Id";
                """);

            migrationBuilder.DropTable(name: "ItensOrdemServico");
            migrationBuilder.DropTable(name: "OrdemServicoMecanico");

            migrationBuilder.CreateIndex(name: "IX_Manutencoes_MecanicoId", table: "Manutencoes", column: "MecanicoId");
            migrationBuilder.CreateIndex(name: "IX_Manutencoes_TipoManutencaoId", table: "Manutencoes", column: "TipoManutencaoId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_Empresas_EmpresaId",
                table: "Manutencoes",
                column: "EmpresaId",
                principalTable: "Empresas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_Mecanicos_MecanicoId",
                table: "Manutencoes",
                column: "MecanicoId",
                principalTable: "Mecanicos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_TiposManutencao_TipoManutencaoId",
                table: "Manutencoes",
                column: "TipoManutencaoId",
                principalTable: "TiposManutencao",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Manutencoes_Veiculos_VeiculoId",
                table: "Manutencoes",
                column: "VeiculoId",
                principalTable: "Veiculos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosKm_Manutencoes_OrdemServicoId",
                table: "RegistrosKm",
                column: "OrdemServicoId",
                principalTable: "Manutencoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
