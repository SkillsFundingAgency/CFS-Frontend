namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;

    public class UpdateDatasetPageModel : PageModel
    {
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public DatasetVersionFullViewModel DatasetVersion { get; set; }

        public string Comment { get; set; }

        public string Description { get; set; }

        public DatasetUpdateViewModel UpdateViewModel { get; set; }

        public UpdateDatasetPageModel(IDatasetsApiClient datasetsApiClient, ILogger logger, IMapper mapper)
        {
            Guard.ArgumentNotNull(datasetsApiClient, nameof(datasetsApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _datasetsClient = datasetsApiClient;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGetAsync(string datasetId)
        {
            Guard.IsNullOrWhiteSpace(datasetId, nameof(datasetId));

            ApiResponse<DatasetVersionResponse> datasetVersionResponse = await _datasetsClient.GetCurrentDatasetVersionByDatasetId(datasetId);
            if (datasetVersionResponse == null)
            {
                return new InternalServerErrorResult("Datasets verion API response was null");
            }

            if (datasetVersionResponse.StatusCode != HttpStatusCode.OK)
            {
                return new InternalServerErrorResult($"Datasets version API call was not OK, returned '{datasetVersionResponse.StatusCode}'");
            }

            if (datasetVersionResponse.Content == null)
            {
                return new InternalServerErrorResult("Datasets version API content was null");
            }

            DatasetVersion = _mapper.Map<DatasetVersionFullViewModel>(datasetVersionResponse.Content);

            return Page();
        }
    }
}