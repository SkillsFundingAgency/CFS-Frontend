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
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class ComparePageModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;

        public ComparePageModel(ISpecsApiClient specsClient, ICalculationsApiClient calcClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsClient;
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

            ApiResponse<Clients.SpecsClient.Models.CalculationCurrentVersion> specCalculation = await _specsClient.GetCalculationById(calculation.SpecificationId, calculation.Id);

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