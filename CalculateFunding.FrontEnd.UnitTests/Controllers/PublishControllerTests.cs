using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Publish;
using CalculateFunding.Frontend.ViewModels.Specs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using StackExchange.Redis;

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
        public async Task SaveTimetable_Returns_Forbid_Result_Given_User_Does_Not_Have_Edit_Specification_Permission()
        {
            IActionResult result = await _publishController.SaveTimetable(new ReleaseTimetableViewModel());

            result.Should().BeAssignableTo<ForbidResult>();
        }

        [TestMethod]
        public async Task SaveTimetable_Returns_OK_Result_Given_User_Has_Required_Permission()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanEditSpecification);
            _specificationsApiClient.SetPublishDates(Arg.Any<string>(), Arg.Any<SpecificationPublishDateModel>())
                .Returns(HttpStatusCode.OK);

            DateTime fundingDate = DateTime.Now.AddDays(-1);
            DateTime statementDate = DateTime.Now.AddMonths(-1);
            ReleaseTimetableViewModel releaseTimetableViewModel = new ReleaseTimetableViewModel
            {
                SpecificationId = "XYZ",
                FundingDate = fundingDate,
                StatementDate = statementDate
            };
            IActionResult result = await _publishController.SaveTimetable(releaseTimetableViewModel);

            result.Should().BeAssignableTo<OkObjectResult>();
            SpecificationPublishDateModel specificationPublishDateModelResult = result.As<OkObjectResult>().Value.As<SpecificationPublishDateModel>();
            specificationPublishDateModelResult.EarliestPaymentAvailableDate.Should().Be(fundingDate);
            specificationPublishDateModelResult.ExternalPublicationDate.Should().Be(statementDate);
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
                .BeOfType<OkResult>();
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

            result.Should().BeAssignableTo<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task GetAllReleasedProfileTotals_Returns_Mapped_Profiling_Result_Given_PublishingApi_Returns_Valid_ProfileTotals_Response()
        {
            ProfileTotal aProfileTotalOneYearInThePast = new ProfileTotal
            {
                Occurrence = 1,
                TypeValue = "October",
                Year = DateTime.Now.AddYears(-1).Year,
                Value = 111.0m
            };
            ProfileTotal aProfileTotalOneMonthInThePast = new ProfileTotal
            {
                Occurrence = 2,
                TypeValue = DateTime.Now.AddMonths(-1).ToString("MMMM"),
                Year = DateTime.Now.Year,
                Value = 112.0m
            };
            ProfileTotal aProfileTotalOneYearInTheFuture = new ProfileTotal
            {
                Occurrence = 3,
                TypeValue = "April",
                Year = DateTime.Now.AddYears(1).Year,
                Value = 113.0m
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
            profilingViewModelResult.ProfilingInstallments.ToList()[0].InstallmentMonth.Should()
                .Be(aProfileTotalOneYearInThePast.TypeValue);
            profilingViewModelResult.ProfilingInstallments.ToList()[0].InstallmentYear.Should()
                .Be(aProfileTotalOneYearInThePast.Year);
            profilingViewModelResult.ProfilingInstallments.ToList()[0].InstallmentNumber.Should()
                .Be(aProfileTotalOneYearInThePast.Occurrence);
            profilingViewModelResult.ProfilingInstallments.ToList()[0].InstallmentValue.Should()
                .Be(aProfileTotalOneYearInThePast.Value);
            profilingViewModelResult.ProfilingInstallments.ToList()[0].IsPaid.Should()
                .Be(true);
            profilingViewModelResult.ProfilingInstallments.ToList()[1].IsPaid.Should()
                .Be(true);
            profilingViewModelResult.ProfilingInstallments.ToList()[2].IsPaid.Should()
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

            _publishingApiClient
                .QueueSpecificationFundingStreamSqlImport(specificationId, fundingStreamId)
                .Returns(new ApiResponse<JobCreationResponse>(HttpStatusCode.OK, expectedJob));

            OkObjectResult result = await WhenTheRunSqlJobIsCreated(specificationId, fundingStreamId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(expectedJob);
        }

        private static string NewRandomString() => Guid.NewGuid().ToString();

        private async Task<IActionResult> WhenTheRunSqlJobIsCreated(string specificationId,
            string fundingStreamId)
            => await _publishController.RunSqlImportJob(specificationId, fundingStreamId);

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