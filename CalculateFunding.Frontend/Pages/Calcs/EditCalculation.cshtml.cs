using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Properties;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class EditCalculationPageModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;

        public Specification Specification { get; set; }

        public CalculateFunding.Frontend.Clients.SpecsClient.Models.Calculation SpecsCalculation { get; set; }

        public EditCalculationPageModel(ISpecsApiClient specsClient, ICalculationsApiClient calcClient)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));

            _specsClient = specsClient;
            _calcClient = calcClient;
        }

        public async Task<IActionResult> OnGet(string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult(ErrorMessages.CalculationIdNullOrEmpty);
            }

            Clients.CalcsClient.Models.Calculation calculation = await this._calcClient.GetCalculationById(calculationId);
            if(calculation == null)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFound);
            }

            return Page();
        }
    }
}