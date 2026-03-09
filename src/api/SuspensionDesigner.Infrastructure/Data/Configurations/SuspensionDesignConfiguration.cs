using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SuspensionDesigner.Core.Entities;

namespace SuspensionDesigner.Infrastructure.Data.Configurations;

public class SuspensionDesignConfiguration : IEntityTypeConfiguration<SuspensionDesign>
{
    public void Configure(EntityTypeBuilder<SuspensionDesign> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.UserId).HasMaxLength(450);

        ConfigurePoint3D(builder, e => e.UpperWishboneFrontPivot, "UpperWishboneFrontPivot");
        ConfigurePoint3D(builder, e => e.UpperWishboneRearPivot, "UpperWishboneRearPivot");
        ConfigurePoint3D(builder, e => e.UpperBallJoint, "UpperBallJoint");
        ConfigurePoint3D(builder, e => e.LowerWishboneFrontPivot, "LowerWishboneFrontPivot");
        ConfigurePoint3D(builder, e => e.LowerWishboneRearPivot, "LowerWishboneRearPivot");
        ConfigurePoint3D(builder, e => e.LowerBallJoint, "LowerBallJoint");
        ConfigurePoint3D(builder, e => e.TieRodInner, "TieRodInner");
        ConfigurePoint3D(builder, e => e.TieRodOuter, "TieRodOuter");
        ConfigurePoint3D(builder, e => e.SpringDamperUpper, "SpringDamperUpper");
        ConfigurePoint3D(builder, e => e.SpringDamperLower, "SpringDamperLower");
        ConfigurePoint3D(builder, e => e.PushrodWheelEnd, "PushrodWheelEnd");
        ConfigurePoint3D(builder, e => e.PushrodRockerEnd, "PushrodRockerEnd");

        builder.HasIndex(e => e.UserId);
    }

    private static void ConfigurePoint3D(
        EntityTypeBuilder<SuspensionDesign> builder,
        System.Linq.Expressions.Expression<Func<SuspensionDesign, Core.ValueObjects.Point3D>> navigation,
        string prefix)
    {
        builder.ComplexProperty(navigation, p =>
        {
            p.Property(pt => pt.X).HasColumnName($"{prefix}_X");
            p.Property(pt => pt.Y).HasColumnName($"{prefix}_Y");
            p.Property(pt => pt.Z).HasColumnName($"{prefix}_Z");
        });
    }
}
