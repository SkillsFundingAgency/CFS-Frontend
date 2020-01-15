using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Common.Identity.Authorization.Models;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class CreateAdditionalCalculationPageModel : PageModel
    {
        private ISpecificationsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;     

        public CreateAdditionalCalculationPageModel(ISpecificationsApiClient specsClient, ICalculationsApiClient calcClient, IMapper mapper,
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

        public CalculationCreateModel CreateModel { get; set; }

        public string SpecificationId { get; set; }

        public string VariablesJson { get; set; }

        public string SpecificationName { get; set; }

        public string DoesUserHavePermissionToApproveOrEdit { get; set; }

        public bool CalculationHasResults { get; set; }

		public Reference FundingPeriod { get; set; }

        public string  FundingStreams { get; set; }

        public async Task<IActionResult> OnGet(string specificationId)
        {
            if (string.IsNullOrWhiteSpace(specificationId))
            {
                return new BadRequestObjectResult("Specification not found");
            }

            ApiResponse<Calculation> calculation = new ApiResponse<Calculation>(HttpStatusCode.Continue);

            SpecificationId = specificationId;

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummaryById(specificationId);

            FundingStreams = JsonConvert.SerializeObject(specificationResponse.Content.FundingStreams);

            FundingPeriod = specificationResponse.Content.FundingPeriod;

            bool doesUserHavePermission = await _authorizationHelper.DoesUserHavePermission(User, FundingStreams, SpecificationActionTypes.CanCreateCalculations);

            DoesUserHavePermissionToApproveOrEdit = doesUserHavePermission.ToString().ToLowerInvariant();

            if (specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
            {
                SpecificationName = specificationResponse.Content.Name;
            }
            else
            {
                SpecificationName = "Unknown";
            }
       
            return Page();
        }
    }
}