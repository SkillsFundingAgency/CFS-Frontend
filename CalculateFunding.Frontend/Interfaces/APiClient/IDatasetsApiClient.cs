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
        /// Gets a paged list of datasets, given the paged query options and search options
        /// </summary>
        /// <param name="filterOptions">Filter Options</param>
        /// <returns>List of Calculations</returns>
        Task<PagedResult<DatasetSearchResultItem>> FindDatasets(SearchFilterRequest filterOptions);

        Task<ApiResponse<Reference[]>> GetDefinitions();

        Task<ValidatedApiResponse<CreateNewDatasetResponseModel>> PostDataset(CreateNewDatasetModel dataset);

        Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetListOfDatasetSchemaDefinitions();

        Task<HttpStatusCode> ValidateDataset(ValidateDatasetModel model);
    }
}
