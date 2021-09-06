using System.Collections.Generic;
using System.Linq;
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
    public class JobsController_GetLatestJobByJobDefinitionId_UnitTests
    {
        private JobsController _sut;

        private Mock<IJobsApiClient> _mockJobsApiClient;

        [TestInitialize]
        public void SetUp()
        {
            _mockJobsApiClient = new Mock<IJobsApiClient>();
        }

        [TestMethod]
        public async Task When_GetLatestJobsByJobDefinitionId_has_Valid_Jobs_Returns_Jobs()
        {
            IDictionary<string, JobSummary> expected = new Dictionary<string, JobSummary>
            {
                {
                    "CreateSpecification", new JobSummary
                    {
                        Id = "ABC123",
                        JobDefinitionId = "CreateSpecification",
                        RunningStatus = RunningStatus.Queued
                    }
                }
            };

            _mockJobsApiClient
                .Setup(x => x.GetLatestJobsByJobDefinitionIds(It.Is<string[]>(_ => _.FirstOrDefault() == "CreateSpecification")))
                .ReturnsAsync(new ApiResponse<IDictionary<string, JobSummary>>(HttpStatusCode.OK, expected));

            _sut = new JobsController(_mockJobsApiClient.Object, MappingHelper.CreateFrontEndMapper());

            IActionResult result = await _sut.GetLatestJobsByJobDefinitionId("CreateSpecification");

            result.Should()
                .NotBeNull();

            result.Should()
                .BeAssignableTo<OkObjectResult>();

            var content = (result as OkObjectResult).Value;

            content.Should()
                .NotBeNull();

            content.Should()
                .BeOfType<JobSummaryViewModel>();
        }

        [TestMethod]
        public async Task When_GetLatestJobByJobDefinitionId_has_no_jobs_Returns_OK()
        {
            IDictionary<string, JobSummary> expected = new Dictionary<string, JobSummary>
            {
                {
                    "CreateSpecification", null
                }
            };

            _mockJobsApiClient
                .Setup(x => x.GetLatestJobsByJobDefinitionIds("CreateSpecification"))
                .ReturnsAsync(new ApiResponse<IDictionary<string, JobSummary>>(HttpStatusCode.OK, expected));

            _sut = new JobsController(_mockJobsApiClient.Object, Mock.Of<IMapper>());

            IActionResult result = await _sut.GetLatestJobsByJobDefinitionId("CreateSpecification");

            _mockJobsApiClient.VerifyAll();

            result.Should()
                .NotBeNull();

            result.Should()
                .BeAssignableTo<OkObjectResult>();

            var content = (result as OkObjectResult).Value;

            content.Should()
                .BeNull();
        }
    }
}