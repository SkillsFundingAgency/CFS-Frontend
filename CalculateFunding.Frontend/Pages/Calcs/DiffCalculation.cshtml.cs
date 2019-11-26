using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class DiffCalculationModel : PageModel
    {
        private readonly ICalculationsApiClient _calcClient;
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private readonly IMapper _mapper;

        public DiffCalculationModel(ICalculationsApiClient calcClient,
	        ISpecificationsApiClient specificationsApiClient,
	        IMapper mapper)
        {
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _calcClient = calcClient;
            _mapper = mapper;
            _specificationsApiClient = specificationsApiClient;
        }

        public CalculationVersionViewModel LeftCalculationDiffModel { get; set; }

        public CalculationVersionViewModel RightCalculationDiffModel { get; set; }

        public SpecificationViewModel Specification { get; set; }

        public CalculationViewModel Calculation { get; set; }

        public string CalculationFundingPeriodId { get; set; }

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

            ApiResponse<SpecificationSummary> specificationResponse =
	            await _specificationsApiClient.GetSpecificationSummaryById(calculation.SpecificationId);

            if (specificationResponse == null || specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
	            return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInCalcsService);
            }

            SpecificationSummary specificationSummary = _mapper.Map<SpecificationSummary>(specificationResponse.Content);

            Specification = new SpecificationViewModel
            {
                Id = specificationSummary.Id,
                Name = specificationSummary.Name
            };

            Calculation = _mapper.Map<CalculationViewModel>(calculation);
            Calculation.Description = calculation.Description;
			CalculationFundingPeriodId = specificationResponse.Content.FundingPeriod?.Name.FundingPeriodString();

            ApiResponse<Calculation> specCalculation = await _calcClient.GetCalculationById(calculation.Id);

            if (specCalculation == null || specCalculation.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult(ErrorMessages.CalculationNotFoundInSpecsService);
            }

            ApiResponse<IEnumerable<CalculationVersion>> calculationVersionsResponse = await _calcClient.GetMultipleVersionsByCalculationId(versions, calculationId);

            if (calculationVersionsResponse == null || calculationVersionsResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Unable to retrieve selected versions of calculations. Status Code = {calculationVersionsResponse?.StatusCode}");
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

                    LeftCalculationDiffModel = _mapper.Map<CalculationVersionViewModel>(calculationVersionsList[0]);
                    RightCalculationDiffModel = _mapper.Map<CalculationVersionViewModel>(calculationVersionsList[1]);
                }
            }

            return Page();
        }
    }
}