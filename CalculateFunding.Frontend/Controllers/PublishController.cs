using System;
using System.Collections.Generic;
using System.IO;
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
using CalculateFunding.Frontend.ViewModels.Provider;
using CalculateFunding.Frontend.ViewModels.Publish;
using CalculateFunding.Frontend.ViewModels.Results;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Http;
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
            Guard.ArgumentNotNull(viewModel, nameof(viewModel));

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
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

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
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return await ChooseRefresh(specificationId, SpecificationActionTypes.CanChooseFunding);
        }

        [Route("api/specs/{specificationId}/refresh")]
        [HttpPost]
        public async Task<IActionResult> RefreshFunding(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return await ChooseRefresh(specificationId, SpecificationActionTypes.CanRefreshFunding);
        }

        [Route("api/specs/{specificationId}/validate-for-refresh")]
        [HttpPost]
        public async Task<IActionResult> ValidateSpecificationForRefresh(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ValidatedApiResponse<IEnumerable<string>> response =
                await _publishingApiClient.ValidateSpecificationForRefresh(specificationId);

            return response.Handle(nameof(Specification),
                onSuccess: Ok,
                onNoContent: Ok);
        }

        [Route("api/specs/{specificationId}/approve")]
        [HttpPost]
        public async Task<IActionResult> ApproveFunding(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (!await _authorizationHelper.DoesUserHavePermission(
                User,
                specificationId,
                SpecificationActionTypes.CanApproveFunding))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<JobCreationResponse> response =
                await _publishingApiClient.ApproveFundingForSpecification(specificationId);

            if (response.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return new PreconditionFailedResult("Preconditions for this approval have not been met.");
            }

            return response.Handle("Release Funding",
                onSuccess: x => x.Content.JobId != null ? (IActionResult)Ok(new { jobId = x.Content.JobId }) : BadRequest());
        }

        [Route("api/specs/{specificationId}/release")]
        [HttpPost]
        public async Task<IActionResult> PublishFunding(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (!await _authorizationHelper.DoesUserHavePermission(
                User,
                specificationId,
                SpecificationActionTypes.CanReleaseFunding))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<JobCreationResponse> response =
                await _publishingApiClient.PublishFundingForSpecification(specificationId);

            return response.Handle("Release Funding",
                onSuccess: x => x.Content.JobId != null ? (IActionResult)Ok(x.Content.JobId) : BadRequest());
        }

        [Route("api/specs/{specificationId}/fundingSummary")]
        [HttpGet]
        public async Task<IActionResult> GetProviderStatusCounts(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

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
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<IEnumerable<PublishedProviderTransaction>> result =
                await _publishingApiClient.GetPublishedProviderTransactions(specificationId, providerId);

            if (result == null || !result.Content.Any())
                return new NotFoundObjectResult(Content("Error. Not Found."));

            ProviderTransactionResultsViewModel output = new ProviderTransactionResultsViewModel
            { Status = result.StatusCode, Results = new List<ProviderTransactionResultsItemViewModel>() };

            foreach (PublishedProviderTransaction item in result.Content)
            {
                output.Results.Add(new ProviderTransactionResultsItemViewModel
                {
                    Status = item.Status.ToString(),
                    Author = item.Author.Name,
                    DateChanged = $"{item.Date:M} {item.Date.Year} at {item.Date.DateTime:h:mm tt}",
                    FundingStreamValue = item.TotalFunding.HasValue ? $"£{item.TotalFunding.Value:N2}" : "",
                    VariationReasons = item.VariationReasons
                });
            }

            PublishedProviderTransaction latestPublishedProvider = result.Content.OrderByDescending(x => x.Date).First();

            output.FundingTotal = latestPublishedProvider?.TotalFunding != null
                ? $"£{latestPublishedProvider.TotalFunding.Value:N2}"
                : "";

            output.LatestStatus = result.Content.OrderByDescending(x => x.Date).FirstOrDefault()?.Status.ToString();

            return new OkObjectResult(output);
        }

        [HttpGet]
        [Route("api/provider/getlocalauthorities/{fundingStreamId}/{fundingPeriodId}/")]
        public async Task<IActionResult> GetLocalAuthorities(string fundingStreamId, string fundingPeriodId,
            [FromQuery] string searchText = "")
        {
            ApiResponse<IEnumerable<string>> response =
                await _publishingApiClient.SearchPublishedProviderLocalAuthorities(searchText, fundingStreamId,
                    fundingPeriodId);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content));
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

            ApiResponse<IDictionary<int, ProfilingVersion>> response =
                await _publishingApiClient.GetAllReleasedProfileTotals(
                    fundingStreamId,
                    fundingPeriodId,
                    providerId);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(MapToProfilingViewModel(x.Content)));
        }

        [HttpGet]
        [Route("api/publish/get-profile-history/{fundingStreamId}/{fundingPeriodId}/{providerId}")]
        public async Task<IActionResult> GetProfileHistory(string fundingStreamId, string fundingPeriodId, string providerId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<IEnumerable<ProfileTotal>> response = await _publishingApiClient.GetProfileHistory(fundingStreamId, fundingPeriodId, providerId);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content));
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

            ApiResponse<IDictionary<int, ProfilingVersion>> response =
                await _publishingApiClient.GetAllReleasedProfileTotals(
                    fundingStreamId,
                    fundingPeriodId,
                    providerId);

            return response.Handle(nameof(PublishedProviderVersion),
                onSuccess: x => Ok(MapToArchiveViewModel(x.Content)));
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

            ApiResponse<PublishedProviderFundingCount> response = await _publishingApiClient.GetProviderBatchForReleaseCount(providers, specificationId);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content));
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

            ApiResponse<PublishedProviderFundingCount> response = await _publishingApiClient.GetProviderBatchForApprovalCount(providers, specificationId);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content));
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

            ValidatedApiResponse<JobCreationResponse> response = await _publishingApiClient.ApproveFundingForBatchProviders(specificationId, providers);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content));
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

            ValidatedApiResponse<JobCreationResponse> response = await _publishingApiClient.PublishFundingForBatchProviders(specificationId, providers);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content));
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

            ApiResponse<IEnumerable<string>> response = await _publishingApiClient.GetPublishedProviderErrors(specificationId);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content?.Where(err => err != null).ToList()));
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

            ApiResponse<JobCreationResponse> response = await _publishingApiClient.QueueSpecificationFundingStreamSqlImport(specificationId, fundingStreamId);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content));
        }

        [HttpGet("/api/publishedProviders/{fundingStreamId}/{fundingPeriodId}/lastupdated")]
        public async Task<IActionResult> GetLatestPublishedDate(
            [FromRoute] string fundingStreamId,
            [FromRoute] string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<LatestPublishedDate> response = await _publishingApiClient.GetLatestPublishedDate(fundingStreamId, fundingPeriodId);

            return response.Handle(nameof(Specification),
                onSuccess: x => Ok(x.Content));
        }

        [HttpGet("api/specifications/{specificationId}/publishedproviders/{providerId}/fundingStreams/{fundingStreamId}/errors")]
        public async Task<IActionResult> GetPublishedProviderErrors(
            [FromRoute] string fundingStreamId,
            [FromRoute] string specificationId,
            [FromRoute] string providerId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<PublishedProviderVersion> response =
                await _publishingApiClient.GetCurrentPublishedProviderVersion(specificationId, fundingStreamId, providerId);

            return response.Handle(nameof(PublishedProviderVersion),
                onSuccess: x => Ok(x.Content));
        }

        [HttpGet("api/specifications/{specificationId}/publishedproviders/{providerId}/fundingStreams/{fundingStreamId}")]
        public async Task<IActionResult> GetCurrentPublishedProviderVersion(
            [FromRoute] string fundingStreamId,
            [FromRoute] string specificationId,
            [FromRoute] string providerId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<PublishedProviderVersion> response =
                await _publishingApiClient.GetCurrentPublishedProviderVersion(specificationId, fundingStreamId, providerId);

            return response.Handle(nameof(PublishedProviderVersion),
                onSuccess: x =>
                {
                    PublishedProviderVersion publishedProviderVersion = response.Content;

                    PublishedProviderVersionViewModel publishedProviderVersionViewModel = new PublishedProviderVersionViewModel()
                    {
                        UKPRN = publishedProviderVersion.Provider.UKPRN,
                        Name = publishedProviderVersion.Provider.Name,
                        IsIndicative = publishedProviderVersion.IsIndicative
                    };

                    return Ok(publishedProviderVersionViewModel);
                });
        }

        [HttpPost("api/publishedProviders/batch")]
        public async Task<IActionResult> UploadBatch(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Missing or empty file");
            }

            await using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);

                ApiResponse<BatchUploadResponse> response = await _publishingApiClient.UploadBatch(new BatchUploadRequest
                {
                    Stream = stream.ToArray()
                });

                return response.Handle(nameof(PublishedProviderVersion),
                    onSuccess: x => Ok(x.Content));
            }
        }

        [HttpPost("api/publishedProviders/batch/validate")]
        public async Task<IActionResult> QueueBatchUploadValidation([FromBody] BatchUploadValidationRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            ValidatedApiResponse<JobCreationResponse> response = await _publishingApiClient.QueueBatchUploadValidation(new BatchUploadValidationRequest
            {
                BatchId = request.BatchId,
                SpecificationId = request.SpecificationId,
                FundingPeriodId = request.FundingPeriodId,
                FundingStreamId = request.FundingStreamId
            });

            return response.Handle(nameof(PublishedProviderVersion),
                onSuccess: x => Ok(x.Content));
        }

        [HttpPost("api/specifications/{specificationId}/publishedproviders/generate-csv-for-approval/batch")]
        public async Task<IActionResult> GenerateCsvForBatchPublishedProvidersForApproval(
            [FromBody] PublishedProviderIdsRequest request,
            [FromRoute] string specificationId)
        {
            Guard.ArgumentNotNull(request, nameof(request));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<PublishedProviderDataDownload> response =
                await _publishingApiClient.GenerateCsvForBatchPublishedProvidersForApproval(request, specificationId);

            return response.Handle(nameof(PublishedProviderDataDownload),
                onSuccess: x => Ok(x.Content));
        }

        [HttpPost("api/specifications/{specificationId}/publishedproviders/generate-csv-for-approval/all")]
        public async Task<IActionResult> GenerateCsvForAllPublishedProvidersForApproval(
            [FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<PublishedProviderDataDownload> response =
                await _publishingApiClient.GenerateCsvForAllPublishedProvidersForApproval(specificationId);

            return response.Handle(nameof(PublishedProviderDataDownload),
                onSuccess: x => Ok(x.Content));
        }

        [HttpPost("api/specifications/{specificationId}/publishedproviders/generate-csv-for-release/batch")]
        public async Task<IActionResult> GenerateCsvForBatchPublishedProvidersForRelease(
            [FromBody] PublishedProviderIdsRequest request,
            [FromRoute] string specificationId)
        {
            Guard.ArgumentNotNull(request, nameof(request));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<PublishedProviderDataDownload> response =
                await _publishingApiClient.GenerateCsvForBatchPublishedProvidersForRelease(request, specificationId);

            return response.Handle(nameof(PublishedProviderDataDownload),
                onSuccess: x => Ok(x.Content));
        }

        [HttpPost("api/specifications/{specificationId}/publishedproviders/generate-csv-for-release/all")]
        public async Task<IActionResult> GenerateCsvForAllPublishedProvidersForRelease(
            [FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<PublishedProviderDataDownload> response =
                await _publishingApiClient.GenerateCsvForAllPublishedProvidersForRelease(specificationId);

            return response.Handle(nameof(PublishedProviderDataDownload),
                onSuccess: x => Ok(x.Content));
        }

        [HttpGet("api/publishedProviders/batch/{batchId}")]
        public async Task<IActionResult> GetBatchPublishedProviderIds([FromRoute] string batchId)
        {
            Guard.IsNullOrWhiteSpace(batchId, nameof(batchId));

            ApiResponse<IEnumerable<string>> response = await _publishingApiClient.GetBatchPublishedProviderIds(batchId);

            return response.Handle(nameof(PublishedProviderVersion),
                onSuccess: x => Ok(x.Content));
        }

        [HttpGet("api/publishing/available-funding-line-periods/{specificationId}")]
        public async Task<IActionResult> GetAvailableFundingLinePeriods(string specificationId)
        {
            ApiResponse<IEnumerable<AvailableVariationPointerFundingLine>> response =
                await _publishingApiClient.GetAvailableFundingLineProfilePeriodsForVariationPointers(specificationId);
            
            if(response.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(response.Content);
            }

            return BadRequest();
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

            ValidatedApiResponse<JobCreationResponse> response =
                await _publishingApiClient.RefreshFundingForSpecification(specificationId);

            return response.Handle("Refresh Funding",
                onSuccess: x => x.Content.JobId != null ? (IActionResult)Ok(x.Content.JobId) : BadRequest());
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
                            profilingTotal.Value,
                            profilingTotal.PeriodType.ToString()))
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