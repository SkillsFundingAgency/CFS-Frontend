using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Controllers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Controllers.Dataset
{
    [TestClass]
    public class DatasetSpecificationsControllerTests
    {
        private DatasetSpecificationsController _controller;
        private Mock<IDatasetsApiClient> _mockDatasetApiClient;

        [TestInitialize]
        public void SetUp()
        {
            _mockDatasetApiClient = new Mock<IDatasetsApiClient>();

            _controller = CreateController(_mockDatasetApiClient.Object);
        }

        [TestMethod]
        public void GetEligibleSpecificationsToReference_GivenSpecificationIdIsNull_ThrowsArgumentNullException()
        {
            // Act
            Func<Task> func = 
                async () => await _controller.GetEligibleSpecificationsToReference(null);

            // Assert
            func
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task Should_GetEligibleSpecificationsToReference_ReturnsNotFound()
        {
            string specificationId = NewRandomString();

            _mockDatasetApiClient
                .Setup(_ => _.GetEligibleSpecificationsToReference(specificationId))
                .ReturnsAsync(new ApiResponse<IEnumerable<EligibleSpecificationReference>>(HttpStatusCode.NotFound));

            IActionResult actionResult =
                await _controller.GetEligibleSpecificationsToReference(specificationId);

            actionResult
                .Should()
                .BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task Should_GetEligibleSpecificationsToReference_Successfully()
        {
            string specificationId = NewRandomString();

            IEnumerable<EligibleSpecificationReference> eligibleSpecificationReferences = new List<EligibleSpecificationReference>
            {
                new EligibleSpecificationReference
                {
                    SpecificationId = specificationId
                }
            };

            _mockDatasetApiClient
                .Setup(_ => _.GetEligibleSpecificationsToReference(specificationId))
                .ReturnsAsync(new ApiResponse<IEnumerable<EligibleSpecificationReference>>(HttpStatusCode.OK, eligibleSpecificationReferences));

            IActionResult actionResult = 
                await _controller.GetEligibleSpecificationsToReference(specificationId);

            actionResult
                .Should()
                .BeOfType<OkObjectResult>()
                .Subject
                .Value
                .Should()
                .BeOfType<List<EligibleSpecificationReference>>()
                .Subject
                .Count()
                .Should()
                .Be(1);
        }

        private DatasetSpecificationsController CreateController(
            IDatasetsApiClient apiClient)
            => new DatasetSpecificationsController(apiClient);

        private string NewRandomString() => Guid.NewGuid().ToString();
    }
}
