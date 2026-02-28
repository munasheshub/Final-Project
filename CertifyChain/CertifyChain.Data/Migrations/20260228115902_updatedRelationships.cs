using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CertifyChain.Data.Migrations
{
    /// <inheritdoc />
    public partial class updatedRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_Institutions_InstitutionId",
                table: "Certificates");

            migrationBuilder.DropForeignKey(
                name: "FK_Programs_Institutions_InstitutionId",
                table: "Programs");

            migrationBuilder.DropIndex(
                name: "IX_Programs_InstitutionId",
                table: "Programs");

            migrationBuilder.DropColumn(
                name: "InstitutionId",
                table: "Programs");

            migrationBuilder.RenameColumn(
                name: "InstitutionId",
                table: "Certificates",
                newName: "ProgramId");

            migrationBuilder.RenameIndex(
                name: "IX_Certificates_InstitutionId",
                table: "Certificates",
                newName: "IX_Certificates_ProgramId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_Programs_ProgramId",
                table: "Certificates",
                column: "ProgramId",
                principalTable: "Programs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_Programs_ProgramId",
                table: "Certificates");

            migrationBuilder.RenameColumn(
                name: "ProgramId",
                table: "Certificates",
                newName: "InstitutionId");

            migrationBuilder.RenameIndex(
                name: "IX_Certificates_ProgramId",
                table: "Certificates",
                newName: "IX_Certificates_InstitutionId");

            migrationBuilder.AddColumn<int>(
                name: "InstitutionId",
                table: "Programs",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Programs_InstitutionId",
                table: "Programs",
                column: "InstitutionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_Institutions_InstitutionId",
                table: "Certificates",
                column: "InstitutionId",
                principalTable: "Institutions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Programs_Institutions_InstitutionId",
                table: "Programs",
                column: "InstitutionId",
                principalTable: "Institutions",
                principalColumn: "Id");
        }
    }
}
