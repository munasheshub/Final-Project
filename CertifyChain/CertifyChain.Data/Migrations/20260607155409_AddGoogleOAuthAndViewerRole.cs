using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CertifyChain.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleOAuthAndViewerRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiDetectionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CertificateHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    InstitutionId = table.Column<int>(type: "int", nullable: false),
                    FraudProbability = table.Column<double>(type: "float", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Verdict = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ForgeryType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InferenceMs = table.Column<int>(type: "int", nullable: false),
                    HandcraftedFeaturesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewOutcome = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ReviewNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiDetectionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiDetectionLogs_Institutions_InstitutionId",
                        column: x => x.InstitutionId,
                        principalTable: "Institutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AiDetectionLogs_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AiDetectionLogs_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiDetectionLogs_CreatedAt",
                table: "AiDetectionLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AiDetectionLogs_InstitutionId",
                table: "AiDetectionLogs",
                column: "InstitutionId");

            migrationBuilder.CreateIndex(
                name: "IX_AiDetectionLogs_ReviewedByUserId",
                table: "AiDetectionLogs",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AiDetectionLogs_ReviewOutcome",
                table: "AiDetectionLogs",
                column: "ReviewOutcome");

            migrationBuilder.CreateIndex(
                name: "IX_AiDetectionLogs_StudentId",
                table: "AiDetectionLogs",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_AiDetectionLogs_TenantId",
                table: "AiDetectionLogs",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiDetectionLogs");
        }
    }
}
