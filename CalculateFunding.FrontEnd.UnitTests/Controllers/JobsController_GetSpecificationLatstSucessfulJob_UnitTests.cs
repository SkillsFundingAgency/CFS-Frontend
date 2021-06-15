using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Jobs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Jobs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class JobsController_GetSpecificationLatstSucessfulJob_UnitTests
    {
        private JobsController _sut;

        private Mock<IJobsApiClient> _mockJobsApiClient;

        [TestInitialize]
        public void SetUp()
        {
            _mockJobsApiClient = new Mock<IJobsApiClient>();
        }

        [TestMethod]
        public async Task When_GetSpecificationLatestSucessfulJob_has_Valid_SuccessfulJob_Returns_Job()
        {
            JobSummary expected = new JobSummary {JobId = "ABC123", RunningStatus = RunningStatus.Completed, CompletionStatus = CompletionStatus.Succeeded};
            _mockJobsApiClient
                .Setup(x => x.GetLatestSuccessfulJobForSpecification("ABC123", "Published"))
                .ReturnsAsync(new ApiResponse<JobSummary>(HttpStatusCode.OK, expected));
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            _sut = new JobsController(_mockJobsApiClient.Object, mapper);

            IActionResult result = await _sut.GetSpecificationLatestSucessfulJob("ABC123", "Published");

            result.Should().NotBeNull();
            result.Should().BeAssignableTo<OkObjectResult>();
            var content = (result as OkObjectResult).Value;
            content.Should().NotBeNull();
            content.Should().BeOfType<JobSummaryViewModel>();
        }

        [TestMethod]
        public async Task When_GetSpecificationLatestSucessfulJob_has_no_jobs_Returns_Empty_Response()
        {
            _mockJobsApiClient
                .Setup(x => x.GetLatestSuccessfulJobForSpecification("ABC123", "SomeJobDefinitionId"))
                .ReturnsAsync(new ApiResponse<JobSummary>(HttpStatusCode.NotFound, null, null));
            _sut = new JobsController(_mockJobsApiClient.Object, Mock.Of<IMapper>());

            IActionResult result = await _sut.GetSpecificationLatestSucessfulJob("ABC123", "SomeJobDefinitionId");

            _mockJobsApiClient.VerifyAll();
            result.Should().NotBeNull();
            result.Should().BeAssignableTo<OkObjectResult>();
            var content = (result as OkObjectResult);
            content.Should().NotBeNull();
            content.Should().BeOfType<OkObjectResult>();
        }
    }
}