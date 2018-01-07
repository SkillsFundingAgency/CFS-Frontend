using AutoMapper;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ViewModels.Specs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ViewModels
{
    public class FrontEndMappingProfile : Profile
    {
        public FrontEndMappingProfile()
        {
            CreateMap<CreateSpecificationViewModel, Specification>();
            CreateMap<Specification, ViewSpecificationViewModel>();
        }
    }
}
