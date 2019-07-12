namespace CalculateFunding.Frontend.ViewModels
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Jobs.Models;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Providers.Models.Search;
    using CalculateFunding.Common.Models;
    using CalculateFunding.Common.Models.Search;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
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
    using CalculateFunding.Frontend.ViewModels.Jobs;
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
            CreateMap<ProviderVersionSearchResult, ProviderSearchResultItemViewModel>()
                        .ForMember(m => m.ConvertDate, opt => opt.Ignore())
                        .ForMember(m => m.LocalAuthorityChangeDate, opt => opt.Ignore())
                        .ForMember(m => m.PreviousLocalAuthority, opt => opt.Ignore())
                        .ForMember(m => m.DateClosed, opt => opt.Ignore())
                        .ForMember(m => m.LocalAuthority, opt => opt.MapFrom(s => s.Authority));

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
                .ForMember(m => m.Passes, opt => opt.MapFrom(v => 0))
                .ForMember(m => m.Failures, opt => opt.MapFrom(v => 0))
                .ForMember(m => m.Ignored, opt => opt.MapFrom(v => 0));

            CreateMap<CalculationProviderResultSearchResultItem, CalculationProviderResultSearchResultItemViewModel>();

            CreateMap<PublishedProviderProfile, PublishedProviderProfileViewModel>();

            CreateMap<ProfilingPeriod, ProfilingPeriodViewModel>();

            CreateMap<FinancialEnvelope, FinancialEnvelopeViewModel>();
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

            CreateMap<CreateSpecificationModel, CreateSpecificationViewModel>()
                .ForMember(m => m.FundingStreamId, opt => opt.Ignore())
                .AfterMap((CreateSpecificationModel source, CreateSpecificationViewModel destination) =>
                {
                    destination.FundingStreamId = source.FundingStreamIds.FirstOrDefault();
                });

            CreateMap<CreateSpecificationViewModel, CreateSpecificationModel>()
                .ForMember(m => m.FundingStreamIds, opt => opt.Ignore())
                .AfterMap((CreateSpecificationViewModel source, CreateSpecificationModel destination) =>
                {
                    destination.FundingStreamIds = new List<string> { source.FundingStreamId };
                });

            CreateMap<EditSpecificationViewModel, EditSpecificationModel>()
                .ForMember(m => m.FundingStreamIds, opt => opt.Ignore())
                .AfterMap((EditSpecificationViewModel source, EditSpecificationModel destination) =>
                {
                    destination.FundingStreamIds = new List<string> { source.FundingStreamId };
                });

            CreateMap<EditSpecificationModel, EditSpecificationViewModel>()
                .ForMember(m => m.Id, opt => opt.Ignore())
                .ForMember(m => m.FundingStreamId, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingPeriodId, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingStreamId, opt => opt.Ignore())
                .ForMember(m => m.OriginalSpecificationName, opt => opt.Ignore())
                .ForMember(m => m.IsSelectedForFunding, opt => opt.Ignore())
                .AfterMap((EditSpecificationModel source, EditSpecificationViewModel destination) =>
                {
                    destination.FundingStreamId = source.FundingStreamIds.FirstOrDefault();
                });

            CreateMap<EditPolicyViewModel, EditPolicyModel>()
               .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<CreateCalculationViewModel, CalculationCreateModel>()
               .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<Specification, SpecificationViewModel>()
                .ForMember(m => m.Calculations, opt => opt.Ignore());

            CreateMap<Policy, PolicyViewModel>();

            CreateMap<EditSubPolicyViewModel, EditSubPolicyModel>()
             .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<Policy, EditSubPolicyViewModel>()
             .ForMember(m => m.ParentPolicyId, opt => opt.Ignore());

            CreateMap<SpecificationSummary, SpecificationSummaryViewModel>();

            CreateMap<Clients.SpecsClient.Models.Calculation, Specs.CalculationViewModel>();

            CreateMap<CalculationCurrentVersion, Specs.CalculationViewModel>();

            CreateMap<Specification, EditSpecificationViewModel>()
                .ForMember(m => m.OriginalSpecificationName, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingStreamId, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingPeriodId, opt => opt.Ignore())
                .ForMember(m => m.FundingStreamId, opt => opt.Ignore())
                .AfterMap((Specification source, EditSpecificationViewModel destination) =>
                {
                    destination.FundingPeriodId = source.FundingPeriod.Id;
                    destination.FundingStreamId = source.FundingStreams.FirstOrDefault()?.Id;
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

            CreateMap<ProviderVersionSearchResult, ProviderViewModel>()
              .ForMember(m => m.DateOpenedDisplay, opt => opt.Ignore())
              .ForMember(m => m.LocalAuthority, opt => opt.MapFrom(c => c.Authority))
              .ForMember(m => m.Upin, opt => opt.MapFrom(c => string.IsNullOrWhiteSpace(c.UPIN) ? 0 : Convert.ToInt32(c.UPIN)))
              .ForMember(m => m.Ukprn, opt => opt.MapFrom(c => string.IsNullOrWhiteSpace(c.UKPRN) ? 0 : Convert.ToInt32(c.UKPRN)))
              .ForMember(m => m.Urn, opt => opt.MapFrom(c => string.IsNullOrWhiteSpace(c.URN) ? 0 : Convert.ToInt32(c.URN)))

             .AfterMap((ProviderVersionSearchResult source, ProviderViewModel destination) =>
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
            CreateMap<Facet, SearchFacetViewModel>();
            CreateMap<SearchFacetValue, SearchFacetValueViewModel>();
            CreateMap<Reference, ReferenceViewModel>();
            CreateMap<PublishStatus, PublishStatusViewModel>();
            CreateMap<JobSummary, JobSummaryViewModel>();
        }
    }
}
