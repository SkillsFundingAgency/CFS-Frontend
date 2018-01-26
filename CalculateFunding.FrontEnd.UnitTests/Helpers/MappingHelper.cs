using System;
using System.Collections.Generic;
using System.Text;
using AutoMapper;
using CalculateFunding.Frontend.ViewModels;

namespace CalculateFunding.Frontend.Helpers
{
    internal class MappingHelper
    {
        internal static IMapper CreateFrontEndMapper()
        {
            MapperConfiguration mappingConfiguration = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            IMapper mapper = mappingConfiguration.CreateMapper();
            return mapper;
        }
    }
}
