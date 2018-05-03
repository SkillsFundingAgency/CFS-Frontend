namespace CalculateFunding.Frontend.Clients.DatasetsClient
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
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

        public Task<ValidatedApiResponse<NewDatasetVersionResponseModel>> CreateDataset(CreateNewDatasetModel dataset)
        {
            Guard.ArgumentNotNull(dataset, nameof(dataset));

            return ValidatedPostAsync<NewDatasetVersionResponseModel, CreateNewDatasetModel>($"{_datasetsPath}/create-new-dataset", dataset);
        }

        public Task<ValidatedApiResponse<NewDatasetVersionResponseModel>> UpdateDatasetVersion(DatasetVersionUpdateModel dataset)
        {
            Guard.ArgumentNotNull(dataset, nameof(dataset));

            return ValidatedPostAsync<NewDatasetVersionResponseModel, DatasetVersionUpdateModel>($"{_datasetsPath}/dataset-version-update", dataset);
        }

        public Task<ApiResponse<ValidateDatasetResponseModel>> ValidateDataset(ValidateDatasetModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            return PostAsync<ValidateDatasetResponseModel, ValidateDatasetModel>($"{_datasetsPath}/validate-dataset", model);
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

        public Task<ApiResponse<SelectDataSourceModel>> GetDatasourcesByRelationshipId(string relationshipId)
        {
            Guard.ArgumentNotNull(relationshipId, nameof(relationshipId));

            return GetAsync<SelectDataSourceModel>($"{_datasetsPath}/get-datasources-by-relationshipid?relationshipId={relationshipId}");
        }

        public Task<HttpStatusCode> AssignDataSourceVersionToRelationship(AssignDatasetVersion datasetVersion)
        {
            Guard.ArgumentNotNull(datasetVersion, nameof(datasetVersion));

            return PostAsync($"{_datasetsPath}/assign-datasource-to-relationship", datasetVersion);
        }

        public Task<ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>>> GetDatasetSpecificationRelationshipsBySpecificationId(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return GetAsync<IEnumerable<DatasetSpecificationRelationshipModel>>($"{_datasetsPath}/get-relationships-by-specificationId?specificationId={specificationId}");
        }

        public Task<ApiResponse<DatasetDefinition>> GetDatasetDefinitionById(string datasetDefinitionId)
        {
            return GetAsync<DatasetDefinition>($"{_datasetsPath}/get-dataset-definition-by-id?datasetDefinitionId={datasetDefinitionId}");
        }

        public Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetDatasetDefinitionsByIds(IEnumerable<string> datasetDefinitionIds)
        {
            if (datasetDefinitionIds.IsNullOrEmpty())
            {
                return Task.FromResult(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, Enumerable.Empty<DatasetDefinition>()));
            }

            return PostAsync<IEnumerable<DatasetDefinition>, IEnumerable<string>>($"{_datasetsPath}/get-dataset-definitions-by-ids", datasetDefinitionIds);
        }

        public Task<ApiResponse<DownloadDatasourceModel>> GetDatasourceDownload(string datasetId)
        {
            if(string.IsNullOrWhiteSpace(datasetId))
            {
                throw new ArgumentNullException( nameof(datasetId), "Dataset Id for dataset download is null");
            }
            return GetAsync<DownloadDatasourceModel>($"{_datasetsPath}/download-dataset-file?datasetId={datasetId}");
        }

        public Task<ApiResponse<DatasetVersionResponse>> GetCurrentDatasetVersionByDatasetId(string datasetId)
        {
            Guard.IsNullOrWhiteSpace(datasetId, nameof(datasetId));

            return GetAsync<DatasetVersionResponse>($"{_datasetsPath}/get-currentdatasetversion-by-datasetid?datasetId={datasetId}");
        }
    }
}
