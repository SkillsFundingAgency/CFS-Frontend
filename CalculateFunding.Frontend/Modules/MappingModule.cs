using AutoMapper;
using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.ViewModels;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Modules
{
    public class MappingModule : ServiceCollectionModuleBase
    {
        override public void Configure(IServiceCollection services)
        {
            MapperConfiguration config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            services
                 .AddSingleton<IMapper>(config.CreateMapper());
        }
    }
}
