using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Calcs;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    [TestClass]
    public class EditCalculationPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenCalculationDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";

            EditCalculationPageModel pageModel = CreatePageModel(mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task OnGet_WhenSpecCalculationDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";

            calcsClient.GetCalculationById(calculationId).Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, new Calculation()
            {
                Id = calculationId,
                SpecificationId = "54",
            }));

            EditCalculationPageModel pageModel = CreatePageModel(calcsClient: calcsClient, mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsThenCalculationReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            const string calculationId = "5";
            const string specificationId = "specId";
            const string specificationName = "Spec Name";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId,
                Current = new CalculationVersion()
                {
                    SourceCode = "Test Source Code"
                }
            };

            CalculationCurrentVersion specsCalculation = new CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, specsCalculation));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
                Name = specificationName
            };

            specsClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient: specsClient, calcsClient: calcsClient, mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.Current.SourceCode);
            pageModel.SpecificationName.Should().Be(specificationName);

            await calcsClient
                .Received(1)
                .GetCalculationById(Arg.Is(calculationId));

            await specsClient
               .Received(1)
               .GetSpecificationSummary(Arg.Is(specificationId));

            await specsClient
                .Received(1)
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId));
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsButCalculationTypeIsAdditional_ThenCalculationDisplayTypeIsEmpty()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = "54",
                Current = new CalculationVersion()
                {
                    SourceCode = "Test Source Code",
                    CalculationType = CalculationType.Additional
                }
            };

            CalculationCurrentVersion specsCalculation = new CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, specsCalculation));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient: specsClient, calcsClient: calcsClient, mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.Current.SourceCode);
            pageModel.Calculation.CalculationType.Should().Be(CalculationTypeViewModel.Additional);
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationIdNotProvidedThenBadResultReturned()
        {
            // Arrange
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = null;

            EditCalculationPageModel pageModel = CreatePageModel(mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>();

            BadRequestObjectResult typedResult = result as BadRequestObjectResult;
            typedResult.Value.Should().Be("Enter a unique name");
        }

        [TestMethod]
        public async Task OnGet_WhenUserDoesHaveEditCalculationsPermission_ThenDoesUserHavePermissionToApproveOrEditIsTrue()
        {
            // Arrange
            string calculationId = "5";
            Calculation calcsCalculation = new Calculation()
            {
                SpecificationId = "abc123"
            };

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calcsCalculation));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditCalculations))
                .Returns(true);

            EditCalculationPageModel pageModel = CreatePageModel(calcsClient: calcsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGet("5");

            // Assert
            pageModel.DoesUserHavePermissionToApproveOrEdit.Should().Be("true");
        }

        [TestMethod]
        public async Task OnGet_WhenUserDoesNotHaveEditCalculationsPermission_ThenDoesUserHavePermissionToApproveOrEditIsFalse()
        {
            // Arrange
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                SpecificationId = "abc123"
            };

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calcsCalculation));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditCalculations))
                .Returns(false);

            EditCalculationPageModel pageModel = CreatePageModel(calcsClient: calcsClient, mapper: mapper, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            pageModel.DoesUserHavePermissionToApproveOrEdit.Should().Be("false");
            string shouldShowGreyBackground = pageModel.ViewData["GreyBackground"].ToString();

            shouldShowGreyBackground
                .Should()
                .Be("False");
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsCalculationTypeIsFundingAndShouldNewEditCalculationPageBeEnabledIsTurnedOn_ThenCalculationDisplayTypeIsFundingEnsuresCheckForCalcResults()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IResultsApiClient resultsApiClient = CreateResultsApiClient();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IFeatureToggle featureToggle = CreateFeatureToggle();
            featureToggle
                .IsNewEditCalculationPageEnabled()
                .Returns(true);

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = "54",
                Current = new CalculationVersion()
                {
                    SourceCode = "Test Source Code",
                    CalculationType = CalculationType.Additional
                }
            };

            CalculationCurrentVersion specsCalculation = new CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, specsCalculation));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient: specsClient, calcsClient: calcsClient, mapper: mapper, features: featureToggle, resultsApiClient: resultsApiClient);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.Current.SourceCode);
            pageModel.Calculation.CalculationType.Should().Be(CalculationTypeViewModel.Additional);
            pageModel.CalculationHasResults.Should().BeFalse();

            await resultsApiClient
                .Received(1)
                .HasCalculationResults(Arg.Is(calcsCalculation.Id));
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsCalculationTypeIsFundingAndShouldNewEditCalculationPageBeEnabledIsTurnedOnAndResultFound_ThenCalculationDisplayTypeIsFundingSetsHasCalculationResultToTrue()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            IFeatureToggle featureToggle = CreateFeatureToggle();
            featureToggle
                .IsNewEditCalculationPageEnabled()
                .Returns(true);

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = "54",
                Current = new CalculationVersion
                {
                    SourceCode = "Test Source Code",
                    CalculationType = CalculationType.Additional
                }
            };

            CalculationCurrentVersion specsCalculation = new CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, specsCalculation));

            ApiResponse<bool> hasCalcsResponse = new ApiResponse<bool>(HttpStatusCode.OK, true);

            IResultsApiClient resultsApiClient = CreateResultsApiClient();
            resultsApiClient
                .HasCalculationResults(Arg.Is(calcsCalculation.Id))
                .Returns(hasCalcsResponse);

            EditCalculationPageModel pageModel = CreatePageModel(specsClient: specsClient, calcsClient: calcsClient, mapper: mapper, features: featureToggle, resultsApiClient: resultsApiClient);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.Current.SourceCode);
            pageModel.Calculation.CalculationType.Should().Be(CalculationTypeViewModel.Additional);
            pageModel.CalculationHasResults.Should().BeTrue();

            string shouldShowGreyBackground = pageModel.ViewData["GreyBackground"].ToString();

            shouldShowGreyBackground
                .Should()
                .Be("True");
        }

        private static EditCalculationPageModel CreatePageModel(
            ISpecsApiClient specsClient = null,
            ICalculationsApiClient calcsClient = null,
            IMapper mapper = null,
            IFeatureToggle features = null,
            IAuthorizationHelper authorizationHelper = null,
            IResultsApiClient resultsApiClient = null,
            ISpecificationAuthorizationEntity specAuthEntity = null)
        {
            EditCalculationPageModel pageModel = new EditCalculationPageModel(
                specsClient ?? CreateSpecsApiClient(),
                calcsClient ?? CreateCalcsApiClient(),
                mapper ?? CreateMapper(),
                features ?? CreateFeatureToggle(),
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditCalculations),
                resultsApiClient ?? CreateResultsApiClient(),
                specAuthEntity ?? CreateSpecAuthEntity());

            pageModel.PageContext = TestAuthHelper.CreatePageContext();
            return pageModel;
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static ICalculationsApiClient CreateCalcsApiClient()
        {
            return Substitute.For<ICalculationsApiClient>();
        }

        private static ISpecificationAuthorizationEntity CreateSpecAuthEntity()
        {
            return Substitute.For<ISpecificationAuthorizationEntity>();
        }

        private static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        private static IFeatureToggle CreateFeatureToggle()
        {
            return Substitute.For<IFeatureToggle>();
        }

        private static IResultsApiClient CreateResultsApiClient()
        {
            return Substitute.For<IResultsApiClient>();
        }
    }
}
