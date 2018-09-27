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
    using Microsoft.AspNetCore.Http;
    using Serilog;

    public class DatasetsApiClient : BaseApiClient, IDatasetsApiClient
    {
        public DatasetsApiClient(
            IHttpClientFactory httpClientFactory,
            ILogger logger,
            IHttpContextAccessor contextAccessor
            )
            : base(httpClientFactory, HttpClientKeys.Datasets, logger, contextAccessor)
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

        public async Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetDataDefinitions()
        {
            return await GetAsync<IEnumerable<DatasetDefinition>>("get-data-definitions");
        }

        public async Task<ValidatedApiResponse<NewDatasetVersionResponseModel>> CreateDataset(CreateNewDatasetModel dataset)
        {
            Guard.ArgumentNotNull(dataset, nameof(dataset));

            return await ValidatedPostAsync<NewDatasetVersionResponseModel, CreateNewDatasetModel>("create-new-dataset", dataset);
        }

        public async Task<ValidatedApiResponse<NewDatasetVersionResponseModel>> UpdateDatasetVersion(DatasetVersionUpdateModel dataset)
        {
            Guard.ArgumentNotNull(dataset, nameof(dataset));

            return await ValidatedPostAsync<NewDatasetVersionResponseModel, DatasetVersionUpdateModel>("dataset-version-update", dataset);
        }

        public async Task<ValidatedApiResponse<DatasetValidationStatusModel>> ValidateDataset(ValidateDatasetModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            return await ValidatedPostAsync<DatasetValidationStatusModel, ValidateDatasetModel>("validate-dataset", model, timeout: TimeSpan.FromSeconds(300));
        }

        public async Task<HttpStatusCode> AssignDatasetSchema(AssignDatasetSchemaModel datasetSchema)
        {
            Guard.ArgumentNotNull(datasetSchema, nameof(datasetSchema));

            return await PostAsync("create-definitionspecification-relationship", datasetSchema);
        }

        public async Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> GetAssignedDatasetSchemasForSpecification(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return await GetAsync<IEnumerable<DatasetSchemasAssigned>>($"get-definitions-relationships?specificationId={specificationId}");
        }

        public async Task<ApiResponse<DatasetSchemasAssigned>> GetAssignedDatasetSchemasForSpecificationAndRelationshipName(string specificationId, string relationshipName)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return await GetAsync<DatasetSchemasAssigned>($"get-definition-relationship-by-specificationid-name?specificationId={specificationId}&name={relationshipName}");
        }

        public async Task<ApiResponse<DefinitionSpecificationRelationship>> GetDefinitionSpecificationRelationshipById(string relationshipId)
        {
            DefinitionSpecificationRelationship result = new DefinitionSpecificationRelationship()
            {
                DatasetDefinition = new Reference("1", "Dataset definition name"),
                Description = "Description of the relationship",
                Id = "1",
                Name = "Test mocked relationship",
                Specification = new Reference("SpecificationID", "SpecificationName"),
            };

            return await Task.FromResult(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK, result));
        }

        public async Task<ApiResponse<SelectDataSourceModel>> GetDatasourcesByRelationshipId(string relationshipId)
        {
            Guard.ArgumentNotNull(relationshipId, nameof(relationshipId));

            return await GetAsync<SelectDataSourceModel>($"get-datasources-by-relationshipid?relationshipId={relationshipId}");
        }

        public async Task<HttpStatusCode> AssignDataSourceVersionToRelationship(AssignDatasetVersion datasetVersion)
        {
            Guard.ArgumentNotNull(datasetVersion, nameof(datasetVersion));

            return await PostAsync("assign-datasource-to-relationship", datasetVersion);
        }

        public async Task<ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>>> GetDatasetSpecificationRelationshipsBySpecificationId(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            return await GetAsync<IEnumerable<DatasetSpecificationRelationshipModel>>($"get-relationships-by-specificationId?specificationId={specificationId}");
        }

        public async Task<ApiResponse<DatasetDefinition>> GetDatasetDefinitionById(string datasetDefinitionId)
        {
            return await GetAsync<DatasetDefinition>($"get-dataset-definition-by-id?datasetDefinitionId={datasetDefinitionId}");
        }

        public async Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetDatasetDefinitionsByIds(IEnumerable<string> datasetDefinitionIds)
        {
            if (datasetDefinitionIds.IsNullOrEmpty())
            {
                return await Task.FromResult(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, Enumerable.Empty<DatasetDefinition>()));
            }

            return await PostAsync<IEnumerable<DatasetDefinition>, IEnumerable<string>>("get-dataset-definitions-by-ids", datasetDefinitionIds);
        }

        public async Task<ApiResponse<DownloadDatasourceModel>> GetDatasourceDownload(string datasetId)
        {
            if (string.IsNullOrWhiteSpace(datasetId))
            {
                throw new ArgumentNullException(nameof(datasetId), "Dataset Id for dataset download is null");
            }
            return await GetAsync<DownloadDatasourceModel>($"download-dataset-file?datasetId={datasetId}");
        }

        public async Task<ApiResponse<DownloadDatasetSchemaResponse>> GetDatasetSchemaUrl(DownloadDatasetSchemaRequest requestModel)
        {
            Guard.ArgumentNotNull(requestModel, nameof(requestModel));

            return await PostAsync<DownloadDatasetSchemaResponse, DownloadDatasetSchemaRequest>("get-schema-download-url", requestModel);
        }

        public async Task<ApiResponse<DatasetVersionResponse>> GetCurrentDatasetVersionByDatasetId(string datasetId)
        {
            Guard.IsNullOrWhiteSpace(datasetId, nameof(datasetId));

            return await GetAsync<DatasetVersionResponse>($"get-currentdatasetversion-by-datasetid?datasetId={datasetId}");
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

        public async Task<ApiResponse<DatasetValidationStatusModel>> GetDatasetValidateStatus(string operationId)
        {
            Guard.IsNullOrWhiteSpace(operationId, nameof(operationId));

            return await GetAsync<DatasetValidationStatusModel>($"get-dataset-validate-status?operationId={operationId}");
        }
    }
}
