﻿using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Jobs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using CalculateFunding.Frontend.ViewModels.Graph;
using CalculateFunding.Frontend.ViewModels.Jobs;
using CalculateFunding.Frontend.ViewModels.Results;
using CalculateFunding.Frontend.ViewModels.Specs;
using CalculateFunding.Frontend.ViewModels.Users;
using IEnumerableExtensions = System.Linq.IEnumerableExtensions;
using GraphApiModels = CalculateFunding.Common.ApiClient.Graph.Models;
using Newtonsoft.Json.Linq;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.Controllers;

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
            MapGraph();
            MapUserPermissions();
            MapTemplates();
        }

        private void MapTemplates()
        {
            CreateMap<SearchResults<TemplateIndex>, TemplateBuildController.SearchTemplatesResultsViewModel>()
                .ForMember(m => m.StartItemNumber, opt => opt.Ignore())
                .ForMember(m => m.EndItemNumber, opt => opt.Ignore())
                .ForMember(m => m.PagerState, opt => opt.Ignore());
            ;
        }

        private void MapUserPermissions()
        {
            CreateMap<FundingStreamPermission, FundingStreamPermissionModel>()
                .ForMember(m => m.FundingStreamName, opt => opt.Ignore());

            CreateMap<FundingStreamPermission, FundingStreamPermissionUpdateModel>();

            CreateMap<FundingStreamPermissionCurrentDownloadModel, FundingStreamPermissionCurrentDownloadViewModel>();
        }

        private void MapGraph()
        {
            CreateMap<GraphApiModels.Calculation, GraphCalculationViewModel>();
            CreateMap<GraphApiModels.Relationship, GraphCalculationRelationshipEntityViewModel>()
                .ForMember(m => m.Source, opt => opt.MapFrom(src => src.One))
                .ForMember(m => m.Target, opt => opt.MapFrom(src => src.Two));
            CreateMap<JObject, GraphCalculationViewModel>()
                .ForMember(m => m.CalculationId, opt => opt.MapFrom(src => src["calculationid"].ToString()))
                .ForMember(m => m.SpecificationId, opt => opt.MapFrom(src => src["specificationid"].ToString()))
                .ForMember(m => m.CalculationName, opt => opt.MapFrom(src => src["calculationname"].ToString()))
                .ForMember(m => m.CalculationType, opt => opt.MapFrom(src => src["calculationtype"].ToString()))
                .ForMember(m => m.FundingStream, opt => opt.MapFrom(src => src["fundingstream"].ToString()));

            CreateMap<GraphApiModels.Entity<GraphApiModels.Calculation>, GraphCalculationEntityViewModel<GraphCalculationViewModel>>()
                .ForMember(m => m.Node, opt => opt.MapFrom(src => src.Node))
                .ForMember(m => m.Relationships, opt => opt.MapFrom(src => src.Relationships));
        }

        private void MapResults()
        {
            CreateMap<ProviderVersionSearchResult, ProviderSearchResultItemViewModel>()
                .ForMember(m => m.ConvertDate, opt => opt.Ignore())
                .ForMember(m => m.LocalAuthorityChangeDate, opt => opt.Ignore())
                .ForMember(m => m.PreviousLocalAuthority, opt => opt.Ignore())
                .ForMember(m => m.DateClosed, opt => opt.Ignore())
                .ForMember(m => m.DateOpened, opt => opt.MapFrom(src => src.DateOpened != null ? src.DateOpened.Value.DateTime : DateTime.MinValue))
                .ForMember(m => m.LocalAuthority, opt => opt.MapFrom(s => s.Authority));

            CreateMap<CalculationProviderResultSearchResult, CalculationProviderResultSearchResultItemViewModel>()
                .ForMember(d => d.CalculationResultDisplay, opt => opt.Ignore());
        }

        private void MapCalcs()
        {
            CreateMap<Calculation, CalculationEditViewModel>()
                .ForMember(m => m.SourceCode, opt => opt.MapFrom(f => f.SourceCode));

            CreateMap<Calculation, CalculationViewModel>()
                .ForMember(m => m.Description, opt => opt.MapFrom(p => p.Description))
                .ForMember(m => m.LastModified, opt => opt.MapFrom(p => p.LastUpdated != null ? p.LastUpdated.Value.Date : DateTime.MinValue))
                .ForMember(m => m.SpecificationId, opt => opt.MapFrom(p => p.SpecificationId))
                .ForMember(m => m.Version, opt => opt.Ignore())
                .ForMember(m => m.LastModifiedByName, opt => opt.MapFrom(p => p.Author != null ? p.Author.Name : "Unknown"))
                .ForMember(m => m.SourceCode, opt => opt.MapFrom(p => p.SourceCode))
                .ForMember(m => m.CalculationType, opt => opt.MapFrom(p => p.CalculationType.AsMatchingEnum<CalculationTypeViewModel>()))
                .ForMember(m => m.ValueType, opt => opt.MapFrom(p => p.ValueType.AsMatchingEnum<CalculationValueTypeViewModel>()))
                .ForMember(m => m.PublishStatus, opt => opt.MapFrom(p => p.PublishStatus));

            CreateMap<PreviewCompileRequestViewModel, PreviewRequest>()
                .ForMember(d => d.SpecificationId, opt => opt.Ignore())
                .ForMember(d => d.CalculationId, opt => opt.Ignore())
                .ForMember(d => d.Name, opt => opt.Ignore())
                .ForMember(d => d.ProviderId, opt => opt.Ignore());

            CreateMap<CalculationUpdateViewModel, CalculationEditModel>()
                .ForMember(d => d.Description, opt => opt.Ignore())
                .ForMember(d => d.SpecificationId, opt => opt.Ignore())
                .ForMember(d => d.CalculationId, opt => opt.Ignore())
                .ForMember(d => d.Name, opt => opt.Ignore())
                .ForMember(d => d.ValueType, opt => opt.Ignore())
                .ForMember(d => d.DataType, opt => opt.Ignore());

            CreateMap<CalculationVersion, CalculationVersionsCompareModel>()
                .ForMember(m => m.Versions, opt => opt.MapFrom(f => new[] {f.Version}))
                ;

            CreateMap<CalculationSearchResult, CalculationSearchResultItemViewModel>();

            CreateMap<Calculation, CalculationByIdViewModel>()
                .ForMember(m => m.TemplateCalculationId, opt => opt.Ignore())
                .ForMember(m => m.TemplateCalculationType, opt => opt.Ignore());
        }

        private void MapSpecs()
        {
            CreateMap<CreateSpecificationViewModel, SpecificationSummary>()
                .ForMember(m => m.Id, opt => opt.Ignore())
                .ForMember(m => m.FundingPeriod, opt => opt.Ignore())
                .ForMember(m => m.FundingStreams, opt => opt.Ignore())
                .ForMember(m => m.IsSelectedForFunding, opt => opt.Ignore())
                .ForMember(m => m.ApprovalStatus, opt => opt.Ignore())
                .ForMember(m => m.TemplateIds, opt => opt.Ignore())
                .ForMember(m => m.DataDefinitionRelationshipIds, opt => opt.Ignore())
                .ForMember(m => m.LastEditedDate, opt => opt.Ignore())
                .ForMember(m => m.ProviderSource, opt => opt.Ignore())
                .ForMember(m => m.ForceUpdateOnNextRefresh, opt => opt.Ignore())
                .ForMember(m => m.CoreProviderVersionUpdates, opt => opt.Ignore());

            CreateMap<CreateSpecificationModel, CreateSpecificationViewModel>()
                .ForMember(m => m.FundingStreamId, opt => opt.Ignore())
                .AfterMap((CreateSpecificationModel source, CreateSpecificationViewModel destination) => { destination.FundingStreamId = source.FundingStreamIds.FirstOrDefault(); });

            CreateMap<CreateSpecificationViewModel, CreateSpecificationModel>()
                .ForMember(m => m.FundingStreamIds, opt => opt.Ignore())
                .AfterMap((CreateSpecificationViewModel source, CreateSpecificationModel destination) => { destination.FundingStreamIds = new List<string> {source.FundingStreamId}; });

            CreateMap<EditSpecificationViewModel, EditSpecificationModel>()
                .ForMember(m => m.AssignedTemplateIds, opt => opt.Ignore());

            CreateMap<EditSpecificationModel, EditSpecificationViewModel>()
                .ForMember(m => m.Id, opt => opt.Ignore())
                .ForMember(m => m.FundingStreamId, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingPeriodId, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingStreamId, opt => opt.Ignore())
                .ForMember(m => m.OriginalSpecificationName, opt => opt.Ignore())
                .ForMember(m => m.IsSelectedForFunding, opt => opt.Ignore());

            CreateMap<CreateAdditionalCalculationViewModel, CalculationCreateModel>()
                .ForMember(m => m.Name, opt => opt.Ignore())
                .ForMember(m => m.Description, opt => opt.Ignore())
                .ForMember(m => m.SpecificationId, opt => opt.Ignore())
                .ForMember(m => m.ValueType, opt => opt.Ignore())
                .ForMember(m => m.Author, opt => opt.Ignore())
                .ForMember(m => m.Id, opt => opt.Ignore())
                .ForMember(m => m.FundingStreamId, opt => opt.Ignore())
                .ForMember(m => m.WasTemplateCalculation, opt => opt.Ignore());

            CreateMap<EditAdditionalCalculationViewModel, CalculationEditModel>()
                .ForMember(m => m.Name, opt => opt.Ignore())
                .ForMember(m => m.Description, opt => opt.Ignore())
                .ForMember(m => m.SpecificationId, opt => opt.Ignore())
                .ForMember(m => m.CalculationId, opt => opt.Ignore())
                .ForMember(m => m.ValueType, opt => opt.Ignore());


            CreateMap<SpecificationSummary, SpecificationSummaryViewModel>();

            CreateMap<SpecificationSummary, SpecificationSummary>();

            CreateMap<SpecificationSummary, SpecificationViewModel>()
                .ForMember(m => m.PublishStatus, opt => opt.MapFrom(c => c.ApprovalStatus));

            CreateMap<CalculationVersion, CalculationViewModel>()
                .ForMember(d => d.LastModified, opt => opt.MapFrom(s => s.LastUpdated))
                .ForMember(d => d.LastModifiedByName, opt => opt.MapFrom(s => s.Author != null ? s.Author.Name : "Unknown"))
                .ForMember(d => d.PublishStatus, opt => opt.MapFrom(s => s.PublishStatus.AsMatchingEnum<PublishStatusViewModel>()))
                .ForMember(d => d.Id, opt => opt.MapFrom(s => s.CalculationId))
                .ForMember(d => d.ValueType, opt => opt.Ignore())
                .ForMember(d => d.SpecificationId, opt => opt.Ignore())
                .ForMember(d => d.LastModified, opt => opt.Ignore())
                .ForMember(d => d.Description, opt => opt.Ignore());

            CreateMap<SpecificationSummary, EditSpecificationViewModel>()
                .ForMember(m => m.OriginalSpecificationName, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingStreamId, opt => opt.Ignore())
                .ForMember(m => m.OriginalFundingPeriodId, opt => opt.Ignore())
                .ForMember(m => m.FundingStreamId, opt => opt.Ignore())
                .AfterMap((SpecificationSummary source, EditSpecificationViewModel destination) =>
                {
                    destination.FundingPeriodId = source.FundingPeriod?.Id;
                    if (IEnumerableExtensions.AnyWithNullCheck(source.FundingStreams))
                    {
                        destination.FundingStreamId = source.FundingStreams.FirstOrDefault()?.Id;
                    }
                });

            CreateMap<SpecificationSearchResultItem, SpecificationSearchResultItemViewModel>();
        }

        private void MapDatasets()
        {
            CreateMap<DatasetIndex, DatasetSearchResultItemViewModel>()
                .ForMember(m => m.LastUpdatedDisplay, opt => opt.Ignore())
                .ForMember(m => m.LastUpdated, opt => opt.MapFrom(src => src.LastUpdatedDate != null ? src.LastUpdatedDate.DateTime : DateTime.MinValue))
                .AfterMap((DatasetIndex source, DatasetSearchResultItemViewModel destination) => { destination.LastUpdatedDisplay = source.LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString); });

            CreateMap<UserIndex, UserSearchResultItemViewModel>();

            CreateMap<DatasetDefinitionIndex, DatasetDefinitionSearchResultItemViewModel>()
                .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore());
            CreateMap<DatasetVersionIndex, DatasetVersionSearchResultModel>();

            CreateMap<AssignDatasetSchemaViewModel, CreateDefinitionSpecificationRelationshipModel>()
                .ForMember(m => m.SpecificationId, opt => opt.Ignore())
                .ForMember(m => m.ConverterEnabled, opt => opt.Ignore());
            CreateMap<DatasetDefinition, DatasetSchemaViewModel>();

            CreateMap<ProviderVersionSearchResult, ProviderViewModel>()
                .ForMember(m => m.DateOpenedDisplay, opt => opt.Ignore())
                .ForMember(m => m.DateOpened, opt => opt.MapFrom(c => c.DateOpened != null ? c.DateOpened.Value.DateTime : DateTime.MinValue))
                .ForMember(m => m.LocalAuthority, opt => opt.MapFrom(c => c.Authority))
                .ForMember(m => m.Upin, opt => opt.MapFrom(c => string.IsNullOrWhiteSpace(c.UPIN) ? 0 : Convert.ToInt32(c.UPIN)))
                .ForMember(m => m.Ukprn, opt => opt.MapFrom(c => string.IsNullOrWhiteSpace(c.UKPRN) ? 0 : Convert.ToInt32(c.UKPRN)))
                .ForMember(m => m.Urn, opt => opt.MapFrom(c => string.IsNullOrWhiteSpace(c.URN) ? 0 : Convert.ToInt32(c.URN)))
                .AfterMap((ProviderVersionSearchResult source, ProviderViewModel destination) => { destination.DateOpenedDisplay = source.DateOpened.HasValue ? source.DateOpened.Value.ToString("dd/MM/yyyy") : "Unknown"; });

            CreateMap<DatasetVersionResponseViewModel, DatasetVersionFullViewModel>()
                .ForMember(m => m.LastUpdatedDateDisplay, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdatedDate, opt => opt.MapFrom(src => src.LastUpdatedDate != null ? src.LastUpdatedDate.DateTime : DateTime.MinValue))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.PublishStatus))
                .AfterMap((DatasetVersionResponseViewModel source, DatasetVersionFullViewModel destination) => { destination.LastUpdatedDateDisplay = source.LastUpdatedDate.ToString(FormatStrings.DateTimeFormatString); });

            CreateMap<DatasetValidationStatusModel, DatasetValidationStatusViewModel>();
            CreateMap<DatasetValidationStatus, DatasetValidationStatusOperationViewModel>();
            CreateMap<CreateDefinitionSpecificationRelationshipModel, AssignDatasetSchemaViewModel>();
        }

        private void MapCommon()
        {
            CreateMap<SearchFacet, SearchFacetViewModel>().ForMember(m => m.FacetValues, opt => opt.MapFrom(src => src.FacetValues));
            CreateMap<FacetValue, SearchFacetValueViewModel>();
            CreateMap<Facet, SearchFacetViewModel>().ForMember(m => m.FacetValues, opt => opt.MapFrom(src => src.FacetValues));
            CreateMap<SearchFacetValue, SearchFacetValueViewModel>();
            CreateMap<Reference, ReferenceViewModel>();
            CreateMap<PublishStatus, PublishStatusViewModel>();
            CreateMap<Outcome, JobOutcomeViewModel>()
                .ForMember(m => m.JobType,
                    opt => opt.MapFrom(src => src.JobDefinitionId));
            CreateMap<JobSummary, JobSummaryViewModel>();
            CreateMap<JobViewModel, JobSummaryViewModel>()
                .ForMember(dest => dest.EntityId,
                    opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdated,
                    opt => opt.Ignore())
                .ForMember(dest => dest.OverallItemsProcessed,
                    opt => opt.Ignore())
                .ForMember(dest => dest.OverallItemsSucceeded,
                    opt => opt.Ignore())
                .ForMember(dest => dest.OverallItemsFailed,
                    opt => opt.Ignore())
                .ForMember(dest => dest.OutcomeType,
                    opt => opt.Ignore())
                .ForMember(dest => dest.JobId,
                    opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.JobType,
                    opt => opt.MapFrom(src => src.JobDefinitionId))
                .ForMember(dest => dest.Outcomes,
                    opt => opt.MapFrom(src => Map(src)));
            CreateMap<Trigger, TriggerViewModel>();
            CreateMap<PublishedProviderSearchItem, PublishedProviderSearchResultItemViewModel>();
        }

        private IEnumerable<JobOutcomeViewModel> Map(JobViewModel job)
        {
            return job.ChildJobs.Select(x => new JobOutcomeViewModel
            {
                Description = x.Outcome,
                JobType = x.JobDefinitionId,
                Type = x.CompletionStatus
                    switch
                    {
                        CompletionStatus.Failed => OutcomeType.Failed,
                        CompletionStatus.Succeeded => OutcomeType.Succeeded,
                        CompletionStatus.Superseded => OutcomeType.Succeeded,
                        CompletionStatus.TimedOut => OutcomeType.Failed,
                        CompletionStatus.Cancelled => OutcomeType.Inconclusive,
                        _ => OutcomeType.Inconclusive
                    }
            });
        }
    }
}