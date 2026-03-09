using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuspensionDesigner.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SuspensionDesigns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    SuspensionType = table.Column<int>(type: "integer", nullable: false),
                    AxlePosition = table.Column<int>(type: "integer", nullable: false),
                    TrackWidth = table.Column<double>(type: "double precision", nullable: false),
                    Wheelbase = table.Column<double>(type: "double precision", nullable: false),
                    SprungMass = table.Column<double>(type: "double precision", nullable: false),
                    UnsprungMass = table.Column<double>(type: "double precision", nullable: false),
                    SpringRate = table.Column<double>(type: "double precision", nullable: false),
                    DampingCoefficient = table.Column<double>(type: "double precision", nullable: false),
                    RideHeight = table.Column<double>(type: "double precision", nullable: false),
                    TireRadius = table.Column<double>(type: "double precision", nullable: false),
                    CgHeight = table.Column<double>(type: "double precision", nullable: false),
                    FrontBrakeProportion = table.Column<double>(type: "double precision", nullable: false),
                    UserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LowerBallJoint_X = table.Column<double>(type: "double precision", nullable: false),
                    LowerBallJoint_Y = table.Column<double>(type: "double precision", nullable: false),
                    LowerBallJoint_Z = table.Column<double>(type: "double precision", nullable: false),
                    LowerWishboneFrontPivot_X = table.Column<double>(type: "double precision", nullable: false),
                    LowerWishboneFrontPivot_Y = table.Column<double>(type: "double precision", nullable: false),
                    LowerWishboneFrontPivot_Z = table.Column<double>(type: "double precision", nullable: false),
                    LowerWishboneRearPivot_X = table.Column<double>(type: "double precision", nullable: false),
                    LowerWishboneRearPivot_Y = table.Column<double>(type: "double precision", nullable: false),
                    LowerWishboneRearPivot_Z = table.Column<double>(type: "double precision", nullable: false),
                    PushrodRockerEnd_X = table.Column<double>(type: "double precision", nullable: false),
                    PushrodRockerEnd_Y = table.Column<double>(type: "double precision", nullable: false),
                    PushrodRockerEnd_Z = table.Column<double>(type: "double precision", nullable: false),
                    PushrodWheelEnd_X = table.Column<double>(type: "double precision", nullable: false),
                    PushrodWheelEnd_Y = table.Column<double>(type: "double precision", nullable: false),
                    PushrodWheelEnd_Z = table.Column<double>(type: "double precision", nullable: false),
                    SpringDamperLower_X = table.Column<double>(type: "double precision", nullable: false),
                    SpringDamperLower_Y = table.Column<double>(type: "double precision", nullable: false),
                    SpringDamperLower_Z = table.Column<double>(type: "double precision", nullable: false),
                    SpringDamperUpper_X = table.Column<double>(type: "double precision", nullable: false),
                    SpringDamperUpper_Y = table.Column<double>(type: "double precision", nullable: false),
                    SpringDamperUpper_Z = table.Column<double>(type: "double precision", nullable: false),
                    TieRodInner_X = table.Column<double>(type: "double precision", nullable: false),
                    TieRodInner_Y = table.Column<double>(type: "double precision", nullable: false),
                    TieRodInner_Z = table.Column<double>(type: "double precision", nullable: false),
                    TieRodOuter_X = table.Column<double>(type: "double precision", nullable: false),
                    TieRodOuter_Y = table.Column<double>(type: "double precision", nullable: false),
                    TieRodOuter_Z = table.Column<double>(type: "double precision", nullable: false),
                    UpperBallJoint_X = table.Column<double>(type: "double precision", nullable: false),
                    UpperBallJoint_Y = table.Column<double>(type: "double precision", nullable: false),
                    UpperBallJoint_Z = table.Column<double>(type: "double precision", nullable: false),
                    UpperWishboneFrontPivot_X = table.Column<double>(type: "double precision", nullable: false),
                    UpperWishboneFrontPivot_Y = table.Column<double>(type: "double precision", nullable: false),
                    UpperWishboneFrontPivot_Z = table.Column<double>(type: "double precision", nullable: false),
                    UpperWishboneRearPivot_X = table.Column<double>(type: "double precision", nullable: false),
                    UpperWishboneRearPivot_Y = table.Column<double>(type: "double precision", nullable: false),
                    UpperWishboneRearPivot_Z = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuspensionDesigns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SuspensionDesigns_UserId",
                table: "SuspensionDesigns",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SuspensionDesigns");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
