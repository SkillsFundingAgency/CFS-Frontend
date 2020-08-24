using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class CalculationController_GetCalculationsForSpecification_Tests
    {
        private CalculationController _sut;
        private Mock<ICalculationsApiClient> _mockCalcClient;
        private Mock<IMapper> _mockMapper;
        private Mock<IAuthorizationHelper> _mockAuthorizationHelper;
        private Mock<IResultsApiClient> _mockResultsApiClient;
        
        [TestInitialize]
        public void Initialize()
        {
            _mockCalcClient = new Mock<ICalculationsApiClient>();
            _mockMapper = new Mock<IMapper>();
            _mockAuthorizationHelper = new Mock<IAuthorizationHelper>();
            _mockResultsApiClient=new Mock<IResultsApiClient>();
        }

        [TestMethod]
        public async Task Should_GetCalculationsForSpecification_ValidId_ReturnCalculation()
        {
	        _mockCalcClient.Setup(x => 
	            x.SearchCalculationsForSpecification(
		            "ABC123", 
		            It.IsAny<CalculationType>(), 
		            null, 
		            It.IsAny<string>(), 
		            It.IsAny<int>()))
	            .ReturnsAsync(
		            new ApiResponse<SearchResults<CalculationSearchResult>>(
			            HttpStatusCode.OK, 
			            Builder<SearchResults<CalculationSearchResult>>
				            .CreateNew()
				            .Build()));
	        _sut = new CalculationController(_mockCalcClient.Object, _mockMapper.Object, _mockAuthorizationHelper.Object, _mockResultsApiClient.Object);

            var actual = await _sut.GetCalculationsForSpecification("ABC123", CalculationType.Additional, 1, null, "");

            actual.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task Should_GetCalculationsForSpecification_InvalidId_ReturnError()
        {  
	        _mockCalcClient.Setup(x => 
	            x.SearchCalculationsForSpecification(
		            "FooBar", 
		            It.IsAny<CalculationType>(), 
		            null, 
		            It.IsAny<string>(), 
		            It.IsAny<int>()))
	            .ReturnsAsync(
		            new ApiResponse<SearchResults<CalculationSearchResult>>(
			            HttpStatusCode.BadRequest, 
			            Builder<SearchResults<CalculationSearchResult>>
				            .CreateNew()
				            .Build()));
	        _sut = new CalculationController(_mockCalcClient.Object, _mockMapper.Object, _mockAuthorizationHelper.Object, _mockResultsApiClient.Object);

            var actual = await _sut.GetCalculationsForSpecification("FooBar", CalculationType.Template, 1, null, "");

            actual.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
