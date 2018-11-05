namespace CalculateFunding.Frontend.Pages.Calcs
{
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Properties;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class EditCalculationPageModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public EditCalculationPageModel(ISpecsApiClient specsClient, ICalculationsApiClient calcClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
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

        public CalculationViewModel Calculation { get; set; }

        public CalculationEditViewModel EditModel { get; set; }

        public string SpecificationId { get; set; }

        public string VariablesJson { get; set; }

        public string SpecificationName { get; set; }

        public async Task<IActionResult> OnGet(string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult(ErrorMessages.CalculationIdNullOrEmpty);
            }

            ApiResponse<Calculation> calculation = await _calcClient.GetCalculationById(calculationId);

            if (calculation == null || calculation.StatusCode != HttpStatusCode.OK)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInCalcsService);
            }

            if (!await _authorizationHelper.DoesUserHavePermission(User, calculation.Content, SpecificationActionTypes.CanEditCalculations))
            {
                return new ForbidResult();
            }

            ApiResponse<Clients.SpecsClient.Models.CalculationCurrentVersion> specCalculation = await _specsClient.GetCalculationById(calculation.Content.SpecificationId, calculation.Content.CalculationSpecification.Id);
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
            return Page();
        }
    }
}