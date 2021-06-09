using CalculateFunding.Common.Identity.Authentication;
using CalculateFunding.Common.Identity.Authorization;
using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace CalculateFunding.Frontend.Modules
{
    public class AuthModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            AzureAdOptions azureAdOptions = new AzureAdOptions();
            Configuration.Bind("AzureAd", azureAdOptions);

            if (HostingEnvironment.IsDevelopment())
            {
                services.AddAuthorization();

                services.AddSingleton<IAuthorizationHelper, LocalDevelopmentAuthorizationHelper>();

                services.AddSingleton<IAuthorizationHandler, AlwaysAllowedForFundingStreamPermissionHandler>();
                services.AddSingleton<IAuthorizationHandler, AlwaysAllowedForSpecificationPermissionHandler>();

                services.AddMvc();
            }
            else
            {
                services.AddAuthentication(opts =>
                {
                    opts.DefaultAuthenticateScheme = AzureAuthenticationDefaults.AuthenticationScheme;
                    opts.DefaultChallengeScheme = AzureAuthenticationDefaults.AuthenticationScheme;
                })
                .AddAzureAuthentication();

                services.AddAuthorization();

                services.AddSingleton<IAuthorizationHandler, FundingStreamPermissionHandler>();
                services.AddSingleton<IAuthorizationHandler, SpecificationPermissionHandler>();

                services.Configure<PermissionOptions>(options =>
                {
                    Configuration.GetSection("permissionOptions").Bind(options);
                });

                services.AddSingleton<IAuthorizationHelper, AuthorizationHelper>();

                services.AddMvc(config =>
                {
                    AuthorizationPolicy policy = new AuthorizationPolicyBuilder()
                                     .RequireAuthenticatedUser()
                                     .RequireClaim("groups", azureAdOptions.Groups?.Split(","))
                                     .Build();
                    config.Filters.Add(new AuthorizeFilter(policy));
                });
            }
        }
    }
}
