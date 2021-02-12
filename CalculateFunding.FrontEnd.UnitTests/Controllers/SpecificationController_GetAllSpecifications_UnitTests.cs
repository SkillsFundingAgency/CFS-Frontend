using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Specs;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class SpecificationController_GetAllSpecifications_UnitTests
    {
        private SpecificationController _sut;
        private Mock<ISpecificationsApiClient> _mockSpecificationsApiClient;
        private Mock<IPoliciesApiClient> _mockPoliciesApiClient;
        private Mock<IAuthorizationHelper> _mockAuthorizationHelper;

        [TestInitialize]
        public void Setup()
        {
            _mockSpecificationsApiClient = new Mock<ISpecificationsApiClient>();
            _mockPoliciesApiClient = new Mock<IPoliciesApiClient>();
            _mockAuthorizationHelper = new Mock<IAuthorizationHelper>();
        }

        [TestMethod]
        public void GetAllSpecifications_Returns_OkObjectResults_WithValidCall()
        {
	        var data = Builder<SpecificationSearchRequestViewModel>.CreateNew().Build();

            _mockSpecificationsApiClient.Setup(x => 
	            x.FindSpecifications(It.IsAny<SearchFilterRequest>()))
	            .ReturnsAsync(Builder<PagedResult<SpecificationSearchResultItem>>
		            .CreateNew()
		            .With(x => 
			            x.Items = Builder<SpecificationSearchResultItem>.CreateListOfSize(10).Build()).Build());
			
	        _sut = new SpecificationController(_mockSpecificationsApiClient.Object, _mockPoliciesApiClient.Object, _mockAuthorizationHelper.Object);

            var actual = _sut.GetAllSpecifications(data);

            actual.Result.Should().BeOfType<OkObjectResult>();
        }
        [TestMethod]
        public void GetAllSpecifications_Returns_BadRequestObjectResult_WithInValidCall_MissingVariable()
        {
	        var data = new SpecificationSearchRequestViewModel()
	        {
		        SearchText = null,
		        FundingPeriods = null,
		        FundingStreams = null,
		        Status = null
	        };
            _mockSpecificationsApiClient.Setup(x => x.FindSpecifications(null)).ReturnsAsync(Builder<PagedResult<SpecificationSearchResultItem>>.CreateNew().Build);
	        _sut = new SpecificationController(_mockSpecificationsApiClient.Object, _mockPoliciesApiClient.Object, _mockAuthorizationHelper.Object);

            var actual = _sut.GetAllSpecifications(data);

            actual.Result.Should().BeOfType<BadRequestResult>();
        }




    }
}
