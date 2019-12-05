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
        private IAuthorizationHelper _authorizationHelper;

        [TestInitialize]
        public void Initialize()
        {
            _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
            _authorizationHelper = Substitute.For<IAuthorizationHelper>();
        }

        [TestMethod]
        public void GetSpecificationsForFundingByPeriod_OnNullFundingPeriod_ThenReturnsBadRequestResponse()
        {
            // Arrange
            SpecificationController controller = CreateSpecificationController();

            // Act
            Func<Task> a = new Func<Task>(async () =>
            {
                IActionResult result = await controller.GetSpecificationsSelectedForFundingByPeriodAndStream(null, null);
            });

            // Assert
            a.Should().Throw<ArgumentNullException>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnNullFundingStream_ThenReturnsBadRequestResponse()
        {
            // Arrange
            SpecificationController controller = CreateSpecificationController();
            const string fundingPeriod = "fundingPeriod";

            // Act
            Func<Task> a = new Func<Task>(async () =>
            {
                IActionResult result = await controller.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriod, null);
            });

            // Assert
            a.Should().Throw<ArgumentNullException>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnBadRequestStatusFromSpecApiClient_ThenReturnsBadRequestResponse()
        {
            // Arrange
            SpecificationController controller = CreateSpecificationController();
            const string fundingPeriodId = "fundingPeriodId";
            const string fundingStreamId = "fundingStreamId";

            _specificationsApiClient
                .GetApprovedSpecifications(fundingPeriodId, fundingStreamId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.ServiceUnavailable, null)));

            // Act
            IActionResult result = await controller.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().BeOfType<StatusCodeResult>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnNotExpectingStatusFromSpecApiClient_ThenReturnsInternalServerErrorResponse()
        {
            // Arrange
            SpecificationController controller = CreateSpecificationController();
            const string fundingPeriodId = "fundingPeriodId";
            const string fundingStreamId = "fundingStreamId";

            _specificationsApiClient
                .GetApprovedSpecifications(fundingPeriodId, fundingStreamId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.BadRequest, null)));

            // Act
            IActionResult result = await controller.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnSuccessfulGetRequest_ThenResponseSentToClient()
        {
            // Arrange
            SpecificationController controller = CreateSpecificationController();
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
            IActionResult result = await controller.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();

            OkObjectResult typedResult = result as OkObjectResult;
            IEnumerable<SpecificationSummary> specificationSummariesResult = typedResult.Value as IEnumerable<SpecificationSummary>;

            specificationSummariesResult.First().Name.Should().Be(selectedForFundingOnFirstOrder.Name);
            specificationSummariesResult.Last().Name.Should().Be(selectedForFundingOnSecondOrder.Name);
        }

        private SpecificationController CreateSpecificationController(IAuthorizationHelper authorizationHelper = null)
        {
            return new SpecificationController(_specificationsApiClient, authorizationHelper ?? _authorizationHelper);
        }

    }
}
