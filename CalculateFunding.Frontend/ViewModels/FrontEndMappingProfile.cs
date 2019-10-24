using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Jobs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
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
using ProfilingPeriod = CalculateFunding.Common.ApiClient.Specifications.Models.ProfilingPeriod;

namespace CalculateFunding.Frontend.ViewModels
{
    public class FrontEndMappingProfile : Profile
    {
        public FrontEndMappingProfile()
        {
            MapCommon();
            MapDatasets();
            MapResults();
            MapSpecs();
            MapCalcs();
            MapScenario();
            MapTestEngine();
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

            CreateMap<CalculationProviderResultSearchResult, CalculationProviderResultSearchResultItemViewModel>()
	            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.CalculationName))
	            .ForMember(dest => dest.DateOpened, opt => opt.MapFrom(src => src.OpenDate))
	            .ForMember(dest => dest.LocalAuthorityChangeDate, opt => opt.Ignore())
	            .ForMember(dest => dest.PreviousLocalAuthority, opt => opt.Ignore())
	            .ForMember(dest => dest.DateClosed, opt => opt.Ignore())
	            .ForMember(dest => dest.ConvertDate, opt => opt.Ignore());

            CreateMap<PublishedProviderProfile, PublishedProviderProfileViewModel>();

            CreateMap<ProfilingPeriod, ProfilingPeriodViewModel>();

            CreateMap<FinancialEnvelope, FinancialEnvelopeViewModel>();
        }

        private void MapCalcs()
        {
            CreateMap<Calculation, CalculationEditViewModel>()
                .ForMember(m => m.SourceCode, opt => opt.MapFrom(f => f.Current.SourceCode))
                ;

            CreateMap<Calculation, Calculations.CalculationViewModel>()
                .ForMember(m => m.Description, opt => opt.MapFrom(p => p.Current.Description))
                .ForMember(m => m.FundingPeriodId, opt => opt.Ignore())
                .ForMember(m => m.FundingPeriodName, opt => opt.Ignore())
                .ForMember(m => m.LastModified, opt => opt.MapFrom(p => p.Current.Date))
                .ForMember(m => m.Version, opt => opt.Ignore())
                .ForMember(m => m.LastModifiedByName, opt => opt.Ignore())
                .ForMember(m => m.SourceCode, opt => opt.MapFrom(p => p.Current.SourceCode))
                .ForMember(m => m.CalculationType, opt => opt.MapFrom(p => p.Current.CalculationType))
                .ForMember(m => m.PublishStatus, opt => opt.MapFrom(p => p.Current.PublishStatus));

            CreateMap<CalculationUpdateViewModel, CalculationUpdateModel>()
                .ForMember(m => m.CalculationType, opt => opt.Ignore())
                .ForMember(m => m.Name, opt => opt.Ignore())
                .ForMember(m => m.AllocationLineId, opt => opt.Ignore())
                .ForMember(m => m.Description, opt => opt.Ignore());

            CreateMap<PreviewCompileRequestViewModel, PreviewRequest>()
                .ForMember(d => d.SpecificationId, opt => opt.Ignore())
                .ForMember(d => d.CalculationId, opt => opt.Ignore())
                .ForMember(d => d.Name, opt => opt.Ignore())
                ;

            CreateMap<CalculationUpdateViewModel, CalculationEditModel>()
                .ForMember(d => d.Description, opt => opt.Ignore())
                .ForMember(d => d.SpecificationId, opt => opt.Ignore())
                .ForMember(d => d.CalculationId, opt => opt.Ignore())
                .ForMember(d => d.Name, opt => opt.Ignore())
                .ForMember(d => d.ValueType, opt => opt.Ignore())
                ;

            CreateMap<CalculationVersion, CalculationVersionsCompareModel>()
                .ForMember(m => m.Versions, opt => opt.MapFrom(f => new[] { f.Version }))
                ;

            CreateMap<CalculationVersion, CalculationVersionViewModel>()
                .ForMember(m => m.DecimalPlaces, opt => opt.Ignore())
                .ForMember(m => m.Status, opt => opt.Ignore())
                ;

            CreateMap<CalculationSearchResult, CalculationSearchResultItemViewModel>();
        }

        private void MapSpecs()
        {
            CreateMap<CreateSpecificationViewModel, Specification>()
                .ForMember(m => m.Id, opt => opt.Ignore())
                .ForMember(m => m.FundingPeriod, opt => opt.Ignore())
                .ForMember(m => m.FundingStreams, opt => opt.Ignore())
                .ForMember(m => m.Calculations, opt => opt.Ignore())
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

            CreateMap<CreateCalculationViewModel, CalculationCreateModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore())
                .ForMember(m => m.SourceCode, opt => opt.Ignore())
                .ForMember(m => m.ValueType, opt => opt.Ignore())
                .ForMember(m => m.Id, opt => opt.Ignore());

            CreateMap<CreateAdditionalCalculationViewModel, CalculationCreateModel>()
                .ForMember(m => m.Name, opt => opt.Ignore())
                .ForMember(m => m.Description, opt => opt.Ignore())
                .ForMember(m => m.SpecificationId, opt => opt.Ignore())
                .ForMember(m => m.ValueType, opt => opt.Ignore())
                .ForMember(m => m.Id, opt => opt.Ignore());

            CreateMap<EditAdditionalCalculationViewModel, CalculationEditModel>()
                .ForMember(m => m.Name, opt => opt.Ignore())
                .ForMember(m => m.Description, opt => opt.Ignore())
                .ForMember(m => m.SpecificationId, opt => opt.Ignore())
                .ForMember(m => m.CalculationId, opt => opt.Ignore())
                .ForMember(m => m.ValueType, opt => opt.Ignore());


            CreateMap<Specification, SpecificationViewModel>()
                .ForMember(m => m.Calculations, opt => opt.Ignore());

            CreateMap<SpecificationSummary, SpecificationSummaryViewModel>();

            CreateMap<SpecificationSummary, SpecificationSummary>();

            CreateMap<SpecificationSummary, SpecificationViewModel>()
                  .ForMember(m => m.PublishStatus, opt => opt.MapFrom(c => c.ApprovalStatus))
                  .ForMember(m => m.Calculations, opt => opt.Ignore());

            CreateMap<Calculation, Specs.CalculationViewModel>()
                .ForMember(d => d.LastUpdated, opt => opt.Ignore());


            CreateMap<CalculationCurrentVersion,
                    Specs.CalculationViewModel>()
                .ForMember(d => d.LastUpdated, opt => opt.Ignore())
                .ForMember(d => d.Description, opt => opt.Ignore())
                .ForMember(d => d.AllocationLine, opt => opt.Ignore())
                ;

            CreateMap<CalculationVersion, Calculations.CalculationViewModel>()
                .ForMember(d => d.SpecificationId, opt => opt.Ignore())
                .ForMember(d => d.FundingPeriodId, opt => opt.Ignore())
                .ForMember(d => d.FundingPeriodName, opt => opt.Ignore())
                .ForMember(d => d.LastModified, opt => opt.MapFrom(s => s.Date.Date))
                .ForMember(d => d.LastModifiedByName, opt => opt.MapFrom(s => s.Author.Name))
                .ForMember(d => d.Id, opt => opt.MapFrom(s => s.CalculationId))
                ;


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
            CreateMap<DatasetIndex, DatasetSearchResultItemViewModel>()
               .ForMember(m => m.LastUpdatedDisplay, opt => opt.Ignore())
               .ForMember(dest => dest.LastUpdated, opt => opt.MapFrom(src => src.LastUpdatedDate))
               .AfterMap((DatasetIndex source, DatasetSearchResultItemViewModel destination) =>
               {
                   destination.LastUpdatedDisplay = source.LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString);
               });

            CreateMap<DatasetDefinitionIndex, DatasetDefinitionSearchResultItemViewModel>()
               .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore());
            CreateMap<DatasetVersionIndex, DatasetVersionSearchResultModel>();

            CreateMap<AssignDatasetSchemaViewModel, CreateDefinitionSpecificationRelationshipModel>()
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

            CreateMap<DatasetVersionResponseViewModel, DatasetVersionFullViewModel>()
               .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore())
               .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.PublishStatus))
               .AfterMap((DatasetVersionResponseViewModel source, DatasetVersionFullViewModel destination) =>
               {
                   destination.LastUpdatedDateDisplay = source.LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString);
               });

            CreateMap<DatasetValidationStatusModel, DatasetValidationStatusViewModel>();
            CreateMap<DatasetValidationStatus, DatasetValidationStatusOperationViewModel>();
            CreateMap<CreateDefinitionSpecificationRelationshipModel, AssignDatasetSchemaViewModel>();
        }

        private void MapTestEngine()
        {
            CreateMap<ScenarioCompileViewModel, ScenarioCompileModel>()
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

            CreateMap<ResultCounts, ResultCountsViewModel>();
        }

        private void MapScenario()
        {
            CreateMap<ScenarioSearchResultItem, ScenarioSearchResultItemViewModel>()
                 .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore())
                 .AfterMap((ScenarioSearchResultItem source, ScenarioSearchResultItemViewModel destination) =>
                 {
                     destination.LastUpdatedDateDisplay = source.LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString);
                 });

            CreateMap<ScenarioCreateViewModel, CreateScenarioModel>()
                    .ForMember(m => m.SpecificationId, opt => opt.Ignore());

            CreateMap<TestScenario, TestScenarioViewModel>();

            //CreateMap<CurrentScenarioVersion, CurrentScenarioVersionViewModel>();

            CreateMap<ScenarioEditViewModel, TestScenarioUpdateModel>()
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
