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
            this.MapCommon();
            this.MapDatasets();
            this.MapResults();
            this.MapSpecs();
            this.MapCalcs();
            this.MapScenario();
            this.MapTestEngine();
        }

        private void MapResults()
        {
            CreateMap<ProviderSearchResultItem, ProviderSearchResultItemViewModel>()
                        .ForMember(m => m.ConvertDate, opt => opt.Ignore())
                        .ForMember(m => m.LocalAuthorityChangeDate, opt => opt.Ignore())
                        .ForMember(m => m.PreviousLocalAuthority, opt => opt.Ignore())
                        .ForMember(m => m.DateClosed, opt => opt.Ignore());

            CreateMap<ProviderTestSearchResultItem, ProviderTestSearchResultItemViewModel>()
               .ForMember(m => m.ConvertDate, opt => opt.Ignore())
               .ForMember(m => m.LocalAuthorityChangeDate, opt => opt.Ignore())
               .ForMember(m => m.PreviousLocalAuthority, opt => opt.Ignore())
               .ForMember(m => m.DateClosed, opt => opt.Ignore());
        }

        private void MapCalcs()
        {
            CreateMap<Clients.CalcsClient.Models.Calculation, CalculationEditViewModel>();
            CreateMap<Clients.CalcsClient.Models.Calculation, Calculations.CalculationViewModel>()
                .ForMember(m => m.Description, opt => opt.Ignore());

            CreateMap<CalculationUpdateViewModel, CalculationUpdateModel>();
            CreateMap<CalculationSearchResultItem, CalculationSearchResultItemViewModel>();
        }

        private void MapSpecs()
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

            CreateMap<Specification, SpecificationViewModel>();

            CreateMap<Policy, PolicyViewModel>();

            CreateMap<SpecificationSummary, SpecificationSummaryViewModel>();

            CreateMap<Clients.SpecsClient.Models.Calculation, Specs.CalculationViewModel>();
        }

        private void MapDatasets()
        {
            CreateMap<DatasetSearchResultItem, DatasetSearchResultItemViewModel>()
               .ForMember(m => m.LastUpdatedDisplay, opt => opt.Ignore())
               .AfterMap((DatasetSearchResultItem source, DatasetSearchResultItemViewModel destination) =>
               {
                   destination.LastUpdatedDisplay = source.LastUpdated.ToString(FormatStrings.DateTimeFormatString);
               });

            CreateMap<AssignDatasetSchemaViewModel, AssignDatasetSchemaModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());
            CreateMap<DatasetDefinition, DatasetSchemaViewModel>();

            CreateMap<Provider, ProviderViewModel>()
              .ForMember(m => m.LastUpdatedDate, opt => opt.Ignore());

        }

        private void MapTestEngine()
        {
            this.CreateMap<ScenarioCompileViewModel, ScenarioCompileModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<TestScenarioSearchResultItem, TestScenarioSearchResultItemViewModel>()
           .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore())
            .AfterMap((TestScenarioSearchResultItem source, TestScenarioSearchResultItemViewModel destination) =>
            {
                if (source.LastUpdatedDate.HasValue)
                {
                    destination.LastUpdatedDateDisplay = source.LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString);
                }
            });
        }

        private void MapScenario()
        {
            CreateMap<ScenarioSearchResultItem, ScenarioSearchResultItemViewModel>()
                 .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore())
                 .AfterMap((ScenarioSearchResultItem source, ScenarioSearchResultItemViewModel destination) =>
                 {
                     destination.LastUpdatedDateDisplay = source.LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString);
                 });

            this.CreateMap<ScenarioCreateViewModel, CreateScenarioModel>()
                    .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<Scenario, ScenarioViewModel>();

            CreateMap<CurrentScenarioVersion, CurrentScenarioVersionViewModel>();
        }

        private void MapCommon()
        {
            CreateMap<SearchFacet, SearchFacetViewModel>();
            CreateMap<SearchFacetValue, SearchFacetValueViewModel>();
            CreateMap<Reference, ReferenceViewModel>();
        }
    }
}
