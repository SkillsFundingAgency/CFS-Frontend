namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;

    public interface IDatasetsApiClient
    {
        /// <summary>
        /// Gets a list of all Dataset schema in the system
        /// </summary>
        /// <returns>List of dataset schema</returns>
        Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetDataDefinitions();

        Task<HttpStatusCode> AssignDatasetSchema(AssignDatasetSchemaModel datasetSchema);

        /// <summary>
        /// Gets a paged list of datasets, given the paged query options and search options
        /// </summary>
        /// <param name="filterOptions">Filter Options</param>
        /// <returns>List of Calculations</returns>
        Task<PagedResult<DatasetSearchResultItem>> FindDatasets(SearchFilterRequest filterOptions);

        Task<PagedResult<DatasetDefinitionSearchResultItem>> FindDatasetDefinitions(SearchFilterRequest filterOptions);

        Task<ApiResponse<DatasetDefinition>> GetDatasetDefinitionById(string datasetDefinitionId);

        Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetDatasetDefinitionsByIds(IEnumerable<string> datasetDefinitionIds);

        Task<ValidatedApiResponse<NewDatasetVersionResponseModel>> CreateDataset(CreateNewDatasetModel dataset);

        Task<ValidatedApiResponse<NewDatasetVersionResponseModel>> UpdateDatasetVersion(DatasetVersionUpdateModel dataset);

        Task<ValidatedApiResponse<ValidateDatasetResponseModel>> ValidateDataset(ValidateDatasetModel model);

        Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> GetAssignedDatasetSchemasForSpecification(string specificationId);

        Task<ApiResponse<DatasetSchemasAssigned>> GetAssignedDatasetSchemasForSpecificationAndRelationshipName(string specificationId, string relationshipName);

        Task<ApiResponse<DefinitionSpecificationRelationship>> GetDefinitionSpecificationRelationshipById(string relationshipId);

        Task<ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>>> GetDatasetSpecificationRelationshipsBySpecificationId(string specificationId);

        Task<ApiResponse<SelectDataSourceModel>> GetDatasourcesByRelationshipId(string relationshipId);

        Task<HttpStatusCode> AssignDataSourceVersionToRelationship(AssignDatasetVersion datasetVersion);

        Task<ApiResponse<DownloadDatasourceModel>> GetDatasourceDownload(string datasetId);

        Task<ApiResponse<DatasetVersionResponse>> GetCurrentDatasetVersionByDatasetId(string datasetId);

        Task<ApiResponse<DownloadDatasetSchemaResponse>> GetDatasetSchemaUrl(DownloadDatasetSchemaRequest requestModel);
    }
}
