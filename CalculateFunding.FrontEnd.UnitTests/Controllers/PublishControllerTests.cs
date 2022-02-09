using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Provider;
using CalculateFunding.Frontend.ViewModels.Publish;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class PublishControllerTests
    {
        private const string ValidSpecificationId = "A VALID SPECIFICATION ID";

        private ISpecificationsApiClient _specificationsApiClient;
        private IAuthorizationHelper _authorizationHelper;
        private IPublishingApiClient _publishingApiClient;
        private ValidatedApiResponse<JobCreationResponse> _validatedApiResponse;

        private PublishController _publishController;

        [TestInitialize]
        public void Setup()
        {
            _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
            _authorizationHelper = Substitute.For<IAuthorizationHelper>();
            _publishingApiClient = Substitute.For<IPublishingApiClient>();
            _validatedApiResponse =
                new ValidatedApiResponse<JobCreationResponse>(HttpStatusCode.OK,
                    new JobCreationResponse
                    {
                        JobId = "ID"
                    });

            _publishController =
                new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);
        }

        [TestMethod]
        public async Task RefreshFunding_Returns_Forbid_Result_Given_User_Does_Not_Have_Refresh_Funding_Permission()
        {
            IActionResult result = await _publishController.RefreshFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<ForbidResult>();
        }

        [TestMethod]
        public async Task RefreshFunding_Returns_OK_Result_Given_User_Has_Required_Permission()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanRefreshFunding);

            _publishingApiClient.RefreshFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);

            IActionResult result = await _publishController.RefreshFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<OkObjectResult>();
        }

        [TestMethod]
        public async Task RefreshFunding_Returns_BadRequestForBadRequestApiResponses()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanRefreshFunding);

            _validatedApiResponse = new ValidatedApiResponse<JobCreationResponse>(HttpStatusCode.BadRequest);

            _publishingApiClient.RefreshFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);

            IActionResult result = await _publishController.RefreshFunding(ValidSpecificationId);

            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task ValidateSpecificationForRefresh_ReturnsOk_ForNoContentApiResponses()
        {
            ValidatedApiResponse<IEnumerable<string>> apiResponse
                = new ValidatedApiResponse<IEnumerable<string>>(HttpStatusCode.NoContent, null);

            _publishingApiClient
                .ValidateSpecificationForRefresh(Arg.Is(ValidSpecificationId))
                .Returns(apiResponse);

            IActionResult result = await _publishController.ValidateSpecificationForRefresh(ValidSpecificationId);

            result
                .Should()
                .BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task ValidateSpecificationForRefresh_ReturnsInternalServerResult_ForNonSuccessApiResponses()
        {
            ValidatedApiResponse<IEnumerable<string>> apiResponse
                = new ValidatedApiResponse<IEnumerable<string>>(HttpStatusCode.InternalServerError, null);

            _publishingApiClient
                .ValidateSpecificationForRefresh(Arg.Is(ValidSpecificationId))
                .Returns(apiResponse);

            IActionResult result = await _publishController.ValidateSpecificationForRefresh(ValidSpecificationId);

            result
                .Should()
                .BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task ValidateSpecificationForRefresh_ReturnsBadRequest_ForBadRequestApiResponses()
        {
            string errorMessage = "Error";
            IEnumerable<string> errors = new[] { errorMessage };

            ValidatedApiResponse<IEnumerable<string>> apiResponse
                = new ValidatedApiResponse<IEnumerable<string>>(HttpStatusCode.BadRequest)
                {
                    ModelState = new Dictionary<string, IEnumerable<string>> {
                        { "", errors }
                    }
                };

            _publishingApiClient
                .ValidateSpecificationForRefresh(Arg.Is(ValidSpecificationId))
                .Returns(apiResponse);

            IActionResult result = await _publishController.ValidateSpecificationForRefresh(ValidSpecificationId);

            result.Should().BeOfType<BadRequestObjectResult>();

            BadRequestObjectResult okObjectResult = result as BadRequestObjectResult;
            okObjectResult.Should().NotBeNull();
            okObjectResult.Value.Should().NotBeNull();
            okObjectResult.Value.Should().BeOfType<Dictionary<string, IEnumerable<string>>>();

            Dictionary<string, IEnumerable<string>> content = okObjectResult.Value as Dictionary<string, IEnumerable<string>>;
            content.Should().NotBeNull();
            content.FirstOrDefault().Should().NotBeNull();
            content.FirstOrDefault().Value.Count().Should().Be(1);
            content.FirstOrDefault().Value.FirstOrDefault().Should().Be(errorMessage);
        }

        [TestMethod]
        public async Task ApproveFunding_Returns_Forbid_Result_Given_User_Does_Not_Have_Approve_Permission()
        {
            IActionResult result = await _publishController.ApproveFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<ForbidResult>();
        }

        [TestMethod]
        public async Task ApproveFunding_Returns_OK_Result_Given_User_Has_Required_Permission()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanApproveFunding);

            _publishingApiClient.ApproveFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);

            IActionResult result = await _publishController.ApproveFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<OkObjectResult>();
        }

        [TestMethod]
        public async Task ApproveFunding_Returns_BadRequestForBadRequestApiResponses()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanApproveFunding);

            _validatedApiResponse = new ValidatedApiResponse<JobCreationResponse>(HttpStatusCode.BadRequest);

            _publishingApiClient.ApproveFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);

            IActionResult result = await _publishController.ApproveFunding(ValidSpecificationId);

            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task PublishFunding_Returns_Forbid_Result_Given_User_Does_Not_Have_ReleaseFunding_Permission()
        {
            IActionResult result = await _publishController.PublishFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<ForbidResult>();
        }

        [TestMethod]
        public async Task PublishFunding_Returns_OK_Result_Given_User_Has_Required_Permission()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanReleaseFunding);
            _publishingApiClient.PublishFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);

            IActionResult result = await _publishController.PublishFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<OkObjectResult>();
        }

        [TestMethod]
        public async Task PublishFunding_Returns_BadRequestForBadRequestApiResponses()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanReleaseFunding);

            _validatedApiResponse = new ValidatedApiResponse<JobCreationResponse>(HttpStatusCode.BadRequest);

            _publishingApiClient.PublishFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);

            IActionResult result = await _publishController.PublishFunding(ValidSpecificationId);

            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        [DataRow(null, "VALID_ID", "VALID_ID")]
        [DataRow("VALID_ID", null, "VALID_ID")]
        [DataRow("VALID_ID", "VALID_ID", null)]
        public void GetAllReleasedProfileTotals_Throws_Exception_Given_Invalid_Parameters(
            string fundingStreamId,
            string fundingPeriodId,
            string providerId)
        {
            Func<Task> action = async () => await _publishController.GetAllReleasedProfileTotals(
                fundingStreamId,
                fundingPeriodId,
                providerId);

            action.Should().Throw<ArgumentNullException>();
        }

        [TestMethod]
        public async Task GetAllReleasedProfileTotals_Returns_NotFoundObjectResult_Result_Given_PublishingApi_Returns_An_Empty_Ok_Result()
        {
            string aValidId = "VALID_ID";
            _publishingApiClient.GetAllReleasedProfileTotals(aValidId, aValidId, aValidId)
                .Returns(new ApiResponse<IDictionary<int, ProfilingVersion>>(HttpStatusCode.OK));

            IActionResult result = await _publishController.GetAllReleasedProfileTotals(
                aValidId,
                aValidId,
                aValidId);

            result.Should().BeAssignableTo<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task GetAllReleasedProfileTotals_Returns_InternalServerErrorResult_Result_Given_PublishingApi_Returns_BadRequest()
        {
            string aValidId = "VALID_ID";
            _publishingApiClient.GetAllReleasedProfileTotals(aValidId, aValidId, aValidId)
                .Returns(new ApiResponse<IDictionary<int, ProfilingVersion>>(HttpStatusCode.BadRequest));

            IActionResult result = await _publishController.GetAllReleasedProfileTotals(
                aValidId,
                aValidId,
                aValidId);

            result.Should().BeAssignableTo<BadRequestResult>();
        }

        [TestMethod]
        public async Task GetAllReleasedProfileTotals_Returns_Mapped_Profiling_Result_Given_PublishingApi_Returns_Valid_ProfileTotals_Response()
        {
            ProfileTotal aProfileTotalOneYearInThePast = new ProfileTotal
            {
                Occurrence = 1,
                TypeValue = "October",
                Year = DateTime.Now.AddYears(-1).Year,
                Value = 111.0m,
                PeriodType = "CalendarMonth"
            };
            ProfileTotal aProfileTotalOneMonthInThePast = new ProfileTotal
            {
                Occurrence = 2,
                TypeValue = DateTime.Now.AddMonths(-1).ToString("MMMM"),
                Year = DateTime.Now.AddMonths(-1).Year,
                Value = 112.0m,
                PeriodType = "CalendarMonth"
            };
            ProfileTotal aProfileTotalOneYearInTheFuture = new ProfileTotal
            {
                Occurrence = 3,
                TypeValue = "April",
                Year = DateTime.Now.AddYears(1).Year,
                Value = 113.0m,
                PeriodType = "CalendarMonth"
            };
            List<ProfileTotal> profileTotals = new List<ProfileTotal>
            {
                aProfileTotalOneYearInThePast,
                aProfileTotalOneMonthInThePast,
                aProfileTotalOneYearInTheFuture
            };
            ProfilingVersion latestProfilingVersion = new ProfilingVersion
            {
                Date = new DateTimeOffset(),
                ProfileTotals = profileTotals,
                Version = 2
            };
            ProfilingVersion previousProfilingVersion = new ProfilingVersion
            {
                Date = new DateTimeOffset(),
                ProfileTotals = new List<ProfileTotal>
                {
                    new ProfileTotal
                    {
                        Occurrence = 1,
                        TypeValue = DateTime.Now.ToString("MMMM"),
                        Year = DateTime.Now.Year,
                        Value = 999.0m
                    },
                    new ProfileTotal
                    {
                        Occurrence = 2,
                        TypeValue = DateTime.Now.ToString("MMMM"),
                        Year = DateTime.Now.Year,
                        Value = 1.0m
                    }
                },
                Version = 1
            };
            IDictionary<int, ProfilingVersion> profileVersions =
                new Dictionary<int, ProfilingVersion>
                {
                    {
                        latestProfilingVersion.Version, latestProfilingVersion
                    },
                    {
                        previousProfilingVersion.Version, previousProfilingVersion
                    }
                };

            ApiResponse<IDictionary<int, ProfilingVersion>> publishingApiResponse =
                new ApiResponse<IDictionary<int, ProfilingVersion>>(HttpStatusCode.OK, profileVersions);
            _publishingApiClient.GetAllReleasedProfileTotals(
                    Arg.Any<string>(),
                    Arg.Any<string>(),
                    Arg.Any<string>())
                .Returns(publishingApiResponse);

            IActionResult result = await _publishController.GetAllReleasedProfileTotals(
                "A VALID FUNDING STREAM ID",
                "A VALID FUNDING PERIOD ID",
                "A VALID PROVIDER ID");

            ProfilingViewModel profilingViewModelResult = result.As<OkObjectResult>().Value.As<ProfilingViewModel>();
            result.Should().BeAssignableTo<OkObjectResult>();
            profilingViewModelResult.TotalAllocation.Should().Be(latestProfilingVersion.ProfileTotals.Sum(
                profileTotal => profileTotal.Value));
            profilingViewModelResult.PreviousAllocation.Should().Be(previousProfilingVersion.ProfileTotals.Sum(
                profileTotal => profileTotal.Value));

            List<ProfilingInstallment> profilingInstallments = profilingViewModelResult.ProfilingInstallments.ToList();

            profilingInstallments[0].InstallmentMonth.Should()
                .Be(aProfileTotalOneYearInThePast.TypeValue);
            profilingInstallments[0].InstallmentYear.Should()
                .Be(aProfileTotalOneYearInThePast.Year);
            profilingInstallments[0].InstallmentNumber.Should()
                .Be(aProfileTotalOneYearInThePast.Occurrence);
            profilingInstallments[0].InstallmentValue.Should()
                .Be(aProfileTotalOneYearInThePast.Value);
            profilingInstallments[0].IsPaid.Should()
                .Be(true);
            profilingInstallments[1].IsPaid.Should()
                .Be(true);
            profilingInstallments[2].IsPaid.Should()
                .Be(false);
        }

        [TestMethod]
        public async Task GetPublishedProviderErrors_ReturnsNotFound_WhenUnderlyingAPIReturnsNotFound()
        {
            _publishingApiClient
                .GetPublishedProviderErrors(ValidSpecificationId)
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.NotFound));

            IActionResult result = await _publishController.GetSpecProviderErrors(ValidSpecificationId);

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task GetPublishedProviderErrors_ReturnsErrorSummaries_WhenUnderlyingAPIReturnsErrorSummaries()
        {
            string errorSummary = "Error";

            IEnumerable<string> errorSummaries = new List<string>
            {
                errorSummary
            };

            _publishingApiClient
                .GetPublishedProviderErrors(ValidSpecificationId)
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, errorSummaries));

            IActionResult result = await _publishController.GetSpecProviderErrors(ValidSpecificationId);

            result.Should().BeOfType<OkObjectResult>();
            OkObjectResult okObjectResult = result as OkObjectResult;
            okObjectResult.Should().NotBeNull();
            okObjectResult.Value.Should().NotBeNull();
            okObjectResult.Value.Should().BeOfType<List<string>>();

            IEnumerable<string> actualErrorSummaries = okObjectResult.Value as IEnumerable<string>;

            actualErrorSummaries.Count().Should().Be(1);

            string actualErrorSummary = actualErrorSummaries.FirstOrDefault();
            actualErrorSummary.Should().Be(errorSummary);
        }

        [TestMethod]
        public void RunSqlImportJobGuardsAgainstMissingSpecificationId()
        {
            Func<Task<IActionResult>> invocation = () => WhenTheRunSqlJobIsCreated(null, "something");

            invocation
                .Should()
                .ThrowAsync<ArgumentNullException>()
                .Result
                .Which
                .ParamName
                .Should()
                .Be("specificationId");
        }

        [TestMethod]
        public void RunSqlImportJobGuardsAgainstMissingFundingStreamId()
        {
            Func<Task<IActionResult>> invocation = () => WhenTheRunSqlJobIsCreated("something", null);

            invocation
                .Should()
                .ThrowAsync<ArgumentNullException>()
                .Result
                .Which
                .ParamName
                .Should()
                .Be("fundingStreamId");
        }

        [TestMethod]
        public async Task RunSqlImportJobDelegatesToPublishingEndPointAndReturnsJobDetails()
        {
            string specificationId = NewRandomString();
            string fundingStreamId = NewRandomString();

            JobCreationResponse expectedJob = new JobCreationResponse();

            _authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(),
                    specificationId,
                    SpecificationActionTypes.CanRefreshPublishedQa)
                .Returns(Task.FromResult(true));

            _publishingApiClient
                .QueueSpecificationFundingStreamSqlImport(specificationId, fundingStreamId)
                .Returns(new ApiResponse<JobCreationResponse>(HttpStatusCode.OK, expectedJob));

            OkObjectResult result = await WhenTheRunSqlJobIsCreated(specificationId, fundingStreamId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedJob);
        }

        [TestMethod]
        public async Task RunSqlImportJobGuardedByCanRefreshPublishedQaPermission()
        {
            string specificationId = NewRandomString();
            string fundingStreamId = NewRandomString();

            ForbidResult result = await WhenTheRunSqlJobIsCreated(specificationId, fundingStreamId) as ForbidResult;

            result
                .Should()
                .NotBeNull();

            await _publishingApiClient
                .Received(0)
                .QueueSpecificationFundingStreamSqlImport(specificationId, fundingStreamId);
        }

        [TestMethod]
        public void RunReleasedSqlImportJobGuardsAgainstMissingSpecificationId()
        {
            Func<Task<IActionResult>> invocation = () => WhenTheRunReleasedSqlJobIsCreated(null, "something");

            invocation
                .Should()
                .ThrowAsync<ArgumentNullException>()
                .Result
                .Which
                .ParamName
                .Should()
                .Be("specificationId");
        }

        [TestMethod]
        public void RunReleasedSqlImportJobGuardsAgainstMissingFundingStreamId()
        {
            Func<Task<IActionResult>> invocation = () => WhenTheRunReleasedSqlJobIsCreated("something", null);

            invocation
                .Should()
                .ThrowAsync<ArgumentNullException>()
                .Result
                .Which
                .ParamName
                .Should()
                .Be("fundingStreamId");
        }

        [TestMethod]
        public async Task RunReleasedSqlImportJobDelegatesToPublishingEndPointAndReturnsJobDetails()
        {
            string specificationId = NewRandomString();
            string fundingStreamId = NewRandomString();

            JobCreationResponse expectedJob = new JobCreationResponse();

            _authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(),
                    specificationId,
                    SpecificationActionTypes.CanRefreshPublishedQa)
                .Returns(Task.FromResult(true));

            _publishingApiClient
                .QueueSpecificationFundingStreamReleasedSqlImport(specificationId, fundingStreamId)
                .Returns(new ApiResponse<JobCreationResponse>(HttpStatusCode.OK, expectedJob));

            OkObjectResult result = await WhenTheRunReleasedSqlJobIsCreated(specificationId, fundingStreamId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedJob);
        }

        [TestMethod]
        public async Task RunReleasedSqlImportJobGuardedByCanRefreshPublishedQaPermission()
        {
            string specificationId = NewRandomString();
            string fundingStreamId = NewRandomString();

            ForbidResult result = await WhenTheRunReleasedSqlJobIsCreated(specificationId, fundingStreamId) as ForbidResult;

            result
                .Should()
                .NotBeNull();

            await _publishingApiClient
                .Received(0)
                .QueueSpecificationFundingStreamReleasedSqlImport(specificationId, fundingStreamId);
        }

        [TestMethod]
        public async Task GetLatestPublishedDateDelegatesToPublishingEndPointAndReturnsLatestDate()
        {
            string fundingPeriodId = NewRandomString();
            string fundingStreamId = NewRandomString();

            LatestPublishedDate expectedLatestDate = new LatestPublishedDate();

            _publishingApiClient
                .GetLatestPublishedDate(fundingStreamId, fundingPeriodId)
                .Returns(new ApiResponse<LatestPublishedDate>(HttpStatusCode.OK, expectedLatestDate));

            OkObjectResult result = await WhenTheLatestPublishedDateIsQueried(fundingPeriodId, fundingStreamId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedLatestDate);
        }

        [TestMethod]
        public async Task UploadBatchDelegatesToPublishingEndPoint()
        {
            Mock<IFormFile> file = new Mock<IFormFile>();
            byte[] contents = { 3, 63, 8, 100 };
            MemoryStream ms = new MemoryStream();
            StreamWriter writer = new StreamWriter(ms);
            writer.Write(File.Create("blah blah"));
            await writer.FlushAsync();
            ms.Position = 0;
            file.Setup(_ => _.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns((Stream stream, CancellationToken token) => ms.CopyToAsync(stream))
                .Verifiable();
            file.SetupGet(x => x.Length).Returns(contents.Length);
            BatchUploadResponse expectedResponse = new BatchUploadResponse { BatchId = Guid.NewGuid().ToString(), Url = "http:whatever" };

            _publishingApiClient
                .UploadBatch(Arg.Any<BatchUploadRequest>())
                .Returns(new ApiResponse<BatchUploadResponse>(HttpStatusCode.OK, expectedResponse));

            OkObjectResult result = await _publishController.UploadBatch(file.Object) as OkObjectResult;

            result.Should().NotBeNull();
            result?
                .Value
                .Should()
                .BeSameAs(expectedResponse);
        }

        [TestMethod]
        public async Task QueueBatchUploadValidationDelegatesToPublishingEndPoint()
        {
            BatchUploadValidationRequestViewModel request = new BatchUploadValidationRequestViewModel
            {
                BatchId = NewRandomString(),
                FundingPeriodId = NewRandomString(),
                FundingStreamId = NewRandomString()
            };

            JobCreationResponse expectedResponse = new JobCreationResponse();

            _publishingApiClient.QueueBatchUploadValidation(Arg.Is<BatchUploadValidationRequest>(req =>
                    req.BatchId == request.BatchId &&
                    req.FundingStreamId == request.FundingStreamId &&
                    req.FundingPeriodId == request.FundingPeriodId))
                .Returns(new ValidatedApiResponse<JobCreationResponse>(HttpStatusCode.OK, expectedResponse));

            OkObjectResult result = await _publishController.QueueBatchUploadValidation(request) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedResponse);
        }

        [TestMethod]
        public async Task GenerateCsvForBatchPublishedProvidersForApprovalDelegatesToPublishingEndPoint()
        {
            string specificationId = NewRandomString();

            PublishedProviderIdsRequest request = new PublishedProviderIdsRequest
            {
                PublishedProviderIds = new List<string>
                {
                    NewRandomString()
                }
            };

            PublishedProviderDataDownload expectedResponse = new PublishedProviderDataDownload();

            _publishingApiClient.GenerateCsvForBatchPublishedProvidersForApproval(Arg.Is(request), Arg.Is(specificationId))
                .Returns(new ApiResponse<PublishedProviderDataDownload>(HttpStatusCode.OK, expectedResponse));

            OkObjectResult result = await _publishController.GenerateCsvForBatchPublishedProvidersForApproval(request, specificationId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedResponse);
        }

        [TestMethod]
        public async Task GenerateCsvForAllPublishedProvidersForApprovalDelegatesToPublishingEndPoint()
        {
            string specificationId = NewRandomString();

            PublishedProviderDataDownload expectedResponse = new PublishedProviderDataDownload();

            _publishingApiClient.GenerateCsvForAllPublishedProvidersForApproval(Arg.Is(specificationId))
                .Returns(new ApiResponse<PublishedProviderDataDownload>(HttpStatusCode.OK, expectedResponse));

            OkObjectResult result = await _publishController.GenerateCsvForAllPublishedProvidersForApproval(specificationId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedResponse);
        }

        [TestMethod]
        public async Task GenerateCsvForBatchPublishedProvidersForReleaseDelegatesToPublishingEndPoint()
        {
            string specificationId = NewRandomString();

            PublishedProviderIdsRequest request = new PublishedProviderIdsRequest
            {
                PublishedProviderIds = new List<string>
                {
                    NewRandomString()
                }
            };

            PublishedProviderDataDownload expectedResponse = new PublishedProviderDataDownload();

            _publishingApiClient.GenerateCsvForBatchPublishedProvidersForRelease(Arg.Is(request), Arg.Is(specificationId))
                .Returns(new ApiResponse<PublishedProviderDataDownload>(HttpStatusCode.OK, expectedResponse));

            OkObjectResult result = await _publishController.GenerateCsvForBatchPublishedProvidersForRelease(request, specificationId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedResponse);
        }

        [TestMethod]
        public async Task GenerateCsvForAllPublishedProvidersForReleaseDelegatesToPublishingEndPoint()
        {
            string specificationId = NewRandomString();

            PublishedProviderDataDownload expectedResponse = new PublishedProviderDataDownload();

            _publishingApiClient.GenerateCsvForAllPublishedProvidersForRelease(Arg.Is(specificationId))
                .Returns(new ApiResponse<PublishedProviderDataDownload>(HttpStatusCode.OK, expectedResponse));

            OkObjectResult result = await _publishController.GenerateCsvForAllPublishedProvidersForRelease(specificationId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedResponse);
        }

        [TestMethod]
        public async Task GetBatchPublishedProviderIdsDelegatesToPublishingEndPoint()
        {
            string batchId = NewRandomString();

            IEnumerable<string> expectedResponse = ArraySegment<string>.Empty;

            _publishingApiClient.GetBatchPublishedProviderIds(batchId)
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, expectedResponse));

            OkObjectResult result = await _publishController.GetBatchPublishedProviderIds(batchId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedResponse);
        }

        [TestMethod]
        public async Task GetCurrentPublishedProvider_Returns_BadRequestForBadRequestApiResponses()
        {
            string fundingStreamId = NewRandomString();
            string specificationId = NewRandomString();
            string providerId = NewRandomString();

            _publishingApiClient.GetCurrentPublishedProviderVersion(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                .Returns(new ApiResponse<PublishedProviderVersion>(HttpStatusCode.BadRequest));

            IActionResult result = await _publishController.GetCurrentPublishedProviderVersion(fundingStreamId, specificationId, providerId);

            result.Should().BeAssignableTo<BadRequestResult>();
        }

        [TestMethod]
        public async Task GetCurrentPublishedProvider_Returns_Ok_ForCorrectModel()
        {
            string fundingStreamId = NewRandomString();
            string specificationId = NewRandomString();
            string providerId = NewRandomString();
            string ukprn = NewRandomString();
            string name = NewRandomString();

            _publishingApiClient.GetCurrentPublishedProviderVersion(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                .Returns(new ApiResponse<PublishedProviderVersion>(HttpStatusCode.OK, new PublishedProviderVersion
                {
                    Provider = new Provider
                    {
                        UKPRN = ukprn,
                        Name = name
                    },
                    IsIndicative = true
                }));

            IActionResult result = await _publishController.GetCurrentPublishedProviderVersion(fundingStreamId, specificationId, providerId);

            result.Should().BeAssignableTo<OkObjectResult>();
            PublishedProviderVersionViewModel publishedProviderVersionViewModel = result.As<OkObjectResult>().Value.As<PublishedProviderVersionViewModel>();
            publishedProviderVersionViewModel.UKPRN.Should().Be(ukprn);
            publishedProviderVersionViewModel.Name.Should().Be(name);
            publishedProviderVersionViewModel.IsIndicative.Should().Be(true);
        }

        private static string NewRandomString() => Guid.NewGuid().ToString();

        private async Task<IActionResult> WhenTheRunSqlJobIsCreated(string specificationId,
            string fundingStreamId)
            => await _publishController.RunSqlExportToSqlJob(specificationId, fundingStreamId);

        private async Task<IActionResult> WhenTheRunReleasedSqlJobIsCreated(string specificationId,
        string fundingStreamId)
        => await _publishController.RunReleasedSqlExportToSqlJob(specificationId, fundingStreamId);

        private async Task<IActionResult> WhenTheLatestPublishedDateIsQueried(string fundingStreamId,
            string fundingPeriodId)
            => await _publishController.GetLatestPublishedDate(fundingStreamId, fundingPeriodId);

        private void SetupAuthorizedUser(SpecificationActionTypes specificationActionType)
        {
            _authorizationHelper.DoesUserHavePermission(
                    _publishController.User,
                    Arg.Any<string>(),
                    specificationActionType)
                .Returns(true);
        }
    }
}