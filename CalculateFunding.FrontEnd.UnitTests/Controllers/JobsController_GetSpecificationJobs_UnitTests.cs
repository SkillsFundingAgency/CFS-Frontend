using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Jobs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.ViewModels.Jobs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class JobsController_GetSpecificationJobs_UnitTests
    {
        private JobsController _sut;

        private Mock<IJobsApiClient> _mockJobsApiClient;

        [TestInitialize]
        public void SetUp()
        {
            _mockJobsApiClient = new Mock<IJobsApiClient>();
        }

        [TestMethod]
        public async Task When_GetSpecificationJobs_has_Valid_JobTypes_Returns_Jobs()
        {
            IDictionary<string, JobSummary> expected = new Dictionary<string, JobSummary> { { "", new JobSummary { JobId = "ABC123", RunningStatus = RunningStatus.Queued } } };
            _mockJobsApiClient
                .Setup(x => x.GetLatestJobsForSpecification("ABC123", It.Is<string[]>(_ => _.FirstOrDefault() == "Published") ))
                .ReturnsAsync(new ApiResponse<IDictionary<string, JobSummary>>(HttpStatusCode.OK, expected));
            _sut = new JobsController(_mockJobsApiClient.Object, Mock.Of<IMapper>());

            IActionResult result = await _sut.GetSpecificationJobs("ABC123", "Published");

            result.Should().NotBeNull();
            result.Should().BeAssignableTo<OkObjectResult>();
            var content = (result as OkObjectResult).Value;
            content.Should().NotBeNull();
            content.Should().BeOfType<JobSummaryViewModel[]>();
        }

        [TestMethod]
        public async Task When_GetSpecificationJobs_has_no_jobs_Returns_OK()
        {
            _mockJobsApiClient
                .Setup(x => x.GetLatestJobsForSpecification(
                    "ABC123", 
                    It.Is<string[]>(_ => 
                        _.FirstOrDefault() == "XXX" &&
                        _.LastOrDefault() == "YYY")))
                .ReturnsAsync(new ApiResponse<IDictionary<string, JobSummary>>(HttpStatusCode.NoContent, null));
            _sut = new JobsController(_mockJobsApiClient.Object, Mock.Of<IMapper>());

            IActionResult result = await _sut.GetSpecificationJobs("ABC123", "XXX,YYY");

            _mockJobsApiClient.VerifyAll();
            result.Should().NotBeNull();
            result.Should().BeAssignableTo<OkObjectResult>();
            var content = (result as OkObjectResult).Value;
            content.Should().NotBeNull();
        }
    }
}