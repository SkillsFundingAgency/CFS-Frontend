namespace CalculateFunding.Frontend.Pages.Calcs
{
    using System.Threading.Tasks;
    using AutoMapper;
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

        public CalculationViewModel Calculation { get; set; }

        public CalculationEditViewModel EditModel { get; set; }

        public string SpecificationId { get; set; }

        public EditCalculationPageModel(ISpecsApiClient specsClient, ICalculationsApiClient calcClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsClient;
            _calcClient = calcClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGet(string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult(ErrorMessages.CalculationIdNullOrEmpty);
            }

            ApiResponse<Clients.CalcsClient.Models.Calculation> calculation = await _calcClient.GetCalculationById(calculationId);


            if (calculation == null || calculation.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInCalcsService);
            }

            ApiResponse<Clients.SpecsClient.Models.Calculation> specCalculation = await _specsClient.GetCalculationById(calculation.Content.SpecificationId, calculation.Content.CalculationSpecification.Id);
            if (specCalculation == null || specCalculation.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInSpecsService);
            }

            Calculation = _mapper.Map<CalculationViewModel>(calculation.Content);
            Calculation.Description = specCalculation.Content.Description;
            SpecificationId = calculation.Content.SpecificationId;

            EditModel = _mapper.Map<CalculationEditViewModel>(calculation.Content);

            return Page();
        }
    }
}