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
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Profiles;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models.FundingConfig;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class FundingLineDetailsControllerTests
    {
        private Mock<IPublishingApiClient> _publishingApiClient;
        private Mock<ISpecificationsApiClient> _specificationsApiClient;
        private Mock<IProvidersApiClient> _providersApiClient;
        private Mock<IPoliciesApiClient> _policiesApiClient;
        private Mock<IAuthorizationHelper> _mockAuthorizationHelper;
        private FundingLineDetailsController _fundingLineDetailsController;

        private string _specificationId;
        private string _providerId;
        private string _fundingStreamId;
        private string _fundingLineCode;
        private string _fundingPeriodId;
        private string _providerVersionId;


        [TestInitialize]
        public void Initialize()
        {
            _publishingApiClient = new Mock<IPublishingApiClient>();
            _providersApiClient = new Mock<IProvidersApiClient>();
            _specificationsApiClient = new Mock<ISpecificationsApiClient>();
            _mockAuthorizationHelper = new Mock<IAuthorizationHelper>();
            _policiesApiClient = new Mock<IPoliciesApiClient>();
                        _fundingLineDetailsController = new FundingLineDetailsController(_publishingApiClient.Object, _providersApiClient.Object,
                _specificationsApiClient.Object, _policiesApiClient.Object, _mockAuthorizationHelper.Object);

            _specificationId = "specificationId";
            _providerId = "providerId";
            _fundingStreamId = "fundingStreamId";
            _fundingLineCode = "fundingLineCode";
            _fundingPeriodId = "fundingPeriodId";
            _providerVersionId = "providerVersionId";
        }

        [TestMethod]
        public async Task ReturnsInternalServerErrorWhenGetFundingLinePublishedProviderDetailsApiReturnsInternalServerError()
        {
            GivenGetFundingLinePublishedProviderDetailsForFundingLine(
                HttpStatusCode.InternalServerError);
            GivenFundingConfiguration(HttpStatusCode.OK, new FundingConfiguration());
            GivenProviderVersionExists();
            GivenSpecificationExists();

            IActionResult actualResult = await WhenGetFundingLinePublishedProviderDetails();

            actualResult.Should().BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task ReturnsPublishedProviderDetailsWhenPreviousProfileExists()
        {
            GivenGetFundingLinePublishedProviderDetailsForFundingLine(HttpStatusCode.OK, new FundingLineProfile());
            GivenFundingConfiguration(HttpStatusCode.OK, new FundingConfiguration());
            GivenProviderVersionExists();
            GivenSpecificationExists();

            IActionResult actualResult = await WhenGetFundingLinePublishedProviderDetails();

            actualResult.Should().BeOfType<OkObjectResult>();
            OkObjectResult okObjectResult = actualResult as OkObjectResult;
            okObjectResult.Should().NotBeNull();
            okObjectResult.Value.Should().NotBeNull();
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

            GivenProviderExists();
            GivenSpecificationExists();
            GivenGetPreviousProfilesForSpecificationForProviderForFundingLine(
                HttpStatusCode.OK, actualFundingLineChanges);

            IActionResult actualResult = await WhenGetPreviousProfilesForSpecificationForProviderForFundingLine();

            actualResult.Should().BeOfType<OkObjectResult>();

            OkObjectResult okObjectResult = actualResult as OkObjectResult;
            okObjectResult.Should().NotBeNull();
            okObjectResult.Value.Should().NotBeNull();
            okObjectResult.Value.Should().BeOfType<FundingLineChangesViewModel>();

            FundingLineChangesViewModel viewModel = okObjectResult.Value as FundingLineChangesViewModel;
            viewModel.ProviderName.Should().Be("Provider name");
            viewModel.SpecificationName.Should().Be("Spec name");
            viewModel.FundingPeriodName.Should().Be("Funding period name");

            IEnumerable<FundingLineChange> fundingLineChanges = viewModel.FundingLineChanges;
            fundingLineChanges.Count().Should().Be(1);

            FundingLineChange fundingLineChange = fundingLineChanges.FirstOrDefault();
            fundingLineChange.Should().NotBeNull();
            fundingLineChange.FundingLineName.Should().Be(fundingLineName);
        }

        public void GivenGetFundingLinePublishedProviderDetailsForFundingLine(
            HttpStatusCode httpStatusCode,
            FundingLineProfile result = null)
        {
            _publishingApiClient
                .Setup(_ => _.GetFundingLinePublishedProviderDetails(
                    _specificationId,
                    _providerId,
                    _fundingStreamId,
                    _fundingLineCode))
                .ReturnsAsync(new ApiResponse<FundingLineProfile>(httpStatusCode, result));
        }

        public void GivenFundingConfiguration(
            HttpStatusCode httpStatusCode,
            FundingConfiguration fundingConfiguration = null) 
        {
            _policiesApiClient
                .Setup(_ => _.GetFundingConfiguration(
                    _fundingStreamId,
                    _fundingPeriodId))
                .ReturnsAsync(new ApiResponse<FundingConfiguration>(httpStatusCode, fundingConfiguration));
        }

        [TestMethod]
        public async Task ReturnsInternalServerErrorWhenCurrentProfileConfigApiReturnsInternalServerError()
        {
            GivenGetPreviousProfilesForSpecificationForProviderForFundingLine(
                HttpStatusCode.InternalServerError, null);

            IActionResult actualResult = await WhenGetCurrentProfileConfig();

            actualResult.Should().BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task ReturnsChangesWhenGetCurrentProfileConfig()
        {
            string fundingLineName = "FundingLineName";

            IEnumerable<FundingLineProfile> actualFundingLineChanges = new List<FundingLineProfile> {
                new FundingLineProfile
                {
                    FundingLineName = fundingLineName
                }
            };

            GivenGetCurrentProfileConfig(
                HttpStatusCode.OK, actualFundingLineChanges);

            IActionResult actualResult = await WhenGetCurrentProfileConfig();

            actualResult.Should().BeOfType<OkObjectResult>();

            OkObjectResult okObjectResult = actualResult as OkObjectResult;
            okObjectResult.Should().NotBeNull();
            okObjectResult.Value.Should().NotBeNull();
            okObjectResult.Value.Should().BeOfType<List<FundingLineProfile>>();

            IEnumerable<FundingLineProfile> fundingLineProfiles = okObjectResult.Value as IEnumerable<FundingLineProfile>;
            fundingLineProfiles.Count().Should().Be(1);

            FundingLineProfile fundingLineProfile = fundingLineProfiles.FirstOrDefault();
            fundingLineProfile.Should().NotBeNull();
            fundingLineProfile.FundingLineName.Should().Be(fundingLineName);
        }

        private void GivenPreviousProfileExistsForSpecificationForProviderForFundingLine(
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

        private void GivenSpecificationExists()
        {
            _specificationsApiClient
                .Setup(_ => _.GetSpecificationSummaryById(
                    _specificationId))
                .ReturnsAsync(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary
                {
                    Id = _specificationId,
                    Name = "Spec name",
                    FundingPeriod = new FundingPeriod
                    {
                        Name = "Funding period name"
                    },
                    ProviderVersionId = _providerVersionId
                }));
        }

        private void GivenProviderExists()
        {
            _providersApiClient
                .Setup(_ => _.GetProviderByIdFromProviderVersion(
                    _providerVersionId, _providerId))
                .ReturnsAsync(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, new ProviderVersionSearchResult
                {
                    Id = _providerId,
                    Name = "Provider name"
                }));
        }

        private void GivenProviderVersionExists()
        {
            _providersApiClient
                .Setup(_ => _.GetProviderByIdFromProviderVersion(
                    _providerVersionId, _providerId))
                .ReturnsAsync(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, new ProviderVersionSearchResult
                {
                    Id = _providerId,
                    Name = "Provider name",
                    ProviderType = "Schoo"
                }));
        }

        private async Task<IActionResult> WhenPreviousProfileExistsForSpecificationForProviderForFundingLine()
        {
            return await _fundingLineDetailsController
                .PreviousProfileExistsForSpecificationForProviderForFundingLine(
                    _specificationId,
                    _providerId,
                    _fundingStreamId,
                    _fundingLineCode);
        }

        private async Task<IActionResult> WhenGetFundingLinePublishedProviderDetails()
        {
            return await _fundingLineDetailsController
                .GetFundingLinePublishedProviderDetails(
                    _specificationId,
                    _providerId,
                    _fundingStreamId,
                    _fundingLineCode,
                    _fundingPeriodId);
        }
        private void GivenGetPreviousProfilesForSpecificationForProviderForFundingLine(
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

        private void GivenGetCurrentProfileConfig(
            HttpStatusCode httpStatusCode,
            IEnumerable<FundingLineProfile> fundingLineProfiles = null)
        {
            _publishingApiClient
                .Setup(_ => _.GetCurrentProfileConfig(
                    _specificationId,
                    _providerId,
                    _fundingStreamId))
                .ReturnsAsync(new ApiResponse<IEnumerable<FundingLineProfile>>(httpStatusCode, fundingLineProfiles));
        }

        private async Task<IActionResult> WhenGetPreviousProfilesForSpecificationForProviderForFundingLine()
        {
            return await _fundingLineDetailsController
                .GetPreviousProfilesForSpecificationForProviderForFundingLine(
                    _specificationId,
                    _providerId,
                    _fundingStreamId,
                    _fundingLineCode,
                    _providerVersionId);
        }

        private async Task<IActionResult> WhenGetCurrentProfileConfig()
        {
            return await _fundingLineDetailsController
                .GetCurrentProfileConfig(
                    _specificationId,
                    _providerId,
                    _fundingStreamId);
        }
    }
}
