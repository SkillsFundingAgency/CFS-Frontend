namespace CalculateFunding.Frontend.Clients.DatasetsClient
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Serilog;

    public class DatasetsApiClient : BaseApiClient, IDatasetsApiClient
    {
        public DatasetsApiClient(
            IHttpClientFactory httpClientFactory,
            ILogger logger
            )
            : base(httpClientFactory, HttpClientKeys.Datasets, logger)
        {
        }

        public async Task<PagedResult<DatasetSearchResultItem>> FindDatasets(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<DatasetSearchResultItem>> results = await PostAsync<SearchResults<DatasetSearchResultItem>, SearchQueryRequest>("datasets-search", request);
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
            return GetAsync<IEnumerable<DatasetDefinition>>("get-data-definitions");
        }

        public Task<ValidatedApiResponse<NewDatasetVersionResponseModel>> CreateDataset(CreateNewDatasetModel dataset)
        {
            Guard.ArgumentNotNull(dataset, nameof(dataset));

            return ValidatedPostAsync<NewDatasetVersionResponseModel, CreateNewDatasetModel>("create-new-dataset", dataset);
        }

        public Task<ValidatedApiResponse<NewDatasetVersionResponseModel>> UpdateDatasetVersion(DatasetVersionUpdateModel dataset)
        {
            Guard.ArgumentNotNull(dataset, nameof(dataset));

            return ValidatedPostAsync<NewDatasetVersionResponseModel, DatasetVersionUpdateModel>("dataset-version-update", dataset);
        }

        public Task<ValidatedApiResponse<DatasetCreateUpdateResponseModel>> ValidateDataset(ValidateDatasetModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            return ValidatedPostAsync<ValidateDatasetResponseModel, ValidateDatasetModel>("validate-dataset", model, timeout: TimeSpan.FromSeconds(300));
        }

        public Task<HttpStatusCode> AssignDatasetSchema(AssignDatasetSchemaModel datasetSchema)
        {
            Guard.ArgumentNotNull(datasetSchema, nameof(datasetSchema));

            return PostAsync("create-definitionspecification-relationship", datasetSchema);
        }

        public Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> GetAssignedDatasetSchemasForSpecification(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return GetAsync<IEnumerable<DatasetSchemasAssigned>>($"get-definitions-relationships?specificationId={specificationId}");
        }

        public Task<ApiResponse<DatasetSchemasAssigned>> GetAssignedDatasetSchemasForSpecificationAndRelationshipName(string specificationId, string relationshipName)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return GetAsync<DatasetSchemasAssigned>($"get-definition-relationship-by-specificationid-name?specificationId={specificationId}&name={relationshipName}");
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

            return GetAsync<SelectDataSourceModel>($"get-datasources-by-relationshipid?relationshipId={relationshipId}");
        }

        public Task<HttpStatusCode> AssignDataSourceVersionToRelationship(AssignDatasetVersion datasetVersion)
        {
            Guard.ArgumentNotNull(datasetVersion, nameof(datasetVersion));

            return PostAsync("assign-datasource-to-relationship", datasetVersion);
        }

        public Task<ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>>> GetDatasetSpecificationRelationshipsBySpecificationId(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return GetAsync<IEnumerable<DatasetSpecificationRelationshipModel>>($"get-relationships-by-specificationId?specificationId={specificationId}");
        }

        public Task<ApiResponse<DatasetDefinition>> GetDatasetDefinitionById(string datasetDefinitionId)
        {
            return GetAsync<DatasetDefinition>($"get-dataset-definition-by-id?datasetDefinitionId={datasetDefinitionId}");
        }

        public Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetDatasetDefinitionsByIds(IEnumerable<string> datasetDefinitionIds)
        {
            if (datasetDefinitionIds.IsNullOrEmpty())
            {
                return Task.FromResult(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, Enumerable.Empty<DatasetDefinition>()));
            }

            return PostAsync<IEnumerable<DatasetDefinition>, IEnumerable<string>>("get-dataset-definitions-by-ids", datasetDefinitionIds);
        }

        public Task<ApiResponse<DownloadDatasourceModel>> GetDatasourceDownload(string datasetId)
        {
            if (string.IsNullOrWhiteSpace(datasetId))
            {
                throw new ArgumentNullException(nameof(datasetId), "Dataset Id for dataset download is null");
            }
            return GetAsync<DownloadDatasourceModel>($"download-dataset-file?datasetId={datasetId}");
        }

        public Task<ApiResponse<DownloadDatasetSchemaResponse>> GetDatasetSchemaUrl(DownloadDatasetSchemaRequest requestModel)
        {
            Guard.ArgumentNotNull(requestModel, nameof(requestModel));

            return PostAsync<DownloadDatasetSchemaResponse, DownloadDatasetSchemaRequest>("get-schema-download-url", requestModel);
        }

        public Task<ApiResponse<DatasetVersionResponse>> GetCurrentDatasetVersionByDatasetId(string datasetId)
        {
            Guard.IsNullOrWhiteSpace(datasetId, nameof(datasetId));

            return GetAsync<DatasetVersionResponse>($"get-currentdatasetversion-by-datasetid?datasetId={datasetId}");
        }

        public async Task<PagedResult<DatasetDefinitionSearchResultItem>> FindDatasetDefinitions(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<DatasetDefinitionSearchResultItem>> results = await PostAsync<SearchResults<DatasetDefinitionSearchResultItem>, SearchQueryRequest>("dataset-definitions-search", request);
            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<DatasetDefinitionSearchResultItem> result = new SearchPagedResult<DatasetDefinitionSearchResultItem>(filterOptions, results.Content.TotalCount)
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
    }
}
