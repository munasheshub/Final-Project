using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CertifyChain.Data.Migrations
{
    /// <inheritdoc />
    public partial class addedGasUsedAndVerificationType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VerifierType",
                table: "VerificationLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "GasUsed",
                table: "Certificates",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VerifierType",
                table: "VerificationLogs");

            migrationBuilder.DropColumn(
                name: "GasUsed",
                table: "Certificates");
        }
    }
}
