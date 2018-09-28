namespace CalculateFunding.Frontend.ViewModels
{
    using System.Linq;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.ViewModels.Approvals;
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
            this.MapApprovals();
        }

        private void MapApprovals()
        {
            CreateMap<PublishedProviderResult, PublishedProviderResultViewModel>()
                .ForMember(m => m.TestCoveragePercent, opt => opt.Ignore())
                .ForMember(m => m.TestsPassed, opt => opt.Ignore())
                .ForMember(m => m.TestsTotal, opt => opt.Ignore());

            CreateMap<PublishedFundingStreamResult, PublishedFundingStreamResultViewModel>();
            CreateMap<PublishedAllocationLineResult, PublishedAllocationLineResultViewModel>();

            CreateMap<AllocationLineStatusViewModel, AllocationLineStatus>();

            CreateMap<PublishedAllocationLineResultStatusUpdateResponseModel, PublishedAllocationLineResultStatusUpdateResponseViewModel>()
                .ForMember(m => m.UpdatedProviders, opt => opt.MapFrom(f => f.UpdatedProviderIds));

            CreateMap<AllocationLineSummary, AllocationLineSummaryViewModel>();
            CreateMap<FundingStreamSummary, FundingStreamSummaryViewModel>();
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

            CreateMap<TestScenarioResultCounts, TestScenarioResultCountsViewModel>();

            CreateMap<ScenarioSearchResultViewModel, TestScenarioResultViewModel>()
                .ForMember(m => m.TestResults, opt => opt.MapFrom(s => s.Scenarios))
                .ForMember(m => m.Specifications, opt => opt.Ignore())
                .ForMember(m => m.FundingPeriodId, opt => opt.Ignore());

            CreateMap<ScenarioSearchResultItemViewModel, TestScenarioResultItemViewModel>()
                .ForMember(m => m.Passes, opt => opt.UseValue(0))
                .ForMember(m => m.Failures, opt => opt.UseValue(0))
                .ForMember(m => m.Ignored, opt => opt.UseValue(0));

            CreateMap<CalculationProviderResultSearchResultItem, CalculationProviderResultSearchResultItemViewModel>();
        }

        private void MapCalcs()
        {
            CreateMap<Clients.CalcsClient.Models.Calculation, CalculationEditViewModel>();
            CreateMap<Clients.CalcsClient.Models.Calculation, Calculations.CalculationViewModel>()
                .ForMember(m => m.Description, opt => opt.Ignore());

            CreateMap<CalculationUpdateViewModel, Clients.CalcsClient.Models.CalculationUpdateModel>();

            CreateMap<CalculationSearchResultItem, CalculationSearchResultItemViewModel>();

            CreateMap<PreviewCompileRequestViewModel, PreviewCompileRequest>()
                .ForMember(m => m.CalculationId, opt => opt.Ignore())
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());
        }

        private void MapSpecs()
        {
            CreateMap<CreateSpecificationViewModel, Specification>()
                .ForMember(m => m.Id, opt => opt.Ignore())
                .ForMember(m => m.FundingPeriod, opt => opt.Ignore())
                .ForMember(m => m.FundingStreams, opt => opt.Ignore())
                .ForMember(m => m.Policies, opt => opt.Ignore())
                .ForMember(m => m.IsSelectedForFunding, opt => opt.Ignore())
                .ForMember(m => m.PublishStatus, opt => opt.Ignore());

            CreateMap<CreateSpecificationViewModel, CreateSpecificationModel>();

            CreateMap<EditSpecificationViewModel, EditSpecificationModel>();

            CreateMap<CreatePolicyViewModel, CreatePolicyModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<EditPolicyViewModel, EditPolicyModel>()
               .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<CreateSubPolicyViewModel, CreateSubPolicyModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore())
                .AfterMap((CreateSubPolicyViewModel source, CreateSubPolicyModel destination) =>
                {
                    destination.ParentPolicyId = source.ParentPolicyId;
                });

            CreateMap<CreateCalculationViewModel, CalculationCreateModel>()
               .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<Specification, SpecificationViewModel>();

            CreateMap<Policy, PolicyViewModel>();

            CreateMap<EditSubPolicyViewModel, EditSubPolicyModel>()
             .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<Policy, EditSubPolicyViewModel>()
             .ForMember(m => m.ParentPolicyId, opt => opt.Ignore());

            CreateMap<SpecificationSummary, SpecificationSummaryViewModel>();

            CreateMap<Clients.SpecsClient.Models.Calculation, Specs.CalculationViewModel>();

            CreateMap<CalculationCurrentVersion, Specs.CalculationViewModel>();

            CreateMap<Specification, EditSpecificationViewModel>()
                .ForMember(m => m.FundingStreamIds, opt => opt.Ignore())
                .ForMember(m => m.OriginalSpecificationName, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingStreams, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingPeriodId, opt => opt.Ignore())
                .AfterMap((Specification source, EditSpecificationViewModel destination) =>
                {
                    destination.FundingPeriodId = source.FundingPeriod.Id;
                    destination.FundingStreamIds = source.FundingStreams.Select(m => m.Id);
                });

            CreateMap<SpecificationSearchResultItem, SpecificationSearchResultItemViewModel>();
        }

        private void MapDatasets()
        {
            CreateMap<DatasetSearchResultItem, DatasetSearchResultItemViewModel>()
               .ForMember(m => m.LastUpdatedDisplay, opt => opt.Ignore())
               .AfterMap((DatasetSearchResultItem source, DatasetSearchResultItemViewModel destination) =>
               {
                   destination.LastUpdatedDisplay = source.LastUpdated.ToString(FormatStrings.DateTimeFormatString);
               });

            CreateMap<DatasetDefinitionSearchResultItem, DatasetDefinitionSearchResultItemViewModel>()
               .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore());

            CreateMap<AssignDatasetSchemaViewModel, AssignDatasetSchemaModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore());
            CreateMap<DatasetDefinition, DatasetSchemaViewModel>();

            CreateMap<Provider, ProviderViewModel>()
              .ForMember(m => m.DateOpenedDisplay, opt => opt.Ignore())

             .AfterMap((Provider source, ProviderViewModel destination) =>
              {
                  if (source.DateOpened.HasValue)
                  {
                      destination.DateOpenedDisplay = source.DateOpened.Value.ToString(FormatStrings.DateTimeFormatString);

                  }
              });

            CreateMap<DatasetVersionResponse, DatasetVersionFullViewModel>()
               .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore())
               .AfterMap((DatasetVersionResponse source, DatasetVersionFullViewModel destination) =>
               {
                   destination.LastUpdatedDateDisplay = source.LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString);
               });

            CreateMap<DatasetValidationStatusModel, DatasetValidationStatusViewModel>();
            CreateMap<DatasetCreateUpdateResponseModel, DatasetCreateUpdateResponseViewModel>();
            CreateMap<DatasetValidationStatusOperation, DatasetValidationStatusOperationViewModel>();
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

            this.CreateMap<ResultCounts, ResultCountsViewModel>();
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

            CreateMap<TestScenario, TestScenarioViewModel>();

            //CreateMap<CurrentScenarioVersion, CurrentScenarioVersionViewModel>();

            this.CreateMap<ScenarioEditViewModel, TestScenarioUpdateModel>()
              .ForMember(m => m.SpecificationId, opt => opt.Ignore())
              .ForMember(m => m.Scenario, opt => opt.MapFrom(p => p.Gherkin))
              .ForMember(m => m.Id, opt => opt.Ignore());
        }

        private void MapCommon()
        {
            CreateMap<SearchFacet, SearchFacetViewModel>();
            CreateMap<SearchFacetValue, SearchFacetValueViewModel>();
            CreateMap<Reference, ReferenceViewModel>();
            CreateMap<PublishStatus, PublishStatusViewModel>();
        }
    }
}
