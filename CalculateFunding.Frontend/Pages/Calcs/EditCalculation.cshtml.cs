using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;


namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class EditCalculationPageModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private ISpecificationAuthorizationEntity _specificationAuthorizationEntity;
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly IResultsApiClient _resultsApiClient;

        public EditCalculationPageModel(ISpecsApiClient specsClient, ICalculationsApiClient calcClient,
            IMapper mapper, IFeatureToggle features, IAuthorizationHelper authorizationHelper, IResultsApiClient resultsApiClient, ISpecificationAuthorizationEntity specificationAuthorizationEntity)
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
            _specificationAuthorizationEntity = specificationAuthorizationEntity;
            ShouldNewEditCalculationPageBeEnabled = features.IsNewEditCalculationPageEnabled();
        }

        public bool ShouldNewEditCalculationPageBeEnabled { get; private set; }

        public CalculationViewModel Calculation { get; set; }

        public CalculationEditViewModel EditModel { get; set; }

        public string SpecificationId { get; set; }

        public string VariablesJson { get; set; }

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

            bool doesUserHavePermission = await _authorizationHelper.DoesUserHavePermission(User, _specificationAuthorizationEntity, SpecificationActionTypes.CanEditCalculations);

            DoesUserHavePermissionToApproveOrEdit = doesUserHavePermission.ToString().ToLowerInvariant();

            ApiResponse<Clients.SpecsClient.Models.CalculationCurrentVersion> specCalculation = await _specsClient.GetCalculationById(calculation.Content.SpecificationId, calculation.Content.Id);
            if (specCalculation == null || specCalculation.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInSpecsService);
            }

            Calculation = _mapper.Map<CalculationViewModel>(calculation.Content);
            Calculation.Description = specCalculation.Content.Description;
            SpecificationId = calculation.Content.SpecificationId;
            EditModel = _mapper.Map<CalculationEditViewModel>(calculation.Content);

            ApiResponse<Clients.SpecsClient.Models.SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummary(SpecificationId);

            if (specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
            {
                SpecificationName = specificationResponse.Content.Name;
            }
            else
            {
                SpecificationName = "Unknown";
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