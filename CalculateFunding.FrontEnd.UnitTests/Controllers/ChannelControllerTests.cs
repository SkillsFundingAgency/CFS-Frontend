using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ChannelControllerTests
    {
        private readonly IPublishingApiClient _publishingApiClient = Substitute.For<IPublishingApiClient>();

        private ChannelController _channelController;
        
        [TestInitialize]
        public void Setup()
        {
            _channelController = new ChannelController(_publishingApiClient);
        }

        [TestMethod]
        public async Task GetAllChannels_Returns_OkObjectResult()
        {
	        IEnumerable<Channel> expectedList = new List<Channel>().AsEnumerable();
            _publishingApiClient.GetAllChannels()
                .Returns(new ApiResponse<IEnumerable<Channel>>(HttpStatusCode.OK, expectedList)); ;

            IActionResult actual = await _channelController.GetAllChannels();

            actual.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task GetAllChannels_HandlesReturnedInternalServerError()
        {
            string errorMessage = "An error";
            _publishingApiClient.GetAllChannels()
                .Returns(new ApiResponse<IEnumerable<Channel>>(HttpStatusCode.InternalServerError, message: errorMessage)); ;

            IActionResult actual = await _channelController.GetAllChannels();

            actual.Should().BeOfType<InternalServerErrorResult>();

            InternalServerErrorResult internalServerErrorResult = actual as InternalServerErrorResult;
            internalServerErrorResult.Value.Should().Be(errorMessage);
        }
    }
}
