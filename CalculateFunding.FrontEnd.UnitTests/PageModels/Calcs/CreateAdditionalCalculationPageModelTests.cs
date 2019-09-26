using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Pages.Calcs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using FluentAssertions;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using System.Security.Claims;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Calcs
{
    [TestClass]
    public class CreateAdditionalCalculationPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenUserDoesHaveCreateCalculationsPermission_ThenDoesUserHavePermissionToApproveOrEditIsTrue()
        {
            // Arrange
            string specificationId = "5";

            SpecificationSummary expectedSpecification = new SpecificationSummary
            {
                FundingPeriod = new Reference("2018", "17-18"),

                FundingStreams = new List<Reference>() { new Reference("2018", "18-19"), },

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

            IFeatureToggle featureToggle = CreateFeatureToggle();
            featureToggle
                .IsNewEditCalculationPageEnabled()
                .Returns(true);

            ISpecificationsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanCreateCalculations))
                .Returns(true);

            CreateAdditionalCalculationPageModel pageModel = CreateAdditionalCalculationPageModel(specsClient: specsApiClient, features: featureToggle, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGet("5");

            // Assert
            pageModel.DoesUserHavePermissionToApproveOrEdit.Should().Be("true");
        }

        [TestMethod]
        public async Task OnGet_WhenUserDoesHaveCreateCalculationsPermission_ThenDoesUserHavePermissionToApproveOrEditIsFalse()
        {
            // Arrange
            string specificationId = "5";

            SpecificationSummary expectedSpecification = new SpecificationSummary
            {
                FundingPeriod = new Reference("2018", "17-18"),

                FundingStreams = new List<Reference>() { new Reference("2018", "18-19"), },

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

            IFeatureToggle featureToggle = CreateFeatureToggle();
            featureToggle
                .IsNewEditCalculationPageEnabled()
                .Returns(true);

            ISpecificationsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanCreateCalculations))
                .Returns(false);

            CreateAdditionalCalculationPageModel pageModel = CreateAdditionalCalculationPageModel(specsClient: specsApiClient, features: featureToggle, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGet("5");

            // Assert
            pageModel.DoesUserHavePermissionToApproveOrEdit.Should().Be("false");
        }

        public CreateAdditionalCalculationPageModel CreateAdditionalCalculationPageModel(
            ISpecificationsApiClient specsClient = null,
            ICalculationsApiClient calcsClient = null,
            IMapper mapper = null,
            IFeatureToggle features = null,
            IAuthorizationHelper authorizationHelper=null)
        {
            CreateAdditionalCalculationPageModel pageModel = new CreateAdditionalCalculationPageModel(
                specsClient ?? CreateSpecsApiClient(),
                 calcsClient ?? CreateCalcsApiClient(),
                mapper ?? CreateMapper(),
                features ?? CreateFeatureToggle(),
                 authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanCreateCalculations));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();
            return pageModel;
        }

        private static ISpecificationsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecificationsApiClient>();
        }

        private static ICalculationsApiClient CreateCalcsApiClient()
        {
            return Substitute.For<ICalculationsApiClient>();
        }

        private IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        private static IFeatureToggle CreateFeatureToggle()
        {
            return Substitute.For<IFeatureToggle>();
        }
    }
}
