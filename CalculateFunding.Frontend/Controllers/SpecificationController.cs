using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class SpecificationController : Controller
    {
        private readonly ISpecsApiClient _specsClient;

        public SpecificationController(ISpecsApiClient specsApiClient)
        {
            _specsClient = specsApiClient;
        }

        [Route("api/specifications-by-period/{fundingPeriodId}")]
        public async Task<IActionResult> GetSpecificationsByFundingPeriod(string fundingPeriodId)
        {
            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specsClient.GetSpecifications(fundingPeriodId);
            if (apiResponse == null)
            {
                return new StatusCodeResult(500);
            }

            if (apiResponse.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new StatusCodeResult((int)apiResponse.StatusCode);
            }

            if (apiResponse.Content == null)
            {
                return new ObjectResult("List of Specifications was null")
                {
                    StatusCode = 500,
                };
            }

            List<ReferenceViewModel> result = new List<ReferenceViewModel>();

            foreach (SpecificationSummary specification in apiResponse.Content.OrderBy(o => o.Name))
            {
                result.Add(new ReferenceViewModel(specification.Id, specification.Name));
            }

            return Ok(result);
        }

        [Route("api/specs/funding-periods")]
        public async Task<IActionResult> GetFundingPeriods()
        {
            ApiResponse<IEnumerable<Reference>> response = await _specsClient.GetFundingPeriods();

            if (response.StatusCode == System.Net.HttpStatusCode.OK) {

                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
            }

        }

        [Route("api/specs/specifications-selected-for-funding-by-period/{fundingPeriodId}")]  
        public async Task<IActionResult> GetSpecificationsForFundingByPeriod(string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specsClient.GetSpecificationsSelectedForFundingByPeriod(fundingPeriodId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return Ok(apiResponse.Content.OrderBy(c => c.Name));
            }
            else if(apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();             
            }
            return new StatusCodeResult(500);  
        }



        [Route("api/specs/{specificationId}/status")]
        [HttpPut]
        public async Task<IActionResult> EditSpecificationStatus(string specificationId, [FromBody]PublishStatusEditModel publishStatusEditModel)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            Guard.ArgumentNotNull(publishStatusEditModel, nameof(publishStatusEditModel));

            ValidatedApiResponse<PublishStatusResult> response = await _specsClient.UpdatePublishStatus(specificationId, publishStatusEditModel);

            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
            }
        }

        [Route("api/specs/{specificationId}/selectforfunding")]
        [HttpPost]
        public async Task<IActionResult> SelectSpecificationForfunding(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            HttpStatusCode statusCode = await _specsClient.SelectSpecificationForFunding(specificationId);

            if (statusCode == HttpStatusCode.NoContent)
            {
                return NoContent();
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={statusCode}");
            }
        }
	}
}
