using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class PublishControllerTests_GetLocalAuthority_UnitTests
    {
        private readonly ISpecificationsApiClient _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
        private readonly IAuthorizationHelper _authorizationHelper = Substitute.For<IAuthorizationHelper>();
        private readonly IPublishingApiClient _publishingApiClient = Substitute.For<IPublishingApiClient>();
        private PublishController _publishController;
        
        [TestInitialize]
        public void Setup()
        {
            _publishController = new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);
        }

        [TestMethod]
        public async Task GetLocalAuthorities_Returns_OkObjectResult_Result_Given_ValidFundingStream_ValidFundingPeriod_EmptySearchText()
        {
	        IEnumerable<string> expectedList = new List<string>().AsEnumerable();
	        _publishingApiClient.SearchPublishedProviderLocalAuthorities("", "ValidFundingStream", "ValidFundingPeriod")
		        .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, expectedList));

            IActionResult actual = await _publishController.GetLocalAuthorities("ValidFundingStream", "ValidFundingPeriod", "");

            actual.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task GetLocalAuthorities_Returns_OkObjectResult_Result_Given_ValidFundingStream_ValidFundingPeriod_SearchText()
        {
	        IEnumerable<string> expectedList = new List<string>().AsEnumerable();
	        _publishingApiClient.SearchPublishedProviderLocalAuthorities("D", "ValidFundingStream", "ValidFundingPeriod").Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, expectedList));

            IActionResult actual = await _publishController.GetLocalAuthorities("ValidFundingStream", "ValidFundingPeriod", "D");

            actual.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task GetLocalAuthorities_Returns_BadRequestResult_Result_Given_InvalidFundingStream_InValidFundingPeriod_EmptySearchText()
        {
            _publishingApiClient.SearchPublishedProviderLocalAuthorities("", "", "").Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.BadRequest, null));

            IActionResult actual = await _publishController.GetLocalAuthorities("", "", "");

            actual.Should().BeOfType<BadRequestResult>();
        }
    }
}
