using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Models.Versioning;
using CalculateFunding.Common.TemplateMetadata.Enums;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class SpecificationController : Controller
    {
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly IAuthorizationHelper _authorizationHelper;

        public SpecificationController(ISpecificationsApiClient specificationsApiClient,
            IPoliciesApiClient policiesApiClient, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specificationsApiClient = specificationsApiClient;
            _policiesApiClient = policiesApiClient;
            _authorizationHelper = authorizationHelper;
        }

        [HttpGet]
        [Route("api/specs/funding-selections")]
        public async Task<IActionResult> GetSelectionsForSpecificationsSelectedForFunding()
        {
            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specificationsApiClient.GetSpecificationsSelectedForFunding();

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                List<SpecificationSummary> specifications = apiResponse.Content.ToList();
                List<FundingStreamWithSpecificationSelectedForFundingModel> fundingStreams = Enumerable.DistinctBy(specifications
                    .SelectMany(x =>
                        x.FundingStreams.Select(fs =>
                            new FundingStreamWithSpecificationSelectedForFundingModel
                            {
                                Id = fs.Id,
                                Name = fs.Name
                            })), x => x.Id)
                     .ToList();
                foreach (FundingStreamWithSpecificationSelectedForFundingModel fundingStream in fundingStreams)
                {
                    List<SpecificationSummary> streamSpecs = specifications
                        .Where(x => x.FundingStreams.Any(s => s.Id == fundingStream.Id)).ToList();
                    IEnumerable<Reference> fundingPeriods = Enumerable.DistinctBy(streamSpecs
                        .Select(y => y.FundingPeriod), x => x.Id);
                    foreach (Reference fundingPeriod in fundingPeriods)
                    {
                        IEnumerable<SpecificationSummary> periodSpecs = streamSpecs
                            .Where(x => x.FundingPeriod.Id == fundingPeriod.Id);

                        fundingStream.Periods.Add(new FundingPeriodWithSpecificationSelectedForFundingModel
                        {
                            Id = fundingPeriod.Id,
                            Name = fundingPeriod.Name,
                            Specifications = Enumerable.DistinctBy(periodSpecs
                                .Select(s => new SpecificationSelectedForFundingModel
                                {
                                    Id = s.Id,
                                    Name = s.Name
                                }), x => x.Id)
                        });
                    }
                }

                return Ok(fundingStreams);
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/specs/get-fundingperiods-for-selected-fundingstream/{fundingStreamId}")]
        public async Task<IActionResult> GetFundingPeriodsByFundingStreamIds(string fundingStreamId)
        {
            ApiResponse<IEnumerable<Reference>> apiResponse = await _specificationsApiClient.GetFundingPeriodsByFundingStreamIds(fundingStreamId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return Ok(apiResponse.Content);
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/specs/get-fundingstreams-for-selected-specifications")]
        public async Task<IActionResult> GetFundingStreamsForSelectedSpecifications()
        {
            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specificationsApiClient.GetSpecificationsSelectedForFunding();

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                List<Reference> fundingStreams = new List<Reference>();

                foreach (var item in apiResponse.Content)
                {
                    fundingStreams.AddRange(item.FundingStreams);
                }

                return Ok(fundingStreams.Select(x => new
                {
                    x.Name,
                    x.Id
                }).Distinct());
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/specs/fundingstream-id-for-specifications")]
        public async Task<IActionResult> GetDistinctFundingStreamsForSpecifications()
        {
            ApiResponse<IEnumerable<string>> apiResponse = await _specificationsApiClient.GetDistinctFundingStreamsForSpecifications();

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return Ok(apiResponse.Content);
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/specs/specifications-selected-for-funding-by-period/{fundingPeriodId}")]
        public async Task<IActionResult> GetSpecificationsForFundingByPeriod(string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specificationsApiClient.GetSpecificationsSelectedForFundingByPeriod(fundingPeriodId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return Ok(apiResponse.Content.OrderBy(c => c.Name));
            }

            if (apiResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return NoContent();
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/specs/selected-specifications-by-fundingperiod-and-fundingstream/{fundingPeriodId}/{fundingStreamId}")]
        public async Task<IActionResult> GetSpecificationsSelectedForFundingByPeriodAndStream(string fundingPeriodId, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specificationsApiClient.GetSelectedSpecificationsByFundingPeriodIdAndFundingStreamId(fundingPeriodId, fundingStreamId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return Ok(apiResponse.Content.Where(s => s.IsSelectedForFunding).OrderBy(c => c.Name));
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/specs/specifications-by-fundingperiod-and-fundingstream/{fundingPeriodId}/{fundingStreamId}")]
        public async Task<IActionResult> GetApprovedSpecifications(string fundingPeriodId, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specificationsApiClient.GetSpecificationsByFundingPeriodIdAndFundingStreamId(fundingPeriodId, fundingStreamId);

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

        [HttpGet]
        [Route(
            "api/specs/specifications-by-fundingperiod-and-fundingstream/{fundingPeriodId}/{fundingStreamId}/with-results")]
        public async Task<IActionResult> GetApprovedSpecificationsWithResults(string fundingPeriodId, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<SpecificationSummary>> response = await _specificationsApiClient.GetSpecificationResultsByFundingPeriodIdAndFundingStreamId(fundingPeriodId, fundingStreamId);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content.OrderBy(c => c.Name));
            }

            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/specs/specifications-by-fundingperiod-and-fundingstream-trimmed/{fundingPeriodId}/{fundingStreamId}")]
        public async Task<IActionResult> GetApprovedSpecificationsTrimmed(string fundingPeriodId, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specificationsApiClient.GetApprovedSpecificationsByFundingPeriodIdAndFundingStreamId(fundingPeriodId, fundingStreamId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                IEnumerable<SpecificationSummary> specificationSummaries = apiResponse.Content;
                IEnumerable<SpecificationSummary> specificationSummariesTrimmed = await _authorizationHelper.SecurityTrimList(User, specificationSummaries, SpecificationActionTypes.CanChooseFunding);

                return Ok(specificationSummaries.OrderBy(c => c.Name).Select(_ => (_, specificationSummariesTrimmed.Any(trimmedSpec => trimmedSpec.Id == _.Id) == true ? true : false)));
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [Route("api/specs/specification-summary-by-id/{specificationId}")]
        [HttpGet]
        public async Task<IActionResult> GetSpecificationById(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<SpecificationSummary> apiResponse = await _specificationsApiClient.GetSpecificationSummaryById(specificationId);

            if (apiResponse.StatusCode == HttpStatusCode.OK)
            {
                return Ok(apiResponse.Content);
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult((int)apiResponse.StatusCode);
        }

        [HttpPost]
        [Route("api/specs/create")]
        public async Task<IActionResult> CreateSpecification([FromBody] CreateSpecificationViewModel viewModel)
        {
            if (!ModelState.IsValid)
            {
                return new BadRequestObjectResult(ModelState);
            }

            var fundingStreamIds = new List<string> { viewModel.FundingStreamId };

            IEnumerable<FundingStreamPermission> fundingStreamPermissions = await _authorizationHelper.GetUserFundingStreamPermissions(User);
            bool hasPermissionsOnAllTheseStreams = fundingStreamIds
                .All(fundingStreamId => fundingStreamPermissions
                    .Any(x =>
                        x.FundingStreamId == fundingStreamId && x.CanCreateSpecification));
            if (!hasPermissionsOnAllTheseStreams)
            {
                return new ForbidResult();
            }

            CreateSpecificationModel specification = new CreateSpecificationModel
            {
                Description = viewModel.Description,
                Name = viewModel.Name,
                FundingPeriodId = viewModel.FundingPeriodId,
                FundingStreamIds = fundingStreamIds,
                ProviderVersionId = viewModel.ProviderVersionId,
                AssignedTemplateIds = viewModel.AssignedTemplateIds,
                ProviderSnapshotId = viewModel.ProviderSnapshotId,
                CoreProviderVersionUpdates = viewModel.CoreProviderVersionUpdates
            };

            ValidatedApiResponse<SpecificationSummary> result = await _specificationsApiClient.CreateSpecification(specification);

            if (result.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            if (result.StatusCode.IsSuccess())
            {
                return new OkObjectResult(result.Content);
            }

            return new InternalServerErrorResult($"Unable to create specification - result '{result.StatusCode}'");
        }

        [Route("api/specs/{specificationId}/status")]
        [HttpPut]
        public async Task<IActionResult> EditSpecificationStatus(string specificationId, [FromBody] PublishStatusEditModel publishStatusEditModel)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(publishStatusEditModel, nameof(publishStatusEditModel));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanApproveSpecification))
            {
                return new ForbidResult();
            }

            ApiResponse<PublishStatusResponseModel> response = await _specificationsApiClient.UpdateSpecificationStatus(specificationId,
                new PublishStatusRequestModel
                {
                    PublishStatus = publishStatusEditModel.PublishStatus.AsMatchingEnum<Common.Models.Versioning.PublishStatus>()
                });

            return response.Handle("Approve specification", x => Ok(x.Content));
        }

        [Route("api/specs/get-all-specifications")]
        [HttpGet]
        public async Task<IActionResult> GetAllSpecifications([FromQuery] SpecificationSearchRequestViewModel viewModel)
        {
            var searchFilterRequest = new SearchFilterRequest
            {
                Filters = new Dictionary<string, string[]>(),
                ErrorToggle = false,
                SearchMode = SearchMode.All,
                FacetCount = 0,
                PageSize = viewModel.PageSize,
                Page = viewModel.Page,
                IncludeFacets = true,
                SearchFields = new List<string>(),
                SearchTerm = ""
            };

            if (viewModel.Status?.Length > 0)
            {
                searchFilterRequest.Filters.Add("status", viewModel.Status.ToArray());
            }

            if (viewModel.FundingPeriods?.Length > 0)
            {
                searchFilterRequest.Filters.Add("fundingPeriodName", viewModel.FundingPeriods.ToArray());
            }

            if (viewModel.FundingStreams?.Length > 0)
            {
                searchFilterRequest.Filters.Add("fundingStreamNames", viewModel.FundingStreams.ToArray());
            }

            if (!string.IsNullOrEmpty(viewModel.SearchText))
            {
                searchFilterRequest.SearchTerm = viewModel.SearchText;
            }

            PagedResult<SpecificationSearchResultItem> result = await _specificationsApiClient.FindSpecifications(searchFilterRequest);

            if (result != null)
            {
                int totalPages = result.Items.Count() / viewModel.PageSize;
                if (result.Items.Count() % viewModel.PageSize > 0)
                {
                    totalPages++;
                }

                int startNumber = ((viewModel.PageSize * viewModel.Page) - viewModel.PageSize) + 1;
                int endNumber = (viewModel.PageSize * viewModel.Page);
                if (endNumber > result.TotalItems)
                {
                    endNumber = result.TotalItems;
                }

                PagedSpecficationSearchResults searchPagedResult = new PagedSpecficationSearchResults
                {
                    Items = result.Items,
                    TotalCount = result.TotalItems,
                    PagerState = new PagerState(viewModel.Page, result.TotalPages),
                    StartItemNumber = startNumber,
                    EndItemNumber = endNumber,
                    Facets = result.Facets
                };

                return Ok(searchPagedResult);
            }

            return new BadRequestResult();
        }

        [Route("api/specs/update/{specificationId}")]
        [HttpPost]
        public async Task<IActionResult> UpdateSpecification([FromBody] EditSpecificationModel viewModel, [FromRoute] string specificationId)
        {
            FundingStreamPermission fundingStreamPermission = await _authorizationHelper.GetUserFundingStreamPermissions(User, viewModel.FundingStreamId);
            bool? canEditSpecification = fundingStreamPermission?.CanEditSpecification;

            if (canEditSpecification != true)
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<SpecificationSummary> result = await _specificationsApiClient.UpdateSpecification(specificationId, viewModel);

            if (result.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return new OkResult();
            }

            return new BadRequestResult();
        }


        [Route("api/specs/{specificationId}/get-report-metadata/{fundingPeriodId?}")]
        [HttpGet]
        public async Task<IActionResult> GetReportMetadata(string specificationId, string fundingPeriodId = null)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<IEnumerable<SpecificationReport>> response = await _specificationsApiClient.GetReportMetadataForSpecifications(specificationId, fundingPeriodId);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(response.Content);
            }

            return new BadRequestResult();
        }

        [Route("api/specs/{specificationReportId}/download-report")]
        [HttpGet]
        public async Task<IActionResult> DownloadReport(string specificationReportId)
        {
            ApiResponse<SpecificationsDownloadModel> response = await _specificationsApiClient.DownloadSpecificationReport(specificationReportId);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                WebClient client = new WebClient();

                byte[] data = client.DownloadData(response.Content.Url);

                FileContentResult fileContentResult = new FileContentResult(data, "text/csv") { FileDownloadName = response.Content.FileName };

                return fileContentResult;
            }

            return new BadRequestResult();
        }

        [HttpGet]
        [Route("api/specs/{specificationId}/profile-variation-pointers")]
        public async Task<IActionResult> GetProfileVariationPointers(string specificationId)
        {
            ApiResponse<TemplateMetadataDistinctFundingLinesContents> templateMetaDataResponse = null;
            ApiResponse<SpecificationSummary> specResponse = null;
            ApiResponse<IEnumerable<ProfileVariationPointer>> profileResponse =
                await _specificationsApiClient.GetProfileVariationPointers(specificationId);

            if (profileResponse.StatusCode == HttpStatusCode.OK || profileResponse.StatusCode == HttpStatusCode.NoContent)
            {
                IEnumerable<ProfileVariationPointer> currentProfileVariationPointers = profileResponse.Content;

                specResponse = await _specificationsApiClient.GetSpecificationSummaryById(specificationId);

                if (specResponse.StatusCode == HttpStatusCode.OK)
                {
                    SpecificationSummary spec = specResponse.Content;
                    string fundingStreamId = spec.FundingStreams.First().Id;
                    string fundingPeriodId = spec.FundingPeriod.Id;
                    string templateVersion = spec.TemplateIds[fundingStreamId];

                    templateMetaDataResponse =
                        await _policiesApiClient.GetDistinctTemplateMetadataFundingLinesContents(fundingStreamId, fundingPeriodId, templateVersion);

                    if (templateMetaDataResponse.StatusCode == HttpStatusCode.OK)
                    {
                        TemplateMetadataDistinctFundingLinesContents templateMetaData = templateMetaDataResponse.Content;

                        IEnumerable<FundingLineProfileVariationPointer> result = templateMetaData.FundingLines.Where(fl => fl.Type == FundingLineType.Payment).Select(s =>
                            new FundingLineProfileVariationPointer
                            {
                                FundingLineId = s.FundingLineCode,
                                FundingLineName = s.Name,
                                ProfileVariationPointer = currentProfileVariationPointers?.SingleOrDefault(p => p.FundingLineId == s.FundingLineCode)
                            });

                        return Ok(result);
                    }
                }
            }

            IActionResult profileErrorResult = profileResponse.IsSuccessOrReturnFailureResult(nameof(IEnumerable<ProfileVariationPointer>));
            if (profileErrorResult != null)
            {
                return profileErrorResult;
            }

            IActionResult templateErrorResult = templateMetaDataResponse.IsSuccessOrReturnFailureResult(nameof(TemplateMetadataDistinctFundingLinesContents));
            if (templateErrorResult != null)
            {
                return templateErrorResult;
            }

            IActionResult specErrorResult = specResponse.IsSuccessOrReturnFailureResult(nameof(SpecificationSummary));
            if (specErrorResult != null)
            {
                return specErrorResult;
            }

            return new StatusCodeResult(500);
        }

        [Route("api/specs/{specificationId}/profile-variation-pointers")]
        [HttpPut]
        public async Task<IActionResult> SetProfileVariationPointers(
            [FromRoute] string specificationId,
            [FromBody] IEnumerable<ProfileVariationPointer> profileVariationPointers)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(profileVariationPointers, nameof(profileVariationPointers));

            if (!await _authorizationHelper.DoesUserHavePermission(
                User,
                specificationId,
                SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<HttpStatusCode> response =
                await _specificationsApiClient.SetProfileVariationPointers(specificationId, profileVariationPointers);

            if (response.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return new PreconditionFailedResult("Preconditions for setting variation pointers have not been met.");
            }

            return response.Handle("Variation pointers",
                x => Ok(x.Content));
        }

        [Route("api/specs/{specificationId}/profile-variation-pointers")]
        [HttpPatch]
        public async Task<IActionResult> MergeProfileVariationPointers(
            [FromRoute] string specificationId,
            [FromBody] IEnumerable<ProfileVariationPointer> profileVariationPointers)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(profileVariationPointers, nameof(profileVariationPointers));

            if (!await _authorizationHelper.DoesUserHavePermission(
                User,
                specificationId,
                SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<HttpStatusCode> response =
                await _specificationsApiClient.MergeProfileVariationPointers(specificationId, profileVariationPointers);

            if (response.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return new PreconditionFailedResult("Preconditions for setting variation pointers have not been met.");
            }

            return response.Handle("Variation pointers",
                x => Ok(x.Content));
            }
    }
}
