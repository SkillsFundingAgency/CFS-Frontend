using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Users;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class UserCsvControllerTests
    {
        private UserCsvController _userCsvController;
        private ILogger _logger;
        private IUsersApiClient _usersApiClient;

        [TestInitialize]
        public void Initialize()
        {
            _usersApiClient = CreateUsersApiClient();
            _logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            _userCsvController = new UserCsvController(_logger, _usersApiClient, mapper);
        }

        [TestMethod]
        public async Task DownloadEffectivePermissionsForFundingStream_ApiCallFailed_ReturnsFailedResult()
        {
            string fundingStreamId = "PSG";

            GivenDownloadEffectivePermissionsForFundingStream(
                fundingStreamId, 
                httpStatusCode: HttpStatusCode.NotFound);

            // Act
            IActionResult result = await _userCsvController.DownloadEffectivePermissionsForFundingStream(fundingStreamId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundResult>();
        }

        [TestMethod]
        public async Task DownloadEffectivePermissionsForFundingStream_ApiCallReturnsSuccessResult_ReturnsApiResponse()
        {
            string fundingStreamId = "PSG";

            string expectedFileUrl = "file-url";
            string expectedFileName = "file-name";


            FundingStreamPermissionCurrentDownloadModel downloadModel = new FundingStreamPermissionCurrentDownloadModel
            {
                FileName = expectedFileName,
                Url = expectedFileUrl
            };

            GivenDownloadEffectivePermissionsForFundingStream(fundingStreamId, downloadModel: downloadModel);

            // Act
            IActionResult result = await _userCsvController.DownloadEffectivePermissionsForFundingStream(fundingStreamId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();

            OkObjectResult typedResult = result as OkObjectResult;
            FundingStreamPermissionCurrentDownloadViewModel downloadViewModel 
                = typedResult.Value as FundingStreamPermissionCurrentDownloadViewModel;

            downloadViewModel.Url.Should().Be(expectedFileUrl);
            downloadViewModel.FileName.Should().Be(expectedFileName);
        }

        private void GivenDownloadEffectivePermissionsForFundingStream(
            string fundingStreamId,
            FundingStreamPermissionCurrentDownloadModel downloadModel = null,
            HttpStatusCode httpStatusCode = HttpStatusCode.OK)
        {
            _usersApiClient
                .DownloadEffectivePermissionsForFundingStream(fundingStreamId)
                .Returns(new ApiResponse<FundingStreamPermissionCurrentDownloadModel>(httpStatusCode, downloadModel));
        }

        private static IUsersApiClient CreateUsersApiClient()
        {
            return Substitute.For<IUsersApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

    }
}
