using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Graph.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Publish;
using CalculateFunding.Frontend.ViewModels.Results;
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
                return new OkObjectResult(publishData);
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

        [Route("api/specs/{specificationId}/refresh")]
        [HttpPost]
        public async Task<IActionResult> RefreshFunding(string specificationId)
        {
            return await ChooseRefresh(specificationId, SpecificationActionTypes.CanRefreshFunding);
        }

        [Route("api/specs/{specificationId}/validate-for-refresh")]
        [HttpPost]
        public async Task<IActionResult> ValidateSpecificationForRefresh(string specificationId)
        {
            ValidatedApiResponse<IEnumerable<string>> response =
                await _publishingApiClient.ValidateSpecificationForRefresh(specificationId);

            if (response.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            IActionResult errorResult = response.IsSuccessOrReturnFailureResult(nameof(ValidateSpecificationForRefresh), treatNoContentAsSuccess: true);
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        [Route("api/specs/{specificationId}/approve")]
        [HttpPost]
        public async Task<IActionResult> ApproveFunding(string specificationId)
        {
            if (!await _authorizationHelper.DoesUserHavePermission(
                User,
                specificationId,
                SpecificationActionTypes.CanApproveFunding))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<JobCreationResponse> result =
                await _publishingApiClient.ApproveFundingForSpecification(specificationId);

            if (result.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            if (result.StatusCode == HttpStatusCode.OK)
            {
                if (result.Content?.JobId != null)
                {
                    return new OkObjectResult(new {jobId = result.Content.JobId});
                }
            }

            if (result.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return new PreconditionFailedResult("Preconditions for this approval have not been met.");
            }

            return new InternalServerErrorResult("There was an error approving funding for this specification.");
        }

        [Route("api/specs/{specificationId}/release")]
        [HttpPost]
        public async Task<IActionResult> PublishFunding(string specificationId)
        {
            if (!await _authorizationHelper.DoesUserHavePermission(
                User,
                specificationId,
                SpecificationActionTypes.CanReleaseFunding))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<JobCreationResponse> result =
                await _publishingApiClient.PublishFundingForSpecification(specificationId);

            if (result.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            IActionResult errorResult = result.IsSuccessOrReturnFailureResult("Approve Funding");

            if (errorResult != null)
            {
                return errorResult;
            }

            if (result.Content.JobId != null)
            {
                return Ok(new {result.Content.JobId});
            }

            return BadRequest();
        }

        [Route("api/specs/{specificationId}/fundingSummary")]
        [HttpGet]
        public async Task<IActionResult> GetProviderStatusCounts(string specificationId)
        {
            ApiResponse<IEnumerable<ProviderFundingStreamStatusResponse>> result =
                await _publishingApiClient.GetProviderStatusCounts(specificationId);

            if (result != null)
            {
                return new OkObjectResult(result);
            }

            return new NotFoundObjectResult(Content("Error. Not Found."));
        }

        [Route("api/provider/getProviderTransactions/{specificationId}/{providerId}")]
        [HttpGet]
        public async Task<IActionResult> GetPublishedProviderTransactions(string specificationId, string providerId)
        {
            ApiResponse<IEnumerable<PublishedProviderTransaction>> result =
                await _publishingApiClient.GetPublishedProviderTransactions(specificationId, providerId);

            if (result != null)
            {
                ProviderTransactionResultsViewModel output = new ProviderTransactionResultsViewModel
                    {Status = result.StatusCode, Results = new List<ProviderTransactionResultsItemViewModel>()};

                foreach (PublishedProviderTransaction item in result.Content)
                {
                    output.Results.Add(new ProviderTransactionResultsItemViewModel
                    {
                        Status = item.Status.ToString(),
                        Author = item.Author.Name,
                        DateChanged = $"{item.Date:M} {item.Date.Year} at {item.Date.DateTime:h:mm tt}",
                        FundingStreamValue = item.TotalFunding.HasValue ? $"£{item.TotalFunding.Value:N0}" : ""
                    });
                }

                output.FundingTotal = result.Content.OrderByDescending(x => x.Date).First() != null
                    ? $"£{result.Content.OrderByDescending(x => x.Date).First().TotalFunding.Value:N0}"
                    : "";
                output.LatestStatus = result.Content.OrderByDescending(x => x.Date).FirstOrDefault()?.Status.ToString();
                return new OkObjectResult(output);
            }

            return new NotFoundObjectResult(Content("Error. Not Found."));
        }

        [HttpGet]
        [Route("api/provider/getlocalauthorities/{fundingStreamId}/{fundingPeriodId}/")]
        public async Task<IActionResult> GetLocalAuthorities(string fundingStreamId, string fundingPeriodId,
            [FromQuery] string searchText = "")
        {
            var result =
                await _publishingApiClient.SearchPublishedProviderLocalAuthorities(searchText, fundingStreamId,
                    fundingPeriodId);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(result.Content);
            }

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new NotFoundObjectResult(Content("Error. Not found."))
            {
                StatusCode = 404
            };
        }

        [HttpGet]
        [Route("api/provider/{fundingStreamId}/{fundingPeriodId}/{providerId}/profileTotals")]
        public async Task<IActionResult> GetAllReleasedProfileTotals(
            string fundingStreamId,
            string fundingPeriodId,
            string providerId)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(fundingPeriodId, nameof(fundingPeriodId));
            Guard.ArgumentNotNull(providerId, nameof(providerId));

            ApiResponse<IDictionary<int, ProfilingVersion>> apiResponse =
                await _publishingApiClient.GetAllReleasedProfileTotals(
                    fundingStreamId,
                    fundingPeriodId,
                    providerId);

            IActionResult errorResult =
                apiResponse.IsSuccessOrReturnFailureResult(nameof(PublishedProviderVersion));

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(MapToProfilingViewModel(apiResponse.Content));
        }

        [HttpGet]
        [Route("api/publish/get-profile-history/{fundingStreamId}/{fundingPeriodId}/{providerId}")]
        public async Task<IActionResult> GetProfileHistory(string fundingStreamId, string fundingPeriodId, string providerId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<IEnumerable<ProfileTotal>> response = await _publishingApiClient.GetProfileHistory(fundingStreamId, fundingPeriodId, providerId);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(response.Content);
            }

            return new BadRequestResult();
        }

        [HttpGet]
        [Route("api/provider/{fundingStreamId}/{fundingPeriodId}/{providerId}/profileArchive")]
        public async Task<IActionResult> GetProfileArchive(
            string fundingStreamId,
            string fundingPeriodId,
            string providerId)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(fundingPeriodId, nameof(fundingPeriodId));
            Guard.ArgumentNotNull(providerId, nameof(providerId));

            ApiResponse<IDictionary<int, ProfilingVersion>> apiResponse =
                await _publishingApiClient.GetAllReleasedProfileTotals(
                    fundingStreamId,
                    fundingPeriodId,
                    providerId);

            IActionResult errorResult =
                apiResponse.IsSuccessOrReturnFailureResult(nameof(PublishedProviderVersion));

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(MapToArchiveViewModel(apiResponse.Content));
        }

        [HttpPost("api/specs/{specificationId}/funding-summary-for-release")]
        public async Task<IActionResult> GetProviderBatchForReleaseCount([FromBody] PublishedProviderIdsRequest providers, [FromRoute] string specificationId)
        {
            if (specificationId.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(specificationId), "Missing " + nameof(specificationId));
            }
            if (providers.PublishedProviderIds.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(providers.PublishedProviderIds), "Missing " + nameof(providers.PublishedProviderIds));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApiResponse<PublishedProviderFundingCount> apiResponse = await _publishingApiClient.GetProviderBatchForReleaseCount(providers, specificationId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(apiResponse.Content);
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(apiResponse.Content);
            }

            return new InternalServerErrorResult("There was an error retrieving provider funding counts for release.");
        }

        [HttpPost("api/specs/{specificationId}/funding-summary-for-approval")]
        public async Task<IActionResult> GetProviderBatchForApprovalCount([FromBody] PublishedProviderIdsRequest providers, [FromRoute] string specificationId)
        {
            if (specificationId.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(specificationId), "Missing " + nameof(specificationId));
            }
            if (providers.PublishedProviderIds.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(providers.PublishedProviderIds), "Missing " + nameof(providers.PublishedProviderIds));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApiResponse<PublishedProviderFundingCount> apiResponse = await _publishingApiClient.GetProviderBatchForApprovalCount(providers, specificationId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(apiResponse.Content);
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(apiResponse.Content);
            }

            return new InternalServerErrorResult("There was an error retrieving provider funding counts for approval.");
        }

        [HttpPost("api/specs/{specificationId}/funding-approval/providers")]
        public async Task<IActionResult> ApproveProviderBatch([FromBody] PublishedProviderIdsRequest providers, [FromRoute] string specificationId)
        {
            if (specificationId.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(specificationId), "Missing " + nameof(specificationId));
            }
            if (providers.PublishedProviderIds.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(providers.PublishedProviderIds), "Missing " + nameof(providers.PublishedProviderIds));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<JobCreationResponse> apiResponse = await _publishingApiClient.ApproveFundingForBatchProviders(specificationId, providers);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(apiResponse.Content);
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(apiResponse.Content);
            }

            return new InternalServerErrorResult("There was an error approving provider funding.");
        }

        [HttpPost("api/specs/{specificationId}/funding-release/providers")]
        public async Task<IActionResult> ReleaseProviderBatch([FromBody] PublishedProviderIdsRequest providers, [FromRoute] string specificationId)
        {
            if (specificationId.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(specificationId), "Missing " + nameof(specificationId));
            }
            if (providers.PublishedProviderIds.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(providers.PublishedProviderIds), "Missing " + nameof(providers.PublishedProviderIds));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<JobCreationResponse> apiResponse = await _publishingApiClient.PublishFundingForBatchProviders(specificationId, providers);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(apiResponse.Content);
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(apiResponse.Content);
            }

            return new InternalServerErrorResult("There was an error releasing provider funding.");
        }

        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [Route("api/specs/{specificationId}/provider-errors")]
        public async Task<IActionResult> GetSpecProviderErrors(string specificationId)
        {
            if (specificationId.IsNullOrEmpty())
            {
                ModelState.AddModelError(nameof(specificationId), "Missing " + nameof(specificationId));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }

            ApiResponse<IEnumerable<string>> apiResponse = await _publishingApiClient.GetPublishedProviderErrors(specificationId);

            IActionResult errorResult =
                apiResponse.IsSuccessOrReturnFailureResult(nameof(Specification));

            if (errorResult != null)
            {
                return errorResult;
            }

            return new OkObjectResult(apiResponse.Content?.Where(x => x != null).ToList());
        }
        
        [HttpGet("/api/sqlqa/specifications/{specificationId}/funding-streams/{fundingStreamId}/import/queue")]
        public async Task<IActionResult> RunSqlImportJob([FromRoute] string specificationId,
            [FromRoute] string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            
            if (!await _authorizationHelper.DoesUserHavePermission(
                User,
                specificationId,
                SpecificationActionTypes.CanRefreshPublishedQa))
            {
                return new ForbidResult();
            }

            ApiResponse<JobCreationResponse> createJobResponse = await _publishingApiClient.QueueSpecificationFundingStreamSqlImport(specificationId, fundingStreamId);
            
            IActionResult errorResult =
                createJobResponse.IsSuccessOrReturnFailureResult(nameof(Specification));

            if (errorResult != null)
            {
                return errorResult;
            }

            return new OkObjectResult(createJobResponse.Content);
        }
        
        [HttpGet("/api/publishedproviders/{fundingStreamId}/{fundingPeriodId}/lastupdated")]
        public async Task<IActionResult> GetLatestPublishedDate([FromRoute] string fundingStreamId,
            [FromRoute] string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<LatestPublishedDate> latestPublishedDateResponse = await _publishingApiClient.GetLatestPublishedDate(fundingStreamId, fundingPeriodId);
            
            IActionResult errorResult =
                latestPublishedDateResponse.IsSuccessOrReturnFailureResult(nameof(Specification));

            if (errorResult != null)
            {
                return errorResult;
            }

            return new OkObjectResult(latestPublishedDateResponse.Content);
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

            ValidatedApiResponse<JobCreationResponse> result =
                await _publishingApiClient.RefreshFundingForSpecification(specificationId);

            if (result.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            IActionResult errorResult = result.IsSuccessOrReturnFailureResult("Refresh Funding");

            if (errorResult != null)
            {
                return errorResult;
            }

            if (result.Content.JobId != null)
            {
                return Ok(new {result.Content.JobId});
            }

            return BadRequest();
        }

        private static ProfilingViewModel MapToProfilingViewModel(IDictionary<int, ProfilingVersion> profilingVersions)
        {
            IReadOnlyCollection<KeyValuePair<int, ProfilingVersion>> orderedProfilingVersionByLatest =
                profilingVersions.OrderByDescending(p => p.Key).ToList();

            decimal previousAllocation = CalculatePreviousAllocation(orderedProfilingVersionByLatest);

            IEnumerable<ProfilingInstallment> profilingInstallments = orderedProfilingVersionByLatest.Any()
                ? orderedProfilingVersionByLatest.First().Value
                    .ProfileTotals
                    .Select(profilingTotal =>
                        new ProfilingInstallment(
                            profilingTotal.Year,
                            profilingTotal.TypeValue,
                            profilingTotal.Occurrence,
                            profilingTotal.Value))
                : Array.Empty<ProfilingInstallment>();

            return new ProfilingViewModel(profilingInstallments, previousAllocation);
        }

        private static List<ProfilingArchiveViewModel> MapToArchiveViewModel(IDictionary<int, ProfilingVersion> profilingVersions)
        {
            var output = new List<ProfilingArchiveViewModel>();

            foreach (var item in profilingVersions.Values)
            {
                output.Add(new ProfilingArchiveViewModel
                {
                    Name = $"Profile change {item.Date:d MMMM yyyy}",
                    Version = item
                });
            }

            return output;
        }

        private static decimal CalculatePreviousAllocation(
            IReadOnlyCollection<KeyValuePair<int, ProfilingVersion>> orderedProfilingVersionByLatestVersion)
            => orderedProfilingVersionByLatestVersion.Count > 1
                ? orderedProfilingVersionByLatestVersion.ToList()[1].Value.ProfileTotals.Sum(
                    profileTotal => profileTotal.Value)
                : 0;
    }
}