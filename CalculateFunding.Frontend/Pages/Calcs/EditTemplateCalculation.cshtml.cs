using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Calculation = CalculateFunding.Common.ApiClient.Calcs.Models.Calculation;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class EditTemplateCalculationPageModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly IResultsApiClient _resultsApiClient;


        public EditTemplateCalculationPageModel(ISpecsApiClient specsClient,
            ICalculationsApiClient calcClient,
            IMapper mapper,
            IFeatureToggle features,
            IAuthorizationHelper authorizationHelper,
            IResultsApiClient resultsApiClient)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(features, nameof(features));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));

            _specsClient = specsClient;
            _calcClient = calcClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
            _resultsApiClient = resultsApiClient;
            ShouldNewEditCalculationPageBeEnabled = features.IsNewEditCalculationPageEnabled();
        }

        public bool ShouldNewEditCalculationPageBeEnabled { get; private set; }

        public CalculationViewModel Calculation { get; set; }

        public CalculationEditViewModel EditModel { get; set; }

        public string SpecificationId { get; set; }

        public string FundingStreamName { get; set; }

        public string FundingStreamId { get; set; }

        public string FundingPeriodName { get; set; }

        public string SpecificationName { get; set; }

        public string DoesUserHavePermissionToApproveOrEdit { get; set; }

        public bool CalculationHasResults { get; set; }

        public async Task<IActionResult> OnGet(string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult(ErrorMessages.CalculationIdNullOrEmpty);
            }

            ViewData["GreyBackground"] = ShouldNewEditCalculationPageBeEnabled.ToString();

            ApiResponse<Calculation> calculation = await _calcClient.GetCalculationById(calculationId);

            if (calculation == null || calculation.StatusCode != HttpStatusCode.OK)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInCalcsService);
            }

            SpecificationId = calculation.Content.SpecificationId;

            bool doesUserHavePermission = await _authorizationHelper.DoesUserHavePermission(User, SpecificationId, SpecificationActionTypes.CanEditCalculations);

            DoesUserHavePermissionToApproveOrEdit = doesUserHavePermission.ToString().ToLowerInvariant();

            Calculation = _mapper.Map<CalculationViewModel>(calculation.Content.Current);


            EditModel = _mapper.Map<CalculationEditViewModel>(calculation.Content);

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummary(SpecificationId);

            SpecificationName = (specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
                ? specificationResponse.Content.Name
                : "Unknown";

            if (specificationResponse != null)
            {
                FundingStreamName = specificationResponse.Content.FundingStreams.FirstOrDefault()?.Name;
                FundingStreamId = specificationResponse.Content.FundingStreams.FirstOrDefault()?.Id;
                FundingPeriodName = specificationResponse.Content.FundingPeriod.Name;
            }

            if (ShouldNewEditCalculationPageBeEnabled)
            {
                ApiResponse<bool> hasCalculationResponse = await _resultsApiClient.HasCalculationResults(Calculation.Id);

                if (hasCalculationResponse != null && hasCalculationResponse.StatusCode == HttpStatusCode.OK)
                {
                    CalculationHasResults = hasCalculationResponse.Content;
                }
            }
            return Page();
        }
    }
}