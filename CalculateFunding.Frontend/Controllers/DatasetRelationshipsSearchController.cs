using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class DatasetRelationshipsSearchController : Controller
    {
        private IDatasetRelationshipsSearchService _searchService;
        private ISpecificationsApiClient _specificationsApiClient;
        private IAuthorizationHelper _authorizationHelper;
        private IMapper _mapper;
        private IDatasetsApiClient _datasetsApiClient;

        public DatasetRelationshipsSearchController(
            IDatasetRelationshipsSearchService searchService, 
            ISpecificationsApiClient specificationsApiClient, 
            IAuthorizationHelper authorizationHelper, 
            IMapper mapper, 
            IDatasetsApiClient datasetsApiClient)
        {
            Guard.ArgumentNotNull(searchService, nameof(searchService));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(datasetsApiClient, nameof(datasetsApiClient));

            _searchService = searchService;
            _specificationsApiClient = specificationsApiClient;
            _authorizationHelper = authorizationHelper;
            _mapper = mapper;
            _datasetsApiClient = datasetsApiClient;
        }

        [HttpPost]
        [Route("api/dataSetRelationships/search")]
        public async Task<IActionResult> SearchDatasetRelationships([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            SpecificationDatasourceRelationshipSearchResultViewModel result =
                await _searchService.PerformSearch(request);
            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new StatusCodeResult(500);
            }
        }

        [HttpGet]
        [Route("api/dataSetRelationships/get-sources")]
        public async Task<IActionResult> GetSources(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<SpecificationSummary> specificationResponse =
                await _specificationsApiClient.GetSpecificationSummaryById(specificationId);

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                return new StatusCodeResult((int)specificationResponse.StatusCode);
            }

            SpecificationDatasetRelationshipsViewModel viewModel = await PopulateViewModel(specificationResponse.Content);

            if (viewModel == null)
            {
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(viewModel);
        }

        private async Task<SpecificationDatasetRelationshipsViewModel> PopulateViewModel(
            SpecificationSummary specification)
        {
            SpecificationSummaryViewModel vm = _mapper.Map<SpecificationSummaryViewModel>(specification);
            SpecificationDatasetRelationshipsViewModel viewModel =
                new SpecificationDatasetRelationshipsViewModel(vm);

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> apiResponse =
                await _datasetsApiClient.GetRelationshipsBySpecificationId(specification.Id);

            if (apiResponse.StatusCode != HttpStatusCode.OK || apiResponse.Content == null)
            {
                return null;
            }

            IEnumerable<Task<SpecificationDatasetRelationshipItemViewModel>> viewModelItems =
                apiResponse.Content
                    .OrderBy(m => m.Name)
                    .Select(async m =>
                {
                    Task<bool> hasDataSourceFileToMapTask = GetDataSourceFiles(m.Id);
                    Task<ApiResponse<SpecificationSummary>> referenceSpecTask = m.PublishedSpecificationConfiguration != null ? _specificationsApiClient
                        .GetSpecificationSummaryById(m.PublishedSpecificationConfiguration.SpecificationId) : null;

                    return new SpecificationDatasetRelationshipItemViewModel
                    {
                        DatasetId = m.DatasetId,
                        DatasetName = m.DatasetName,
                        RelationshipType = m.RelationshipType,
                        DefinitionName = m.Definition != null ? m.Definition.Name : string.Empty,
                        DefinitionId = m.Definition != null ? m.Definition.Id : string.Empty,
                        DefinitionDescription = m.Definition?.Description ?? string.Empty,
                        DatasetVersion = m.Version ?? 0,
                        RelationName = m.Name,
                        RelationshipId = m.Id,
                        RelationshipDescription = m.RelationshipDescription,
                        ReferencedSpecificationName = referenceSpecTask != null ?
                            (await referenceSpecTask).Content?.Name : "",
                        IsProviderData = m.IsProviderData,
                        IsLatestVersion = m.IsLatestVersion,
                        LastUpdatedDate = m.LastUpdatedDate,
                        LastUpdatedAuthorName = string.IsNullOrWhiteSpace(m.LastUpdatedAuthor?.Name)
                            ? "Unknown"
                            : m.LastUpdatedAuthor.Name,
                        ConverterEnabled = m.ConverterEnabled,
                        HasDataSourceFileToMap = await hasDataSourceFileToMapTask
                    };
                });

            viewModel.Items = await Task.WhenAll(viewModelItems.ToArraySafe());

            return viewModel;
        }

        private async Task<bool> GetDataSourceFiles(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return false;

            ApiResponse<SelectDatasourceModel> result =
                await _datasetsApiClient.GetDataSourcesByRelationshipId(id);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return result.Content.Datasets != null && result.Content.Datasets.Any();
            }

            return false;
        }
    }
}
