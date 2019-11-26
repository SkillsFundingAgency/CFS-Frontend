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
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class ComparePageModel : PageModel
    {
        private readonly ICalculationsApiClient _calcClient;
        private readonly IMapper _mapper;
        private readonly ISpecificationsApiClient _specsClient;

        public ComparePageModel(ICalculationsApiClient calcClient, IMapper mapper, ISpecificationsApiClient specsClient)
        {
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));

            _calcClient = calcClient;
            _mapper = mapper;
            _specsClient = specsClient;
        }

        public CalculationViewModel Calculation { get; set; }

        public SpecificationViewModel Specification { get; set; }

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

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummaryById(calculation.SpecificationId);
            
            if (specificationResponse?.Content == null)
            {
                return new InternalServerErrorResult($"Unable to get specification for specification id {calculation.SpecificationId}");
            }

            SpecificationSummary specificationSummary = _mapper.Map<SpecificationSummary>(specificationResponse.Content);

            Specification = new SpecificationViewModel
            {
                Id = specificationSummary.Id,
                Name = specificationSummary.Name
            };

            return Page();
        }
    }
}