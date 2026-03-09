using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SuspensionDesigner.Core.Interfaces;
using SuspensionDesigner.Infrastructure.Data;
using SuspensionDesigner.Infrastructure.Identity;
using SuspensionDesigner.Infrastructure.Repositories;

namespace SuspensionDesigner.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection") ??
                "Host=localhost;Port=5432;Database=suspension_designer;Username=postgres;Password=postgres"));

        services.AddScoped<ISuspensionDesignRepository, SuspensionDesignRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<JwtTokenService>();

        return services;
    }
}
