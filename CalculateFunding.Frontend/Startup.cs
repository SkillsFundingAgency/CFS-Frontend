using CalculateFunding.Frontend.Core.Middleware;

namespace CalculateFunding.Frontend
{
    using System;
    using System.IO;
    using System.Threading.Tasks;    
    using Common.Identity.Authorization;
    using Common.Utility;
    using CalculateFunding.Common.Interfaces;
    using Extensions;
    using Helpers;
    using Hubs;
    using Modules;
    using Options;
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
    using Microsoft.Extensions.Hosting;        
    using Microsoft.OpenApi.Models;    
    using Microsoft.FeatureManagement;

    public class Startup
    {
        private IWebHostEnvironment _hostingEnvironment;

        private bool _authenticationEnabled;

        public Startup(IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
        {
            Guard.ArgumentNotNull(configuration, nameof(configuration));
            Guard.ArgumentNotNull(hostingEnvironment, nameof(hostingEnvironment));

            Configuration = configuration;
            _hostingEnvironment = hostingEnvironment;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            bool enablePlatformAuth = Configuration.GetValue<bool>("features:enablePlatformAuth");
                
            services.AddControllers()
                .AddNewtonsoftJson(options => {
                    options.SerializerSettings.ReferenceLoopHandling =
                        Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });

            services.AddRazorPages(options =>
            {
                options.Conventions.ConfigureFilter(new IgnoreAntiforgeryTokenAttribute());
            });

            AzureAdOptions azureAdOptions = new AzureAdOptions();
            Configuration.Bind("AzureAd", azureAdOptions);
            _authenticationEnabled = azureAdOptions.IsEnabled;

            if (enablePlatformAuth)
            {
                services.AddModule<AuthModule>(Configuration, _hostingEnvironment);
            }
            else
            {
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

                    });
                }
                else
                {
                    services.AddAuthorization();

                    services.AddSingleton<IAuthorizationHelper, LocalDevelopmentAuthorizationHelper>();

                    services.AddSingleton<IAuthorizationHandler, AlwaysAllowedForFundingStreamPermissionHandler>();
                    services.AddSingleton<IAuthorizationHandler, AlwaysAllowedForSpecificationPermissionHandler>();

                    services.AddMvc();
                    services.Configure<MvcOptions>(options => options.EnableEndpointRouting = false);
                }
            }

            services.AddAntiforgery(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            });

            services.AddModule<ApiModule>(Configuration, _hostingEnvironment);

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

            services.AddHttpContextAccessor();
            services.AddSingleton<ICancellationTokenProvider, HttpContextCancellationProvider>();

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
            services.Configure<HealthCheckOptions>(Configuration.GetSection("healthCheck"));

            services.AddSignalR(hubOptions =>
            {
                hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(3);
                hubOptions.ClientTimeoutInterval = TimeSpan.FromMinutes(6);
            }).AddAzureSignalR();

            services.AddHsts((options) =>
            {
                options.ExcludedHosts.Add("localhost");
                options.Preload = false;
                options.IncludeSubDomains = true;
                options.MaxAge = new TimeSpan(365, 0, 0, 0, 0);
            });

            services.AddOptions();

            if (IsSwaggerEnabled())
            {
                services.AddSwaggerGen(
                    options =>
                    {
                        options.UseInlineDefinitionsForEnums();
                        options.CustomSchemaIds(x => x.FullName);
                        options.SwaggerDoc("v1", new OpenApiInfo { Title = "Calculations Funding Frontend API", Version = "v1" });
                    });
            }

            services.AddFeatureManagement();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
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
                options.AddRewrite(@"^assets/fonts/(.*)", "app/assets/fonts/$1", false);
                options.AddRewrite("^app$", "app/index.html", true);
                options.AddIISUrlRewrite(iisUrlRewriteStreamReader, true);

                app.UseRewriter(options);
            }

            app.UseStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=3600");
                }
            });

            app.UseRouting();

            if (_authenticationEnabled)
            {
                app.UseAuthentication();
                app.UseAuthorization();
                app.UseMiddleware<SkillsCheckMiddleware>();
            }

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
                endpoints.MapControllers();
                endpoints.MapControllerRoute(
                      name: "default",
                      pattern: "{controller}/{action=Index}/{id?}");
                endpoints.MapHub<Notifications>("/api/notifications");
            });

            if (IsSwaggerEnabled())
            {
                app.UseSwagger();
                app.UseSwaggerUI(
                    options =>
                    {
                        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Calculations Funding Frontend API");
                        options.DocumentTitle = "Calculations Funding - Swagger";
                    });
            }
        }

        private bool IsSwaggerEnabled()
        {
            return Configuration.GetValue("FeatureManagement:EnableSwagger", false);
        }
    }
}
