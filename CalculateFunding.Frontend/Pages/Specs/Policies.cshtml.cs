namespace CalculateFunding.Frontend.Pages.Specs
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;

    public class PoliciesModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public PoliciesModel(ISpecsApiClient specsClient, IDatasetsApiClient datasetsClient, ILogger logger, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _logger = logger;
            _mapper = mapper;
        }

        public SpecificationViewModel Specification { get; set; }

        public bool HasProviderDatasetsAssigned { get; set; }

        public async Task<IActionResult> OnGet(string specificationId)
        {
            Task<ApiResponse<Specification>> specificationResponseTask = _specsClient.GetSpecification(specificationId);
            Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> datasetSchemaResponseTask = _datasetsClient.GetAssignedDatasetSchemasForSpecification(specificationId);

            await TaskHelper.WhenAllAndThrow(specificationResponseTask, datasetSchemaResponseTask);

            ApiResponse<Specification> specificationResponse = specificationResponseTask.Result;
            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = datasetSchemaResponseTask.Result;

            if (specificationResponse == null)
            {
                _logger.Warning("Specification API Request came back null for Specification ID = '{specificationId}'", specificationId);
                return new ObjectResult("Specification Lookup API Failed and returned null")
                {
                    StatusCode = 500
                };
            }

            if (datasetSchemaResponse == null)
            {
                _logger.Warning("Dataset Schema Response API Request came back null for Specification ID = '{specificationId}'", specificationId);
                return new ObjectResult("Datasets Lookup API Failed and returned null")
                {
                    StatusCode = 500
                };
            }

            if (specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Specification not found");
            }

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Warning("Dataset Schema Response API Request came back with '{statusCode}' for Specification ID = '{specificationId}'", specificationResponse.StatusCode, specificationId);
                return new ObjectResult("Specification Lookup API Failed")
                {
                    StatusCode = 500
                };
            }

            if (datasetSchemaResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Warning("Dataset Schema Response API Request came back with '{statusCode} for Specification ID = '{specificationId}'", datasetSchemaResponse.StatusCode, specificationId);
                return new ObjectResult("Datasets Schema API Failed")
                {
                    StatusCode = 500
                };
            }

            this.Specification = _mapper.Map<SpecificationViewModel>(specificationResponse.Content);

            HasProviderDatasetsAssigned = datasetSchemaResponse.Content.Any(d => d.IsSetAsProviderData);

            return Page();
        }
    }
}