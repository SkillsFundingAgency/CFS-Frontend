using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Profiling;
using CalculateFunding.Common.ApiClient.Profiling.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.ViewModels.Profiles;
using CalculateFunding.Frontend.ViewModels.Publish;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ProfilingControllerTests
    {
        private const string ValidFundingStreamId = "A Valid Funding Stream ID";
        private const string ValidFundingPeriodId = "A Valid Funding Period ID";

        private Mock<IProfilingApiClient> _profilingApiClient;
        private ProfilingController _profilingController;

        private Mock<IPublishingApiClient> _publishingApiClient;

        [TestInitialize]
        public void SetUp()
        {
            _publishingApiClient = new Mock<IPublishingApiClient>();
            _profilingApiClient = new Mock<IProfilingApiClient>();

            _profilingController = new ProfilingController(_profilingApiClient.Object,
                _publishingApiClient.Object);
        }

        [TestMethod]
        public void PreviewProfileChange_GuardsAgainstNoRequestBeingSupplied()
        {
            Func<Task<IActionResult>> invocation = () => WhenTheProfileChangeIsPreviewed(null);

            invocation
                .Should()
                .Throw<ArgumentNullException>()
                .Which
                .ParamName
                .Should()
                .Be("requestViewModel");
        }

        [TestMethod]
        [DataRow(ProfileConfigurationTypeViewModel.Custom)]
        [DataRow(ProfileConfigurationTypeViewModel.RuleBased)]
        public async Task PreviewProfileChange_DelegatesToPublishingApiAndReturnsResult(ProfileConfigurationTypeViewModel configurationType)
        {
            ProfilePreviewRequestViewModel requestViewModel = new ProfilePreviewRequestViewModel
            {
                ConfigurationType = configurationType,
                ProviderId = NewRandomString(),
                SpecificationId = NewRandomString(),
                FundingLineCode = NewRandomString(),
                FundingPeriodId = NewRandomString(),
                FundingStreamId = NewRandomString(),
                ProfilePatternKey = NewRandomString()
            };       
            
            IEnumerable<ProfileTotal> profileTotals = ArraySegment<ProfileTotal>.Empty;
            
            GivenTheProfilePreview(requestViewModel, profileTotals);
            
            OkObjectResult result = await WhenTheProfileChangeIsPreviewed(requestViewModel) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeSameAs(profileTotals);
        }

        private void GivenTheProfilePreview(ProfilePreviewRequestViewModel requestViewModel,
            IEnumerable<ProfileTotal> profileTotals)
            => _publishingApiClient.Setup(_ => _.PreviewProfileChange(It.Is<ProfilePreviewRequest>(req =>
                    req.ConfigurationType == requestViewModel.ConfigurationType.AsMatchingEnum<CalculateFunding.Common.ApiClient.Publishing.Models.ProfileConfigurationType>() &&
                    req.ProviderId == requestViewModel.ProviderId &&
                    req.FundingLineCode == requestViewModel.FundingLineCode &&
                    req.FundingPeriodId == requestViewModel.FundingPeriodId &&
                    req.FundingStreamId == requestViewModel.FundingStreamId &&
                    req.ProfilePatternKey == requestViewModel.ProfilePatternKey &&
                    req.SpecificationId == requestViewModel.SpecificationId)))
                .ReturnsAsync(new ApiResponse<IEnumerable<ProfileTotal>>(HttpStatusCode.OK, profileTotals));

        private async Task<IActionResult> WhenTheProfileChangeIsPreviewed(ProfilePreviewRequestViewModel request)
            => await _profilingController.PreviewProfileChange(request);

        private string NewRandomString() => Guid.NewGuid().ToString();

        [TestMethod]
        public async Task GetFutureInstallments_Returns_OK_Result_Given_fundingStream_and_fundingPeriod_Ids()
        {
            ProfilePeriodPattern profilePeriodPatternInThePast = new ProfilePeriodPattern
            {
                DistributionPeriod = $"FY-{DateTime.Now.AddYears(-1).Year}",
                Occurrence = 1,
                Period = DateTime.Now.AddYears(-1).ToString("MMMM"),
                PeriodStartDate = DateTime.Now.AddYears(-1),
                PeriodEndDate = DateTime.Now.AddYears(-1).AddMonths(1),
                PeriodType = PeriodType.CalendarMonth,
                PeriodYear = DateTime.Now.AddYears(-1).Year
            };
            ProfilePeriodPattern profilePeriodPatternInTheCurrentTime = new ProfilePeriodPattern
            {
                DistributionPeriod = $"FY-{DateTime.Now.Year}",
                Occurrence = 1,
                Period = DateTime.Now.ToString("MMMM"),
                PeriodStartDate = DateTime.Now.AddMonths(1),
                PeriodEndDate = DateTime.Now.AddMonths(2),
                PeriodType = PeriodType.CalendarMonth,
                PeriodYear = DateTime.Now.Year
            };
            ProfilePeriodPattern profilePeriodPatternInTheFuture = new ProfilePeriodPattern
            {
                DistributionPeriod = $"FY-{DateTime.Now.AddYears(1).Year}",
                Occurrence = 2,
                Period = DateTime.Now.AddYears(1).ToString("MMMM"),
                PeriodStartDate = DateTime.Now.AddYears(1),
                PeriodEndDate = DateTime.Now.AddYears(1).AddMonths(1),
                PeriodType = PeriodType.CalendarMonth,
                PeriodYear = DateTime.Now.AddYears(1).Year
            };
            List<ProfilingInstallment> expectedFutureInstallments = new List<ProfilingInstallment>
            {
                new ProfilingInstallment(
                    profilePeriodPatternInTheFuture.PeriodYear,
                    profilePeriodPatternInTheFuture.Period,
                    profilePeriodPatternInTheFuture.Occurrence,
                    0)
            };
            _profilingApiClient.Setup(_ =>
                    _.GetProfilePatternsForFundingStreamAndFundingPeriod(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>>(HttpStatusCode.OK,
                    new List<FundingStreamPeriodProfilePattern>
                    {
                        new FundingStreamPeriodProfilePattern
                        {
                            CalculateBalancingPayment = false,
                            FundingPeriodId = ValidFundingPeriodId,
                            FundingStreamId = ValidFundingStreamId,
                            FundingStreamPeriodEndDate = new DateTime(2021, 3, 31),
                            FundingStreamPeriodStartDate = new DateTime(2020, 4, 1),
                            ProfilePattern = new[]
                            {
                                profilePeriodPatternInThePast,
                                profilePeriodPatternInTheCurrentTime,
                                profilePeriodPatternInTheFuture
                            },
                            ProfilePatternKey = null,
                            ReProfilePastPeriods = false
                        }
                    }));

            IActionResult actionResult = await _profilingController.GetFutureInstallments(
                ValidFundingStreamId,
                ValidFundingPeriodId);

            actionResult.Should().BeAssignableTo<OkObjectResult>();
            List<ProfilingInstallment> futureInstallmentsResult = actionResult.As<OkObjectResult>().Value.As<List<ProfilingInstallment>>();
            futureInstallmentsResult.Should().BeEquivalentTo(expectedFutureInstallments);
        }

        [TestMethod]
        public async Task GetFutureInstallments_Returns_InternalServerError_Result_Given_No_Result_Is_Returned_From_Client()
        {
            IActionResult result = await _profilingController.GetFutureInstallments(
                ValidFundingStreamId,
                ValidFundingPeriodId);

            result.Should().BeAssignableTo<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task GetFutureInstallments_Returns_InternalServerError_Result_Given_NotFound_Result_Is_Returned_From_Client()
        {
            _profilingApiClient.Setup(_ =>
                    _.GetProfilePatternsForFundingStreamAndFundingPeriod(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>>(HttpStatusCode.NotFound));

            IActionResult result = await _profilingController.GetFutureInstallments(
                ValidFundingStreamId,
                ValidFundingPeriodId);

            result.Should().BeAssignableTo<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task GetFutureInstallments_Returns_Empty_Result_Given_No_Future_ProfilePatterns_Within_The_Retrieved_ProfilePatterns_ForFundingStream_And_FundingPeriod()
        {
            ProfilePeriodPattern profilePeriodPatternInThePast = new ProfilePeriodPattern
            {
                DistributionPeriod = $"FY-{DateTime.Now.AddYears(-1).Year}",
                Occurrence = 1,
                Period = DateTime.Now.AddYears(-1).ToString("MMMM"),
                PeriodStartDate = DateTime.Now.AddYears(-1),
                PeriodEndDate = DateTime.Now.AddYears(-1).AddMonths(1),
                PeriodType = PeriodType.CalendarMonth,
                PeriodYear = DateTime.Now.AddYears(-1).Year
            };

            _profilingApiClient.Setup(_ =>
                    _.GetProfilePatternsForFundingStreamAndFundingPeriod(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>>(HttpStatusCode.OK,
                    new List<FundingStreamPeriodProfilePattern>
                    {
                        new FundingStreamPeriodProfilePattern
                        {
                            CalculateBalancingPayment = false,
                            FundingPeriodId = ValidFundingPeriodId,
                            FundingStreamId = ValidFundingStreamId,
                            FundingStreamPeriodEndDate = DateTime.Now,
                            FundingStreamPeriodStartDate = DateTime.Now,
                            ProfilePattern = new[]
                            {
                                profilePeriodPatternInThePast
                            },
                            ProfilePatternKey = null,
                            ReProfilePastPeriods = false
                        }
                    }));

            IActionResult actionResult = await _profilingController.GetFutureInstallments(
                ValidFundingStreamId,
                ValidFundingPeriodId);

            actionResult.Should().BeAssignableTo<OkObjectResult>();
            List<ProfilingInstallment> futureInstallmentsResult = actionResult.As<OkObjectResult>().Value.As<List<ProfilingInstallment>>();
            futureInstallmentsResult.Should().NotBeNull();
            futureInstallmentsResult.Count.Should().Be(0);
        }
    }
}