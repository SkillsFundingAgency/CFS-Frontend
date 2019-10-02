using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class AdditionalCalculationsModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly ICalculationSearchService _calculationSearchService;

        public AdditionalCalculationsModel(
            ISpecsApiClient specsClient, 
            IDatasetsApiClient datasetsClient, 
            IMapper mapper,
            ICalculationSearchService calculationSearchService)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(calculationSearchService, nameof(calculationSearchService));

            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _mapper = mapper;
            _calculationSearchService = calculationSearchService;
        }

        public SpecificationViewModel Specification { get; set; }

        public bool HasProviderDatasetsAssigned { get; set; }

        public string InitialSearchResults { get; set; }

        [BindProperty]
        public string SearchTerm { get; set; }

        public CalculationSearchResultViewModel CalculationSearchResults { get; set; }

        public async Task<IActionResult> OnGet(string specificationId, string searchTerm = null, int? pageNumber = null)
        {
            if (string.IsNullOrWhiteSpace(specificationId))
            {
                return new BadRequestObjectResult(ErrorMessages.SpecificationIdNullOrEmpty);
            }

            Task<ApiResponse<Specification>> specificationResponseTask = _specsClient.GetSpecification(specificationId);
            Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> datasetSchemaResponseTask = _datasetsClient.GetAssignedDatasetSchemasForSpecification(specificationId);

            await TaskHelper.WhenAllAndThrow(specificationResponseTask, datasetSchemaResponseTask);

            ApiResponse<Specification> specificationResponse = specificationResponseTask.Result;
            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = datasetSchemaResponseTask.Result;

            if (specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Specification not found");
            }

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                return new InternalServerErrorResult($"Failed to fetch specification for id '{specificationId}'");
            }

            if (datasetSchemaResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Data schemas not found");
            }

            if (datasetSchemaResponse.StatusCode != HttpStatusCode.OK)
            {
                return new InternalServerErrorResult($"Failed to fetch data schemas for specification with id '{specificationId}'");
            }

            Specification = _mapper.Map<SpecificationViewModel>(specificationResponse.Content);

            HasProviderDatasetsAssigned = datasetSchemaResponse.Content.Any(d => d.IsSetAsProviderData);

            CalculationSearchResults = await _calculationSearchService.PerformSearch(new SearchRequestViewModel
            {
                Filters = new Dictionary<string, string[]>
                {
                    { "CalculationType", new string[]{ "Additional" } },
                    { "SpecificationId", new string[]{ specificationId } }
                },
                PageNumber = pageNumber ?? 1,
                SearchTerm = searchTerm,
                PageSize = 20
            });

            InitialSearchResults = JsonConvert.SerializeObject(CalculationSearchResults, Formatting.Indented, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                StringEscapeHandling = StringEscapeHandling.EscapeHtml
            });

            return Page();
        }
    }
}