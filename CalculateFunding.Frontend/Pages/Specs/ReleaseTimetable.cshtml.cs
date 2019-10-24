using CalculateFunding.Common.ApiClient.DataSets;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Serilog;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class ReleaseTimetableModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public ReleaseTimetableModel(ISpecsApiClient specsClient, IDatasetsApiClient datasetsClient, ILogger logger, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _logger = logger;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        public SpecificationViewModel Specification { get; set; }

        public bool HasProviderDatasetsAssigned { get; set; }

        public PageBannerOperation PageBanner { get; set; }

        public string DoesUserHavePermissionToApprove { get; set; }

        public async Task<IActionResult> OnGet(string specificationId, PoliciesPageBannerOperationType? operationType, string operationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            Task<ApiResponse<Specification>> specificationResponseTask = _specsClient.GetSpecification(specificationId);

            Task<ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>> datasetSchemaResponseTask = _datasetsClient.GetRelationshipsBySpecificationId(specificationId);

            await TaskHelper.WhenAllAndThrow(specificationResponseTask, datasetSchemaResponseTask);

            ApiResponse<Specification> specificationResponse = specificationResponseTask.Result;

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = datasetSchemaResponseTask.Result;

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

            this.DoesUserHavePermissionToApprove = (await _authorizationHelper.DoesUserHavePermission(User, specificationResponse.Content, SpecificationActionTypes.CanApproveSpecification)).ToString().ToLowerInvariant();

            Specification = _mapper.Map<SpecificationViewModel>(specificationResponse.Content);
            Specification.Calculations = specificationResponse.Content.Calculations.IsNullOrEmpty() ?
                    new List<CalculationViewModel>() :
                    specificationResponse.Content.Calculations.Select(m => _mapper.Map<CalculationViewModel>(m)).ToList();

            HasProviderDatasetsAssigned = datasetSchemaResponse.Content.Any(d => d.IsProviderData);

            return Page();
        }
    }
}