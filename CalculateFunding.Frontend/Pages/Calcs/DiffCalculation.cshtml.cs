namespace CalculateFunding.Frontend.Pages.Calcs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Properties;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class DiffCalculationModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;

        public DiffCalculationModel(ISpecsApiClient specsClient, ICalculationsApiClient calcClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsClient;
            _calcClient = calcClient;
            _mapper = mapper;
        }

        public CalculationVersionViewModel LeftCalcualationDiffModel { get; set; }

        public CalculationVersionViewModel RightCalculationDiffModel { get; set; }

        public IEnumerable<Calculation> Calculation { get; set; }

        public string CalculationName { get; set; }

        public string CalculationDescription { get; set; }

        public string CalculationPeriodName { get; set; }

        public string CalculationId { get; set; }

        public async Task<IActionResult> OnGet(IEnumerable<int> versions, string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult(ErrorMessages.CalculationIdNullOrEmpty);
            }

            Guard.ArgumentNotNull(versions, nameof(versions));
            if (versions.Count() != 2)
            {
                return new BadRequestObjectResult("Two versions not requested");
            }

            ApiResponse<Calculation> calculationResponse = await _calcClient.GetCalculationById(calculationId);
            if (calculationResponse == null || calculationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInCalcsService);
            }

            Calculation calculation = calculationResponse.Content;

            CalculationName = calculation.Name;
            CalculationPeriodName = calculation.FundingPeriodName;
            CalculationId = calculation.Id;

            ApiResponse<Clients.SpecsClient.Models.CalculationCurrentVersion> specCalculation = await _specsClient.GetCalculationById(calculation.SpecificationId, calculation.CalculationSpecification.Id);

            if (specCalculation == null || specCalculation.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInSpecsService);
            }

            CalculationDescription = specCalculation.Content.Description;

            ApiResponse<IEnumerable<CalculationVersion>> calculationVersionsResponse = await _calcClient.GetMultipleVersionsByCalculationId(versions, calculationId);

            if (calculationVersionsResponse == null || calculationVersionsResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Unable to retreive selected versions of calculations. Status Code = {calculationVersionsResponse?.StatusCode}");
            }

            if (calculationVersionsResponse.StatusCode == HttpStatusCode.OK)
            {
                IEnumerable<CalculationVersion> calculationVersions = calculationVersionsResponse.Content;

                if (calculationVersions.IsNullOrEmpty())
                {
                    throw new InvalidOperationException($"Unable to retrieve calculationVersion model from the response. Calculation version value = {calculationVersions.ToString()}");
                }
                else
                {
                    if (calculationVersions.Count() < 2)
                    {
                        throw new InvalidOperationException($"There are less than two previous versions available. Calculation version count ={calculationVersions.Count()}");
                    }

                    List<CalculationVersion> calculationVersionsList = calculationVersions.OrderBy(c => c.Version).ToList();

                    LeftCalcualationDiffModel = _mapper.Map<CalculationVersionViewModel>(calculationVersionsList[0]);
                    RightCalculationDiffModel = _mapper.Map<CalculationVersionViewModel>(calculationVersionsList[1]);
                }
            }

            return Page();
        }
    }
}