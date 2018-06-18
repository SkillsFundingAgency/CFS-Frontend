namespace CalculateFunding.Frontend
{
    using System;
    using Autofac;
    using Autofac.Extensions.DependencyInjection;
    using CalculateFunding.Frontend.Core.Middleware;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Modules;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
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
            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddModule<ApiModule>(Configuration);

            services.AddModule<ProxiesModule>(Configuration);

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

            services.AddHttpContextAccessor();

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

            var builder = new ContainerBuilder();

            builder.Populate(services);

            ApplicationContainer = builder.Build();

            return new AutofacServiceProvider(ApplicationContainer);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=3600");
                }
            });

            app.UseMiddleware<CorrelationIdMiddleware>();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });
        }
    }
}
