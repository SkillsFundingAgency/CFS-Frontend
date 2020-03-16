using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Controllers;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Serilog;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Frontend.Helpers;

namespace CalculateFunding.Frontend.UnitTests.Controllers.Dataset
{
    [TestClass]
    public class DatasetController_GetDatasetDefinitions_UnitTests
    {
	    private DatasetController _sut;
	    private Mock<IDatasetsApiClient> _mockDatasetApiClient;
	    private Mock<IMapper> _mockMapper;
	    private Mock<ILogger> _mockLogger;
	    private Mock<ISpecificationsApiClient> _mockSpecificationsApiClient;
	    private Mock<IAuthorizationHelper> _mockAuthorisationHelper;

	    [TestInitialize]
	    public void SetUp()
	    {
			_mockDatasetApiClient = new Mock<IDatasetsApiClient>();
			_mockSpecificationsApiClient = new Mock<ISpecificationsApiClient>();
			_mockAuthorisationHelper = new Mock<IAuthorizationHelper>();
			_mockLogger =new Mock<ILogger>();
			_mockMapper = new Mock<IMapper>();

            _sut = new DatasetController(_mockDatasetApiClient.Object, _mockLogger.Object, _mockMapper.Object, _mockSpecificationsApiClient.Object, _mockAuthorisationHelper.Object);
	    }

	    [TestMethod]
	    public void Should_GetDatasetDefinitions_Successfully()
	    {
		    _mockDatasetApiClient.Setup(x => x.GetDatasetDefinitions()).ReturnsAsync(
			    new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK,
				    Builder<DatasetDefinition>.CreateListOfSize(10).Build().AsEnumerable()));

		    var actual = _sut.GetDatasetDefinitions();

		    actual.Should().NotBeNull();
		    actual.Result.Should().BeOfType<OkObjectResult>();
	    }

	    [TestMethod]
	    public void Should_GetDatasetDefinitions_BadRequest_Failure()
	    {
		    _mockDatasetApiClient.Setup(x => x.GetDatasetDefinitions()).ReturnsAsync(
			    new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.BadRequest,null));

		    var actual = _sut.GetDatasetDefinitions();

		    actual.Should().NotBeNull();
		    actual.Result.Should().BeOfType<BadRequestObjectResult>();
	    }
    }
}
