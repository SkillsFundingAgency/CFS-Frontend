using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class ComparePageModel : PageModel
    {
        private readonly ICalculationsApiClient _calcClient;
        private readonly IMapper _mapper;

        public ComparePageModel(ICalculationsApiClient calcClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _calcClient = calcClient;
            _mapper = mapper;
        }

        public CalculationViewModel Calculation { get; set; }

        public IEnumerable<CalculationVersionViewModel> Calculations { get; set; }

        public async Task<IActionResult> OnGet(string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult(ErrorMessages.CalculationIdNullOrEmpty);
            }

            ApiResponse<Calculation> calculationResponse = await _calcClient.GetCalculationById(calculationId);
            
            if (calculationResponse == null)
            {
                return new InternalServerErrorResult(ErrorMessages.CalculationNotFoundInCalcsService);
            }

            Calculation calculation = calculationResponse.Content;

            if (calculation == null)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInCalcsService);
            }
            
            ApiResponse<IEnumerable<CalculationVersion>> calculationAllVersionsResponse = await _calcClient.GetAllVersionsByCalculationId(calculationId);
            
            if (calculationAllVersionsResponse?.Content == null)
            {
                return new InternalServerErrorResult($"Unable to locate calculation versions for calculation id {calculationId}");
            }

            Calculations = calculationAllVersionsResponse.Content
	            .OrderByDescending(_ => _.Version)
	            .Select(calculationVersion => _mapper.Map<CalculationVersionViewModel>(calculationVersion));
            
            Calculation = _mapper.Map<CalculationViewModel>(calculation);
            Calculation.Description = calculation.Description;

            return Page();
        }
    }
}