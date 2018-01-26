using AutoMapper;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Clients.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Specs;

namespace CalculateFunding.Frontend.ViewModels
{
    public class FrontEndMappingProfile : Profile
    {
        public FrontEndMappingProfile()
        {
            CreateMap<CreateSpecificationViewModel, Specification>()
                .ForMember(m => m.Id, opt => opt.Ignore())
                .ForMember(m => m.AcademicYear, opt => opt.Ignore())
                .ForMember(m => m.FundingStream, opt => opt.Ignore())
                .ForMember(m => m.Policies, opt => opt.Ignore());

            CreateMap<CreateSpecificationViewModel, CreateSpecificationModel>()
                .ForMember(m => m.AcademicYearId, opt => opt.Ignore());

            CreateMap<CreatePolicyViewModel, CreatePolicyModel>()
                .ForMember(m => m.SpecificationId , opt => opt.Ignore());

            CreateMap<CreateSubPolicyViewModel, CreateSubPolicyModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<CreateCalculationViewModel, CreateCalculationModel>()
               .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<Clients.CalcsClient.Models.Calculation, CalculationEditViewModel>();
            CreateMap<Clients.CalcsClient.Models.Calculation, CalculationViewModel>()
                .ForMember(m => m.Description, opt => opt.Ignore());

            CreateMap<CalculationUpdateViewModel, CalculationUpdateModel>();

            CreateMap<Reference, ReferenceViewModel>();
        }
    }
}
