namespace CalculateFunding.Frontend.Clients.DatasetsClient
{
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Core;
    using CalculateFunding.Frontend.Interfaces.Core.Logging;
    using Microsoft.Extensions.Options;
    using Serilog;

    public class DatasetsApiClient : AbstractApiClient, IDatasetsApiClient
    {
        private string _datasetsPath = "datasets";

        public DatasetsApiClient(
            IOptionsSnapshot<ApiOptions> options,
            IHttpClient httpClient,
            ILogger logger,
            ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
        {
            Guard.ArgumentNotNull(options, nameof(options));

            _datasetsPath = options.Value.DatasetsPath ?? "datasets";
        }

        public async Task<PagedResult<DatasetSearchResultItem>> FindDatasets(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<DatasetSearchResultItem>> results = await PostAsync<SearchResults<DatasetSearchResultItem>, SearchQueryRequest>($"{_datasetsPath}/datasets-search", request);
            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<DatasetSearchResultItem> result = new SearchPagedResult<DatasetSearchResultItem>(filterOptions, results.Content.TotalCount)
                {
                    Items = results.Content.Results,
                    Facets = results.Content.Facets,
                };

                return result;
            }
            else
            {
                return null;
            }
        }

        public Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetDataDefinitions()
        {
            return GetAsync<IEnumerable<DatasetDefinition>>($"{_datasetsPath}/get-data-definitions");
        }

        public Task<ApiResponse<Reference[]>> GetDefinitions()
        {
            var definitions = new[]
            {
                new Reference("9183", "14/15")
            };

            ApiResponse<Reference[]> response = new ApiResponse<Reference[]>(HttpStatusCode.OK, definitions);

            return Task.FromResult(response);
        }

        public Task<ValidatedApiResponse<CreateNewDatasetResponseModel>> PostDataset(CreateNewDatasetModel dataset)
        {
            Guard.ArgumentNotNull(dataset, nameof(dataset));

            return ValidatedPostAsync<CreateNewDatasetResponseModel, CreateNewDatasetModel>($"{_datasetsPath}/create-new-dataset", dataset);
        }

        public Task<HttpStatusCode> ValidateDataset(ValidateDatasetModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            return PostAsync($"{_datasetsPath}/validate-dataset", model);
        }

        public Task<HttpStatusCode> AssignDatasetSchema(AssignDatasetSchemaModel datasetSchema)
        {
            Guard.ArgumentNotNull(datasetSchema, nameof(datasetSchema));

            return PostAsync($"{_datasetsPath}/create-definitionspecification-relationship", datasetSchema);
        }

        public Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> GetAssignedDatasetSchemasForSpecification(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return GetAsync<IEnumerable<DatasetSchemasAssigned>>($"{_datasetsPath}/get-definitions-relationships?specificationId={specificationId}");
        }

        public Task<ApiResponse<DatasetSchemasAssigned>> GetAssignedDatasetSchemasForSpecificationAndRelationshipName(string specificationId, string relationshipName)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return GetAsync<DatasetSchemasAssigned>($"{_datasetsPath}/get-definition-relationship-by-specificationid-name?specificationId={specificationId}&name={relationshipName}");
        }

        public Task<ApiResponse<DefinitionSpecificationRelationship>> GetDefinitionSpecificationRelationshipById(string relationshipId)
        {
            DefinitionSpecificationRelationship result = new DefinitionSpecificationRelationship()
            {
                DatasetDefinition = new Reference("1", "Dataset definition name"),
                Description = "Description of the relationship",
                Id = "1",
                Name = "Test mocked relationship",
                Specification = new Reference("SpecificationID", "SpecificationName"),
            };

            return Task.FromResult(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK, result));
        }

        public Task<ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>>> GetDatasetSpecificationRelationshipsBySpecificationId(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return GetAsync<IEnumerable<DatasetSpecificationRelationshipModel>>($"{_datasetsPath}/get-relationships-by-specificationId?specificationId={specificationId}");
        }
    }
}
