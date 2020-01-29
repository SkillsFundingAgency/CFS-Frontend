using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class SpecificationControllerTests
    {
        private ISpecificationsApiClient _specificationsApiClient;
        private SpecificationController _specificationController;

        [TestInitialize]
        public void Initialize()
        {
			
            _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
			_specificationController = new SpecificationController(_specificationsApiClient, authorizationHelper);
        }

        [TestMethod]
        public void GetSpecificationsForFundingByPeriod_OnNullFundingPeriod_ThenReturnsBadRequestResponse()
        {
            // Act
            Func<Task> a = new Func<Task>(async () =>
            {
                IActionResult result = await _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(null, null);
            });

            // Assert
            a.Should().Throw<ArgumentNullException>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnNullFundingStream_ThenReturnsBadRequestResponse()
        {
            // Arrange
            const string fundingPeriod = "fundingPeriod";

            // Act
            Func<Task> a = new Func<Task>(async () =>
            {
                IActionResult result = await _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriod, null);
            });

            // Assert
            a.Should().Throw<ArgumentNullException>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnBadRequestStatusFromSpecApiClient_ThenReturnsBadRequestResponse()
        {
            // Arrange
            const string fundingPeriodId = "fundingPeriodId";
            const string fundingStreamId = "fundingStreamId";

            _specificationsApiClient
                .GetApprovedSpecifications(fundingPeriodId, fundingStreamId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.ServiceUnavailable, null)));

            // Act
            IActionResult result = await _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().BeOfType<StatusCodeResult>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnNotExpectingStatusFromSpecApiClient_ThenReturnsInternalServerErrorResponse()
        {
            // Arrange
            const string fundingPeriodId = "fundingPeriodId";
            const string fundingStreamId = "fundingStreamId";

            _specificationsApiClient
                .GetApprovedSpecifications(fundingPeriodId, fundingStreamId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.BadRequest, null)));

            // Act
            IActionResult result = await _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnSuccessfulGetRequest_ThenResponseSentToClient()
        {
            // Arrange
            const string fundingPeriodId = "fundingPeriodId";
            const string fundingStreamId = "fundingStreamId";

            SpecificationSummary notSelectedForFunding = new SpecificationSummary
            {
                IsSelectedForFunding = false
            };

            SpecificationSummary selectedForFundingOnSecondOrder = new SpecificationSummary
            {
                IsSelectedForFunding = true,
                Name = "ZZZ"
            };

            SpecificationSummary selectedForFundingOnFirstOrder = new SpecificationSummary
            {
                IsSelectedForFunding = true,
                Name = "AAA"
            };

            List<SpecificationSummary> specificationSummaries = new List<SpecificationSummary>
            {
                notSelectedForFunding,
                selectedForFundingOnSecondOrder,
                selectedForFundingOnFirstOrder
            };

            _specificationsApiClient
                .GetApprovedSpecifications(fundingPeriodId, fundingStreamId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specificationSummaries)));

            // Act
            IActionResult result = await _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();

            OkObjectResult typedResult = result as OkObjectResult;
            IEnumerable<SpecificationSummary> specificationSummariesResult = typedResult.Value as IEnumerable<SpecificationSummary>;

            specificationSummariesResult.First().Name.Should().Be(selectedForFundingOnFirstOrder.Name);
            specificationSummariesResult.Last().Name.Should().Be(selectedForFundingOnSecondOrder.Name);
        }

        [TestMethod]
        public async Task GetDistinctFundingStreamsForSpecifications_Returns_Bad_Request_Given_Api_Returns_Bad_Request_Status()
        {
            _specificationsApiClient
	            .GetDistinctFundingStreamsForSpecifications()
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<string>>(HttpStatusCode.BadRequest, null)));

            IActionResult result = await _specificationController.GetDistinctFundingStreamsForSpecifications();

            result.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task GetDistinctFundingStreamsForSpecifications_Returns_Internal_Server_Error_Api_Result_Is_Not_Ok_or_Bad_Request()
        {
            _specificationsApiClient
	            .GetDistinctFundingStreamsForSpecifications()
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<string>>(HttpStatusCode.ServiceUnavailable, null)));

            IActionResult result = await _specificationController.GetDistinctFundingStreamsForSpecifications();

			result.Should().BeEquivalentTo(new StatusCodeResult(500));
        }

        [TestMethod]
        public async Task GetDistinctFundingStreamsForSpecifications_Returns_Funding_Streams_Given_A_Successful_Request()
        {
			List<string> expectedFundingStreams = new List<string> { "PSG", "DSG" };
            _specificationsApiClient
	            .GetDistinctFundingStreamsForSpecifications()
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, expectedFundingStreams)));

            IActionResult result = await _specificationController.GetDistinctFundingStreamsForSpecifications();

			result.As<OkObjectResult>().Value.As<List<string>>().Count.Should().Be(expectedFundingStreams.Count);
        }
    }
}
