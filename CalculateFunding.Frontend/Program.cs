namespace CalculateFunding.Frontend
{
    using Autofac.Extensions.DependencyInjection;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.Extensions.Configuration;
    using System;

    public static class Program
    {
        private static readonly string AppConfigConnectionString = Environment.GetEnvironmentVariable("AzureConfiguration:ConnectionString");

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var startup = new Startup(builder.Configuration, builder.Environment);
            builder.Host
                .ConfigureAppConfiguration((hostingContext, config) =>
                {
                    if (string.IsNullOrWhiteSpace(AppConfigConnectionString))
                    {
                        return;
                    }
                    var settings = config.Build();
                    config.AddAzureAppConfiguration(options =>
                    {
                        options.Connect(AppConfigConnectionString)
                        .UseFeatureFlags(featureFlagOptions =>
                        {
                            featureFlagOptions.CacheExpirationTime = TimeSpan.FromMinutes(5);
                        });
                    });
                })
                .UseServiceProviderFactory(new AutofacServiceProviderFactory());

            startup.ConfigureServices(builder.Services, builder.Environment);
            var app = builder.Build();
            startup.Configure(app, app.Environment);
            app.Run();
        }
    }
}
