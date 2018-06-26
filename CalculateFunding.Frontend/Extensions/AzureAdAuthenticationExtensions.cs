using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Options;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System;

namespace CalculateFunding.Frontend.Extensions
{
    public static class AzureAdAuthenticationExtensions
    {
        public static AuthenticationBuilder AddAzureAd(this AuthenticationBuilder builder)
            => builder.AddAzureAd(_ => { });

        public static AuthenticationBuilder AddAzureAd(this AuthenticationBuilder builder, Action<AzureAdOptions> configureOptions)
        {
            builder.Services.Configure(configureOptions);
            builder.Services.AddSingleton<IConfigureOptions<OpenIdConnectOptions>, ConfigureAzureOptions>();
            builder.AddOpenIdConnect();
            return builder;
        }

        private class ConfigureAzureOptions : IConfigureNamedOptions<OpenIdConnectOptions>
        {
            private readonly AzureAdOptions _azureOptions;

            public ConfigureAzureOptions(IOptions<AzureAdOptions> azureOptions)
            {
                if(azureOptions.Value != null)
                    _azureOptions = azureOptions.Value;
            }

            public void Configure(string name, OpenIdConnectOptions options)
            {
                Guard.IsNullOrWhiteSpace(_azureOptions.ClientId, nameof(_azureOptions.ClientId));
                Guard.IsNullOrWhiteSpace(_azureOptions.Instance, nameof(_azureOptions.Instance));
                Guard.IsNullOrWhiteSpace(_azureOptions.TenantId, nameof(_azureOptions.TenantId));
                Guard.IsNullOrWhiteSpace(_azureOptions.CallbackPath, nameof(_azureOptions.CallbackPath));

                options.ClientId = _azureOptions.ClientId;
                options.Authority = $"{_azureOptions.Instance}{_azureOptions.TenantId}";
                options.UseTokenLifetime = true;
                options.CallbackPath = _azureOptions.CallbackPath;
                options.RequireHttpsMetadata = true;
            }

            public void Configure(OpenIdConnectOptions options)
            {
                Configure(Microsoft.Extensions.Options.Options.DefaultName, options);
            }
        }
    }
}
