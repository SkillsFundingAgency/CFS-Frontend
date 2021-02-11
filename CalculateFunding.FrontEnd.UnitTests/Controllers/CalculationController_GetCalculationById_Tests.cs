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
	public class CalculationController_GetCalculationById_Tests
	{
		private CalculationController _sut;
		private Mock<ICalculationsApiClient> _mockCalcClient;
		private Mock<IMapper> _mockMapper;
		private Mock<IAuthorizationHelper> _mockAuthorizationHelper;
        private Mock<IResultsApiClient> _mockResultsApiClient;

		[TestInitialize]
		public void Initialize()
		{
			_mockCalcClient =new Mock<ICalculationsApiClient>();
			_mockMapper=new Mock<IMapper>();
			_mockAuthorizationHelper=new Mock<IAuthorizationHelper>();
			_mockResultsApiClient=new Mock<IResultsApiClient>();

			Calculation calculation = Builder<Calculation>.CreateNew().Build();
			_mockCalcClient.Setup(x => x.GetCalculationById("ABC123")).ReturnsAsync(
					new ApiResponse<Calculation>(HttpStatusCode.OK, Builder<Calculation>.CreateNew().Build()));
			
			_mockCalcClient.Setup(x => x.GetCalculationById("FooBar")).ReturnsAsync(
					new ApiResponse<Calculation>(HttpStatusCode.BadRequest, null));


			_sut = new CalculationController(_mockCalcClient.Object, _mockMapper.Object, _mockAuthorizationHelper.Object, _mockResultsApiClient.Object);
		}

	    [TestMethod]
	    public async Task Should_GetCalculation_ValidId_ReturnCalculation()
	    {
		    var actual = await _sut.GetCalculationById("ABC123");

		    actual.Should().BeOfType<OkObjectResult>();
	    }

		[TestMethod]
		public async Task Should_GetCalculation_InvalidId_ReturnError()
		{
			var actual = await _sut.GetCalculationById("FooBar");

			actual.Should().BeOfType<BadRequestResult>();
		}
    }
}
