using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.Clients;
using AutoMapper;
using CalculateFunding.Frontend.ViewModels.Calculations;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class ComparePageModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;

        public CalculationViewModel Calculation { get; set; }

        public IEnumerable<CalculationVersionViewModel> Calculations { get; set; }

        public ComparePageModel(ISpecsApiClient specsClient, ICalculationsApiClient calcClient, IMapper mapper)
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

            ApiResponse<Clients.CalcsClient.Models.Calculation> calculationResponse = await _calcClient.GetCalculationById(calculationId);
            if (calculationResponse == null)
            {
                return new StatusCodeResult(500);
            }

            Clients.CalcsClient.Models.Calculation calculation = calculationResponse.Content;

            if (calculation == null)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInCalcsService);
            }

            ApiResponse<Clients.SpecsClient.Models.Calculation> specCalculation = await _specsClient.GetCalculationById(calculation.SpecificationId, calculation.CalculationSpecification.Id);

            if (specCalculation == null || specCalculation.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInSpecsService);
            }

            ApiResponse<IEnumerable<CalculationVersion>> calculationAllVersionsResponse = await _calcClient.GetAllVersionsByCalculationId(calculationId);
            if (calculationAllVersionsResponse == null)
            {
                return new StatusCodeResult(500);
            }

            List<CalculationVersionViewModel> calculationVersions = new List<CalculationVersionViewModel>();
            foreach (CalculationVersion calculationVersion in calculationAllVersionsResponse.Content.OrderByDescending(c=>c.Version))
            {
                calculationVersions.Add(_mapper.Map<CalculationVersionViewModel>(calculationVersion));
            }

            Calculations = calculationVersions.AsEnumerable();

            Calculation = _mapper.Map<CalculationViewModel>(calculation);
            Calculation.Description = specCalculation.Content.Description;

            return Page();

        }


    }
}