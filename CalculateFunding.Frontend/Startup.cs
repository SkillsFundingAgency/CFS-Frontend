namespace CalculateFunding.Frontend
{
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Autofac;
    using Autofac.Extensions.DependencyInjection;
    using CalculateFunding.Common.Identity.Authorization;
    using CalculateFunding.Common.Interfaces;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Core.Middleware;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Hubs;
    using CalculateFunding.Frontend.Modules;
    using CalculateFunding.Frontend.Options;
    using Microsoft.AspNetCore.Authentication.Cookies;
    using Microsoft.AspNetCore.Authentication.OpenIdConnect;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Authorization;
    using Microsoft.AspNetCore.Rewrite;
    using Microsoft.AspNetCore.Routing;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    public class Startup
    {
        private IHostingEnvironment _hostingEnvironment;

        private bool _authenticationEnabled;

        public Startup(IConfiguration configuration, IHostingEnvironment hostingEnvironment)
        {
            Guard.ArgumentNotNull(configuration, nameof(configuration));
            Guard.ArgumentNotNull(hostingEnvironment, nameof(hostingEnvironment));

            Configuration = configuration;
            _hostingEnvironment = hostingEnvironment;
        }

        public IConfiguration Configuration { get; }

        public IContainer ApplicationContainer { get; private set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            AzureAdOptions azureAdOptions = new AzureAdOptions();
            Configuration.Bind("AzureAd", azureAdOptions);
            _authenticationEnabled = azureAdOptions.IsEnabled;

            if (_authenticationEnabled)
            {
                services.AddAuthentication(adOptions =>
                {
                    adOptions.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                    adOptions.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
                })
                .AddAzureAd(options => Configuration.Bind("AzureAd", options))
                .AddCookie();

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

                }).SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            }
            else
            {
                services.AddAuthorization();

                services.AddSingleton<IAuthorizationHelper, LocalDevelopmentAuthorizationHelper>();

                services.AddSingleton<IAuthorizationHandler, AlwaysAllowedForFundingStreamPermissionHandler>();
                services.AddSingleton<IAuthorizationHandler, AlwaysAllowedForSpecificationPermissionHandler>();

                services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            }

            services.AddAntiforgery(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            });

            services.AddModule<ApiModule>(Configuration);

            if (!_hostingEnvironment.IsDevelopment())
            {
                services.AddModule<LoggingModule>(Configuration);
            }
            else
            {
                services.AddModule<LocalDevelopmentLoggingModule>(Configuration);
            }

            services.AddModule<ApplicationInsightsModule>(Configuration);

            services.AddModule<MappingModule>(Configuration);
            services.AddModule<ServicesModule>(Configuration);
            services.AddModule<FeaturesModule>(Configuration);

            services.AddHttpContextAccessor();
            services.AddSingleton<ICancellationTokenProvider, HttpContextCancellationProvider>();

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
            services.Configure<HealthCheckOptions>(Configuration.GetSection("healthCheck"));

            services.AddSignalR().AddAzureSignalR();

            ContainerBuilder builder = new ContainerBuilder();

            builder.Populate(services);

            ApplicationContainer = builder.Build();

            services.AddHsts((options) =>
            {
                options.ExcludedHosts.Add("localhost");
                options.Preload = false;
                options.IncludeSubDomains = true;
                options.MaxAge = new TimeSpan(365, 0, 0, 0, 0);
            });

            return new AutofacServiceProvider(ApplicationContainer);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseStatusCodePagesWithReExecute("/errors/{0}");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler(a =>
                {
                    a.Run(ctx =>
                    {
                        ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
                        return Task.CompletedTask;
                    });
                });
            }

            using (StreamReader iisUrlRewriteStreamReader = File.OpenText("spa-url-rewrite.xml"))
            {
                RewriteOptions options = new RewriteOptions();
                options.AddRewrite("^app$", "app/index.html", true);
                options.AddIISUrlRewrite(iisUrlRewriteStreamReader);

                app.UseRewriter(options);
            }

            app.UseStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=3600");
                }
            });

            if (_authenticationEnabled)
            {
                app.UseAuthentication();

                app.UseMiddleware<SkillsCheckMiddleware>();
            }

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseAzureSignalR(routes =>
            {
                routes.MapHub<Notifications>("/api/notifications");
            });
        }
    }
}
