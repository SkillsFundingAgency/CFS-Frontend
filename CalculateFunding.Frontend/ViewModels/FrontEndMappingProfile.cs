namespace CalculateFunding.Frontend.ViewModels
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using CalculateFunding.Frontend.ViewModels.Results;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using CalculateFunding.Frontend.ViewModels.TestEngine;

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
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<CreateSubPolicyViewModel, CreateSubPolicyModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<CreateCalculationViewModel, CreateCalculationModel>()
               .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<Clients.CalcsClient.Models.Calculation, CalculationEditViewModel>();
            CreateMap<Clients.CalcsClient.Models.Calculation, CalculationViewModel>()
                .ForMember(m => m.Description, opt => opt.Ignore());

            CreateMap<CalculationUpdateViewModel, CalculationUpdateModel>();

            CreateMap<CalculationSearchResultItem, CalculationSearchResultItemViewModel>();
            CreateMap<DatasetSearchResultItem, DatasetSearchResultItemViewModel>()
                .ForMember(m => m.LastUpdatedDisplay, opt => opt.Ignore())
                .AfterMap((DatasetSearchResultItem source, DatasetSearchResultItemViewModel destination) =>
                {
                    destination.LastUpdatedDisplay = source.LastUpdated.ToString(FormatStrings.DateTimeFormatString);
                });

            CreateMap<AssignDatasetSchemaViewModel, AssignDatasetSchemaModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());
            CreateMap<DatasetDefinition, DatasetSchemaViewModel>();

            CreateMap<ProviderSearchResultItem, ProviderSearchResultItemViewModel>()
             .ForMember(m => m.ConvertDate, opt => opt.Ignore())
             .ForMember(m => m.LocalAuthorityChangeDate, opt => opt.Ignore())
             .ForMember(m => m.PreviousLocalAuthority, opt => opt.Ignore())
             .ForMember(m => m.DateClosed, opt => opt.Ignore());

            this.MapCommon();
            this.MapScenario();
            this.MapTestEngine();
        }

        private void MapTestEngine()
        {
            this.CreateMap<ScenarioCompileViewModel, ScenarioCompileModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());
        }

        private void MapScenario()
        {
            CreateMap<ScenarioSearchResultItem, ScenarioSearchResultItemViewModel>()
                 .ForMember(m => m.LastUpdatedDisplay, opt => opt.Ignore())
                 .AfterMap((ScenarioSearchResultItem source, ScenarioSearchResultItemViewModel destination) =>
                 {
                     destination.LastUpdatedDisplay = source.LastUpdated.ToString(FormatStrings.DateTimeFormatString);
                 });

            this.CreateMap<ScenarioCreateViewModel, CreateScenarioModel>()
                    .ForMember(m => m.SpecificationId, opt => opt.Ignore());
        }

        private void MapCommon()
        {
            CreateMap<SearchFacet, SearchFacetViewModel>();
            CreateMap<SearchFacetValue, SearchFacetValueViewModel>();
            CreateMap<Reference, ReferenceViewModel>();
        }
    }
}
