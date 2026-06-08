using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CertifyChain.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddQualificationTypeAndAwardClassToProgram : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AwardClass",
                table: "Programs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QualificationType",
                table: "Programs",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwardClass",
                table: "Programs");

            migrationBuilder.DropColumn(
                name: "QualificationType",
                table: "Programs");
        }
    }
}
