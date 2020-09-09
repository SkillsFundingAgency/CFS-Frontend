using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class FundingLineDetailsControllerTests
    {
        private Mock<IPublishingApiClient> _publishingApiClient;
        private FundingLineDetailsController _fundingLineDetailsController;

        private string _specificationId;
        private string _providerId;
        private string _fundingStreamId;
        private string _fundingLineCode;


        [TestInitialize]
        public void Initialize()
        {
            _publishingApiClient = new Mock<IPublishingApiClient>();
            _fundingLineDetailsController = new FundingLineDetailsController(_publishingApiClient.Object);

            _specificationId = "specificationId";
            _providerId = "providerId";
            _fundingStreamId = "fundingStreamId";
            _fundingLineCode = "fundingLineCode";
        }

        [TestMethod]
        public async Task ReturnsInternalServerErrorWhenPreviousProfileExistsApiReturnsInternalServerError()
        {
            GivenPreviousProfileExistsForSpecificationForProviderForFundingLine(
                HttpStatusCode.InternalServerError);

            IActionResult actualResult = await WhenPreviousProfileExistsForSpecificationForProviderForFundingLine();

            actualResult.Should().BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task ReturnsChangeExistsWhenPreviousProfileExists()
        {
            GivenPreviousProfileExistsForSpecificationForProviderForFundingLine(
                HttpStatusCode.OK, true);

            IActionResult actualResult = await WhenPreviousProfileExistsForSpecificationForProviderForFundingLine();

            actualResult.Should().BeOfType<OkObjectResult>();
            OkObjectResult okObjectResult = actualResult as OkObjectResult;
            okObjectResult.Should().NotBeNull();
            okObjectResult.Value.Should().NotBeNull();
            okObjectResult.Value.Should().Be(true);
        }

        [TestMethod]
        public async Task ReturnsInternalServerErrorWhenPreviousProfileChangesApiReturnsInternalServerError()
        {
            GivenGetPreviousProfilesForSpecificationForProviderForFundingLine(
                HttpStatusCode.InternalServerError, null);

            IActionResult actualResult = await WhenGetPreviousProfilesForSpecificationForProviderForFundingLine();

            actualResult.Should().BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task ReturnsChangesWhenPreviousProfileChanges()
        {
            string fundingLineName = "FundingLineName";

            IEnumerable<FundingLineChange> actualFundingLineChanges = new List<FundingLineChange> {
                new FundingLineChange
                {
                    FundingLineName = fundingLineName
                }
            };

            GivenGetPreviousProfilesForSpecificationForProviderForFundingLine(
                HttpStatusCode.OK, actualFundingLineChanges);

            IActionResult actualResult = await WhenGetPreviousProfilesForSpecificationForProviderForFundingLine();

            actualResult.Should().BeOfType<OkObjectResult>();
            
            OkObjectResult okObjectResult = actualResult as OkObjectResult;
            okObjectResult.Should().NotBeNull();
            okObjectResult.Value.Should().NotBeNull();
            okObjectResult.Value.Should().BeOfType<List<FundingLineChange>>();
            
            IEnumerable<FundingLineChange> fundingLineChanges = okObjectResult.Value as IEnumerable<FundingLineChange>;
            fundingLineChanges.Count().Should().Be(1);

            FundingLineChange fundingLineChange = fundingLineChanges.FirstOrDefault();
            fundingLineChange.Should().NotBeNull();
            fundingLineChange.FundingLineName.Should().Be(fundingLineName);
        }

        public void GivenPreviousProfileExistsForSpecificationForProviderForFundingLine(
            HttpStatusCode httpStatusCode,
            bool? result = null)
        {
            _publishingApiClient
                .Setup(_ => _.PreviousProfileExistsForSpecificationForProviderForFundingLine(
                    _specificationId,
                    _providerId,
                    _fundingStreamId,
                    _fundingLineCode))
                .ReturnsAsync(new ApiResponse<bool>(httpStatusCode, result ?? false));
        }

        public async Task<IActionResult> WhenPreviousProfileExistsForSpecificationForProviderForFundingLine()
        {
            return await _fundingLineDetailsController
                .PreviousProfileExistsForSpecificationForProviderForFundingLine(
                    _specificationId,
                    _providerId,
                    _fundingStreamId,
                    _fundingLineCode);
        }

        public void GivenGetPreviousProfilesForSpecificationForProviderForFundingLine(
                HttpStatusCode httpStatusCode,
                IEnumerable<FundingLineChange> fundingLineChanges = null)
        {
            _publishingApiClient
                .Setup(_ => _.GetPreviousProfilesForSpecificationForProviderForFundingLine(
                    _specificationId,
                    _providerId,
                    _fundingStreamId,
                    _fundingLineCode))
                .ReturnsAsync(new ApiResponse<IEnumerable<FundingLineChange>>(httpStatusCode, fundingLineChanges));
        }

        public async Task<IActionResult> WhenGetPreviousProfilesForSpecificationForProviderForFundingLine()
        {
            return await _fundingLineDetailsController
                .GetPreviousProfilesForSpecificationForProviderForFundingLine(
                    _specificationId,
                    _providerId,
                    _fundingStreamId,
                    _fundingLineCode);
        }
    }
}
