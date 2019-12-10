﻿using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
namespace CalculateFunding.Frontend.Controllers
{
	public class PublishController : Controller
	{
		private readonly ISpecificationsApiClient _specificationsApiClient;	
		private readonly IPublishingApiClient _publishingApiClient;
		private readonly IAuthorizationHelper _authorizationHelper;

		public PublishController(
			ISpecificationsApiClient specificationsApiClient,  
			IPublishingApiClient publishingApiClient, 
			IAuthorizationHelper authorizationHelper)
		{
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(publishingApiClient, nameof(publishingApiClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

			_specificationsApiClient = specificationsApiClient;		
			_publishingApiClient = publishingApiClient;
			_authorizationHelper = authorizationHelper;
		}

		[Route("api/publish/savetimetable")]
		[HttpPost]
		public async Task<IActionResult> SaveTimetable([FromBody] ReleaseTimetableViewModel viewModel)
		{
            if (!await _authorizationHelper.DoesUserHavePermission(
				User, 
				viewModel.SpecificationId, 
				SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

			SpecificationPublishDateModel publishData = new SpecificationPublishDateModel
			{
				EarliestPaymentAvailableDate = viewModel.FundingDate,
				ExternalPublicationDate = viewModel.StatementDate
			};

			HttpStatusCode publish =
				await _specificationsApiClient.SetPublishDates(viewModel.SpecificationId, publishData);

			if (publish == HttpStatusCode.OK)
			{
				return new OkObjectResult(Content("Successful"));
			}

			if (publish == HttpStatusCode.BadRequest)
			{
				return new BadRequestObjectResult(
					Content("There was a problem with the data submitted. Please check and try again."));
			}

			return new NotFoundObjectResult(Content("Error. Not Found."));
		}

        [Route("api/publish/gettimetable/{specificationId}")]
		[HttpGet]
		public async Task<IActionResult> GetTimetable(string specificationId)
		{
			ApiResponse<SpecificationPublishDateModel> result =
				await _specificationsApiClient.GetPublishDates(specificationId);

			if (result != null)
			{
				return new OkObjectResult(result);
			}

			return new NotFoundObjectResult(Content("Error. Not Found."));
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/selectforfunding")]
        public async Task<IActionResult> SelectSpecificationForFunding(string specificationId)
        {
            return await ChooseRefresh(specificationId, SpecificationActionTypes.CanChooseFunding);
        }

        [Route("api/publish/refreshfunding/{specificationId}")]
		[HttpGet]
		public async Task<IActionResult> RefreshFunding(string specificationId)
        {
            return await ChooseRefresh(specificationId, SpecificationActionTypes.CanRefreshFunding);
        }

		[Route("api/publish/approvefunding/{specificationId}")]
		[HttpGet]
		public async Task<IActionResult> ApproveFunding(string specificationId)
		{
			if (!await _authorizationHelper.DoesUserHavePermission(
				User,
				specificationId,
				SpecificationActionTypes.CanApproveFunding))
			{
				return new ForbidResult();
			}

            ValidatedApiResponse<JobCreationResponse> result = await _publishingApiClient.ApproveFundingForSpecification(specificationId);

			if (result.Content.JobId != null)
			{
				return Ok(result.Content.JobId);
			}

			return BadRequest(-1);
		}

		[Route("api/publish/publishfunding/{specificationId}")]
		[HttpGet]
		public async Task<IActionResult> PublishFunding(string specificationId)
		{
			if (!await _authorizationHelper.DoesUserHavePermission(
				User,
				specificationId,
				SpecificationActionTypes.CanReleaseFunding))
			{
				return new ForbidResult();
			}

			ValidatedApiResponse<JobCreationResponse> result = await _publishingApiClient.PublishFundingForSpecification(specificationId);

			if (result.Content.JobId != null)
			{
				return Ok(result.Content.JobId);
			}

			return BadRequest(-1);
		}

        [Route("api/specifications/{specificationId}/publishedproviders/publishingstatus")]
        [HttpGet]
        public async Task<IActionResult> GetProviderStatusCounts(string specificationId)
        {
            ApiResponse<ProviderFundingStreamStatusResponse> result = await _publishingApiClient.GetProviderStatusCounts(specificationId);

            if (result != null)
            {
                return new OkObjectResult(result);
            }

            return new NotFoundObjectResult(Content("Error. Not Found."));
        }

        private async Task<IActionResult> ChooseRefresh(string specificationId, SpecificationActionTypes specificationActionType)
        {
            if (!await _authorizationHelper.DoesUserHavePermission(
                User,
                specificationId,
                specificationActionType))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<JobCreationResponse> result = await _publishingApiClient.RefreshFundingForSpecification(specificationId);

            if (result.Content.JobId != null)
            {
                return Ok(result.Content.JobId);
            }

            return BadRequest(-1);
        }
    }
}