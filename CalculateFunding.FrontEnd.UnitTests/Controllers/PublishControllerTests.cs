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

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class PublishControllerTests
    {
        private const string ValidSpecificationId = "A VALID SPECIFICATION ID";
        private readonly ISpecificationsApiClient _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
        private readonly IAuthorizationHelper _authorizationHelper = Substitute.For<IAuthorizationHelper>();
        private readonly IPublishingApiClient _publishingApiClient = Substitute.For<IPublishingApiClient>();
        private readonly ValidatedApiResponse<JobCreationResponse> _validatedApiResponse =
            new ValidatedApiResponse<JobCreationResponse>(HttpStatusCode.OK, new JobCreationResponse { JobId = "ID" });
        private PublishController _publishController;

        [TestInitialize]
        public void Setup()
        {
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
            _publishController =
                new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);

            var fundingDate = DateTime.Now.AddDays(-1);
            var statementDate = DateTime.Now.AddMonths(-1);
            var releaseTimetableViewModel = new ReleaseTimetableViewModel
            {
                SpecificationId = "XYZ",
                FundingDate = fundingDate,
                StatementDate = statementDate
            };
            IActionResult result = await _publishController.SaveTimetable(releaseTimetableViewModel);

            result.Should().BeAssignableTo<OkObjectResult>();
            var specificationPublishDateModelResult = result.As<OkObjectResult>().Value.As<SpecificationPublishDateModel>();
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
            _publishController =
                new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);

            IActionResult result = await _publishController.RefreshFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<OkObjectResult>();
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
            _publishController =
                new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);

            IActionResult result = await _publishController.ApproveFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<OkObjectResult>();
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
            _publishController =
                new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);

            IActionResult result = await _publishController.PublishFunding(ValidSpecificationId);

            result.Should().BeAssignableTo<OkObjectResult>();
        }

        [TestMethod]
        [DataRow(null, "VALID_ID", "VALID_ID")]
        [DataRow("VALID_ID", null, "VALID_ID")]
        [DataRow("VALID_ID", "VALID_ID", null)]
        public async Task GetAllReleasedProfileTotals_Throws_Exception_Given_Invalid_Parameters(
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
            string  aValidId = "VALID_ID";
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
                    {latestProfilingVersion.Version, latestProfilingVersion},
                    {previousProfilingVersion.Version, previousProfilingVersion}
                };

            ApiResponse<IDictionary<int, ProfilingVersion>> publishingApiResponse =
                new ApiResponse<IDictionary<int, ProfilingVersion>>(HttpStatusCode.OK, profileVersions);
            _publishingApiClient.GetAllReleasedProfileTotals(
                    Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
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

            IActionResult result = await _publishController.GetPublishedProviderErrors(ValidSpecificationId);

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

            IActionResult result = await _publishController.GetPublishedProviderErrors(ValidSpecificationId);

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
