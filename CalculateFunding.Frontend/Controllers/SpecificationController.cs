using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Controllers
{
    public class SpecificationController : Controller
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IAuthorizationHelper _authorizationHelper;

        public SpecificationController(ISpecsApiClient specsApiClient, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsApiClient;
            _authorizationHelper = authorizationHelper;
        }

        [Route("api/specifications-by-period/{fundingPeriodId}")]
        public async Task<IActionResult> GetSpecificationsByFundingPeriod(string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specsClient.GetSpecifications(fundingPeriodId);
            if (apiResponse == null)
            {
                return new StatusCodeResult(500);
            }

            if (apiResponse.StatusCode != HttpStatusCode.OK)
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

        [Route("api/specs/specifications-selected-for-funding-by-period/{fundingPeriodId}")]
        public async Task<IActionResult> GetSpecificationsForFundingByPeriod(string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specsClient.GetSpecificationsSelectedForFundingByPeriod(fundingPeriodId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return Ok(apiResponse.Content.OrderBy(c => c.Name));
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
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

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanApproveSpecification))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<PublishStatusResult> response = await _specsClient.UpdatePublishStatus(specificationId, publishStatusEditModel);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }

            throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
        }

        [Route("api/specs/{specificationId}/selectforfunding")]
        [HttpPost]
        public async Task<IActionResult> SelectSpecificationForFunding(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanChooseFunding))
            {
                return new ForbidResult();
            }

            HttpStatusCode statusCode = await _specsClient.SelectSpecificationForFunding(specificationId);

            if (statusCode == HttpStatusCode.NoContent)
            {
                return NoContent();
            }

            throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={statusCode}");
        }


        [HttpPost]
        [Route("api/specs/create")]
        public async Task<IActionResult> CreateSpecification([FromBody]CreateSpecificationViewModel viewModel)
        {
            //TODO: Could do with some validation here

            if (!ModelState.IsValid)
            {
                return new BadRequestResult();
            }

            //var viewModel = JsonConvert.DeserializeObject<CreateSpecificationViewModel>(data);

            var fundingStreamIds = new List<string> { viewModel.FundingStreamId };

            CreateSpecificationModel specification = new CreateSpecificationModel
            {
                Description = viewModel.Description,
                Name = viewModel.Name,
                FundingPeriodId = viewModel.FundingPeriodId,
                FundingStreamIds = fundingStreamIds,
                ProviderVersionId = viewModel.ProviderVersionId
            };


            if (!await _authorizationHelper.DoesUserHavePermission(User, specification.FundingStreamIds, FundingStreamActionTypes.CanCreateSpecification))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<Specification> result = await _specsClient.CreateSpecification(specification);

            if (result.StatusCode.IsSuccess())
            {
				return new OkObjectResult(result.Content);
                //return Redirect($"/specs/policies/{result.Content.Id}?operationType=SpecificationCreated&operationId={result.Content.Id}");
            }
            else if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                result.AddValidationResultErrors(ModelState);

                return new BadRequestResult();
            }
            else
            {
                return new InternalServerErrorResult($"Unable to create specification - result '{result.StatusCode}'");
            }
        }
    }
}
