using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Profiling;
using CalculateFunding.Common.ApiClient.Profiling.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.ViewModels.Publish;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ProfilingControllerTests
    {
        private const string ValidFundingStreamId = "A Valid Funding Stream ID";
        private const string ValidFundingPeriodId = "A Valid Funding Period ID";
        private readonly IProfilingApiClient _profilingApiClient = Substitute.For<IProfilingApiClient>();
        private ProfilingController _profilingController;

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
		            profilePeriodPatternInTheCurrentTime.PeriodYear,
		            profilePeriodPatternInTheCurrentTime.Period,
		            profilePeriodPatternInTheCurrentTime.Occurrence,
		            0),
	            new ProfilingInstallment(
		            profilePeriodPatternInTheFuture.PeriodYear,
		            profilePeriodPatternInTheFuture.Period,
		            profilePeriodPatternInTheFuture.Occurrence,
		            0)
            };
	        _profilingApiClient.GetProfilePatternsForFundingStreamAndFundingPeriod(Arg.Any<string>(), Arg.Any<string>())
		        .Returns(new ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>>(HttpStatusCode.OK,
			        new List<FundingStreamPeriodProfilePattern>
			        {
				        new FundingStreamPeriodProfilePattern
				        {
					        CalculateBalancingPayment = false,
					        FundingPeriodId = ValidFundingPeriodId,
					        FundingStreamId = ValidFundingStreamId,
					        FundingStreamPeriodEndDate = new DateTime(2021,3,31),
                            FundingStreamPeriodStartDate = new DateTime(2020,4,1),
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
            _profilingController = new ProfilingController(_profilingApiClient);

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
			_profilingController = new ProfilingController(_profilingApiClient);

            IActionResult result = await _profilingController.GetFutureInstallments(
	            ValidFundingStreamId,
	            ValidFundingPeriodId);

            result.Should().BeAssignableTo<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task GetFutureInstallments_Returns_InternalServerError_Result_Given_NotFound_Result_Is_Returned_From_Client()
        {
	        _profilingApiClient.GetProfilePatternsForFundingStreamAndFundingPeriod(Arg.Any<string>(), Arg.Any<string>())
		        .Returns(new ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>>(HttpStatusCode.NotFound));
			_profilingController = new ProfilingController(_profilingApiClient);

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

			_profilingApiClient.GetProfilePatternsForFundingStreamAndFundingPeriod(Arg.Any<string>(), Arg.Any<string>())
		        .Returns(new ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>>(HttpStatusCode.OK,
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
            _profilingController = new ProfilingController(_profilingApiClient);

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
