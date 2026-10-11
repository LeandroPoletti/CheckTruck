using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckTruck.Repositorio.Migrations
{
    /// <inheritdoc />
    public partial class LimitesDeTextoERenavamOpcional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Renavam virou opcional e tem 11 números. Antes de mudar a coluna: tira ponto e traço, e o que
            // ficar vazio (era o que a tela gravava) ou sem 11 números vira "sem Renavam"
            migrationBuilder.Sql("ALTER TABLE \"Veiculos\" ALTER COLUMN \"Renavam\" DROP NOT NULL;");
            migrationBuilder.Sql("UPDATE \"Veiculos\" SET \"Renavam\" = REGEXP_REPLACE(\"Renavam\", '[^0-9]', '', 'g');");
            migrationBuilder.Sql("UPDATE \"Veiculos\" SET \"Renavam\" = NULL WHERE LENGTH(\"Renavam\") <> 11;");

            migrationBuilder.AlterColumn<string>(
                name: "Renavam",
                table: "Veiculos",
                type: "character varying(11)",
                maxLength: 11,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Placa",
                table: "Veiculos",
                type: "character varying(8)",
                maxLength: 8,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "TiposManutencao",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Observacao",
                table: "Manutencoes",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Concessionaria",
                table: "Manutencoes",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacao",
                table: "IntervalosVeiculo",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacao",
                table: "IntervalosRecomendados",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Fonte",
                table: "IntervalosRecomendados",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Volta a ser obrigatório: quem está sem Renavam fica com vazio
            migrationBuilder.Sql("UPDATE \"Veiculos\" SET \"Renavam\" = '' WHERE \"Renavam\" IS NULL;");

            migrationBuilder.AlterColumn<string>(
                name: "Renavam",
                table: "Veiculos",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(11)",
                oldMaxLength: 11,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Placa",
                table: "Veiculos",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(8)",
                oldMaxLength: 8);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "TiposManutencao",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Observacao",
                table: "Manutencoes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Concessionaria",
                table: "Manutencoes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacao",
                table: "IntervalosVeiculo",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacao",
                table: "IntervalosRecomendados",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Fonte",
                table: "IntervalosRecomendados",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);
        }
    }
}
