using Microsoft.EntityFrameworkCore;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.Interfaces;

namespace SuspensionDesigner.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<SuspensionDesign> SuspensionDesigns => Set<SuspensionDesign>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
