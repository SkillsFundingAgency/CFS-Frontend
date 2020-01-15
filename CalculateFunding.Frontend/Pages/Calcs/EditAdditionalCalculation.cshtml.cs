using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class EditAdditionalCalculationPageModel : PageModel
    {
        private ISpecificationsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;
        private readonly IAuthorizationHelper _authorizationHelper;
        private IMapper _mapper;

        public EditAdditionalCalculationPageModel(ISpecificationsApiClient specsClient,
            ICalculationsApiClient calcClient,
            IMapper mapper,
            IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _calcClient = calcClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        public Calculation Calculation { get; set; }

        public CalculationEditModel EditModel { get; set; }

        public string SpecificationId { get; set; }

        public string VariablesJson { get; set; }

        public string SpecificationName { get; set; }

        public string DoesUserHavePermissionToApproveOrEdit { get; set; }

        public bool CalculationHasResults { get; set; }

        public Reference FundingPeriod { get; set; }

        public string FundingStreams { get; set; }

        public async Task<IActionResult> OnGet(string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult("Specification not found");
            }

            ApiResponse<Calculation> calculationResponse = await _calcClient.GetCalculationById(calculationId);

            Calculation = calculationResponse.Content;

            EditModel = new CalculationEditModel
            {
                CalculationId = calculationId,
                Description = Calculation.Description,
                Name = Calculation.Name,
                SourceCode = Calculation.SourceCode,
                SpecificationId = Calculation.SpecificationId,
                ValueType = Calculation.ValueType
            };

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummaryById(Calculation.SpecificationId);

            SpecificationSummary specificationSummary = specificationResponse?.Content;

            if (specificationResponse?.StatusCode == HttpStatusCode.OK)
            {
                SpecificationName = specificationSummary.Name;

                SpecificationId = specificationSummary.Id;

                FundingStreams = JsonConvert.SerializeObject(specificationSummary.FundingStreams);

                FundingPeriod = specificationSummary.FundingPeriod;

                bool doesUserHavePermission = await _authorizationHelper.DoesUserHavePermission(User, SpecificationName, SpecificationActionTypes.CanEditCalculations);

                DoesUserHavePermissionToApproveOrEdit = doesUserHavePermission.ToString().ToLowerInvariant();
            }
            else
            {
                SpecificationName = "Unknown";
            }

            return Page();
        }
    }
}