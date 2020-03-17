
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Jobs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Controllers;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
   

	[TestClass]
    public class JobsController_GetLatestJobForSpecification_UnitTests
    { private JobsController _sut;

	    private Mock<IJobsApiClient> _mockJobsApiClient;
	    private Mock<IMapper> _mockMapper;

	    [TestInitialize]
	    public void SetUp()
	    {
			_mockJobsApiClient = new Mock<IJobsApiClient>();
			_mockMapper = new Mock<IMapper>();

	    }

	    [TestMethod]
	    public void Should_GetLatestJobForSpecification_ValidJobTypes_ReturnsJobs()
	    {
		    _mockJobsApiClient.Setup(x => x.GetLatestJobForSpecification("ABC123", new[] {"Published"}))
			    .ReturnsAsync(Builder<ApiResponse<JobSummary>>.CreateNew().Build);

		    _sut = new JobsController(_mockJobsApiClient.Object, _mockMapper.Object);

		    var actual = _sut.GetLatestJobForSpecification("ABC123", "Published");

		    actual.Should().NotBeNull();

		    actual.Should().BeOfType<Task<IActionResult>>();
	    }

	    [TestMethod]
	    public void Should_GetLatestJobForSpecification_InvalidJobTypes_ReturnBadRequest()
	    {
		    _sut = new JobsController(_mockJobsApiClient.Object, _mockMapper.Object);

		    var actual = _sut.GetLatestJobForSpecification("ABC123", "Siesta");

		    actual.Should().NotBeNull();

		    actual.Should().BeOfType<Task<IActionResult>>();

		    actual.Result.Should().BeOfType<BadRequestObjectResult>();
	    }
    }
}
