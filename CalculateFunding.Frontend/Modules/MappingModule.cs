namespace CalculateFunding.Frontend.Modules
{
    using AutoMapper;
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.ViewModels;
    using Microsoft.Extensions.DependencyInjection;

    public class MappingModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            MapperConfiguration config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            services
                 .AddSingleton<IMapper>(config.CreateMapper());
        }
    }
}
