namespace CalculateFunding.Frontend
{
    using System;
    using System.Threading.Tasks;
    using Autofac;
    using Autofac.Extensions.DependencyInjection;
    using CalculateFunding.Common.ApiClient.Interfaces;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Core.Middleware;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Modules;
    using CalculateFunding.Frontend.Options;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Routing;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    public class Startup
    {
        private IHostingEnvironment _hostingEnvironment;

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
            services.AddModule<AuthModule>(Configuration, _hostingEnvironment);

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

            services.AddModule<MappingModule>(Configuration);
            services.AddModule<ServicesModule>(Configuration);
            services.AddModule<FeaturesModule>(Configuration);

            services.AddHttpContextAccessor();
            services.AddSingleton<ICancellationTokenProvider, HttpContextCancellationProvider>();

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
            services.Configure<HealthCheckOptions>(Configuration.GetSection("healthCheck"));

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

                app.UseAuthentication();

                app.UseMiddleware<SkillsCheckMiddleware>();
            }

            app.UseStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=3600");
                }
            });
            
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });
        }
    }
}
