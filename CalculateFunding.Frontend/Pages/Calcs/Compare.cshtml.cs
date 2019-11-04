using System.Collections.Generic;
using System.Linq;
using System.Net;
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
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;

        public ComparePageModel(ICalculationsApiClient calcClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _calcClient = calcClient;
            _mapper = mapper;
        }

        public CalculationViewModel Calculation { get; set; }

        public IEnumerable<CalculationVersionsCompareModel> Calculations { get; set; }

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

            // TODO: Are we sure that GetCalculationById should be called twice? If not I think I should remove below second call
            ApiResponse<Calculation> specCalculation = await _calcClient.GetCalculationById(calculation.Id);

            if (specCalculation == null || specCalculation.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInSpecsService);
            }

            ApiResponse<IEnumerable<CalculationVersion>> calculationAllVersionsResponse = await _calcClient.GetAllVersionsByCalculationId(calculationId);
            if (calculationAllVersionsResponse == null)
            {
                return new InternalServerErrorResult(null);
            }

            List<CalculationVersionsCompareModel> calculationVersions = new List<CalculationVersionsCompareModel>();
            foreach (CalculationVersion calculationVersion in calculationAllVersionsResponse.Content)
            {
                calculationVersions.Add(_mapper.Map<CalculationVersionsCompareModel>(calculationVersion));
            }

            Calculations = calculationVersions.AsEnumerable().OrderByDescending(c => c.Versions.FirstOrDefault());

            Calculation = _mapper.Map<CalculationViewModel>(calculation);
            Calculation.Description = specCalculation.Content.Description;

            return Page();
        }
    }
}