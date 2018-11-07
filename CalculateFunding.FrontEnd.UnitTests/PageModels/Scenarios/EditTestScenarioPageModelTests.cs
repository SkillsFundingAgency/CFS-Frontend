
namespace CalculateFunding.Frontend.UnitTests.PageModels.Scenarios
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Scenarios;
    using CalculateFunding.Frontend.UnitTests.Helpers;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class EditTestScenarioPageModelTests
    {
        const string TestScenarioid = "scenario-id";
        const string SpecificationId = "specification-id";

        [TestMethod]
        public void EditTestScenarioPageModel_OnGetAsync_GivenNullProviderIdProvided_ThenArgumentNullExceptionThrown()
        {
            // Arrange
            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IScenariosApiClient scenarioClient = CreateScenarioApiClient();

            EditTestScenarioPageModel pageModel = CreatePageModel(specsClient, scenarioClient);

            // Act - Assert
            Assert.ThrowsExceptionAsync<ArgumentNullException>(async () => await pageModel.OnGetAsync(null));

        }

        [TestMethod]
        public async Task EditTestScenarioPageModel_OnGet_WhenTestScenarioDoesNotExist_ThenNotFoundErrorReturned()
        {
            //Arrange

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IScenariosApiClient scenarioClient = CreateScenarioApiClient();

            EditTestScenarioPageModel pageModel = CreatePageModel(specsClient, scenarioClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(TestScenarioid);

            //Assert
            result.Should().NotBeNull();

            result
                .Should()
                .BeOfType<NotFoundObjectResult>()
                .Which
                .Value
                .Should()
                .Be("Test Scenario not found");
        }

        [TestMethod]
        public async Task EditTestScenarioPageModel_OnGetAsync_GivenTestScenarioNotFoundFromRepository_ReturnsNotFoundResult()
        {
            //Arrange
            ApiResponse<TestScenario> testScenario = new ApiResponse<TestScenario>(HttpStatusCode.NotFound);

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IScenariosApiClient scenarioClient = CreateScenarioApiClient();

            scenarioClient
             .GetCurrentTestScenarioById(Arg.Is(TestScenarioid))
             .Returns(testScenario);

            EditTestScenarioPageModel pageModel = CreatePageModel(specsClient, scenarioClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(TestScenarioid);

            //Assert
            result
                .Should()
                .BeOfType<NotFoundObjectResult>()
                .Which
                .Value
                .Should()
                .Be("Test Scenario not found");
        }

        [TestMethod]
        public async Task EditTestScenarioPageModel_OnGetAsync_GivenSpecificationNotFoundFromRepository_ReturnsPreconditionFailed()
        {
            // Arrange
            ApiResponse<TestScenario> testScenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario() { SpecificationId = SpecificationId });

            ISpecsApiClient specsClient = CreateSpecsApiClient();
            specsClient
                .GetSpecificationSummary(Arg.Is(SpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound, null));

            IScenariosApiClient scenarioClient = CreateScenarioApiClient();

            scenarioClient
             .GetCurrentTestScenarioById(Arg.Is(TestScenarioid))
             .Returns(testScenario);

            EditTestScenarioPageModel pageModel = CreatePageModel(specsClient, scenarioClient);

            // Act
            IActionResult result = await pageModel.OnGetAsync(TestScenarioid);

            // Assert
            result
                .Should()
                .BeOfType<PreconditionFailedResult>()
                .Which
                .Value
                .Should()
                .Be("Specification not found");
        }

        [TestMethod]
        public async Task EditTestScenarioPageModel_OnGetAsync_GivenValidCurrentTestScenario_ThenPageIsReturned()
        {
            // Arrange
            ApiResponse<TestScenario> testScenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario()
            {
                Description = "Test Scenario for testing",
                Gherkin = "Given test scenario Then validate test scenario",
                Id = "100",
                Name = "Test scenario for Spec - Test Spec",
                SpecificationId = SpecificationId,
                Author = new Reference() { Id = "", Name = "" },
                Version = 1
            });

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IScenariosApiClient scenarioClient = CreateScenarioApiClient();

            scenarioClient
              .GetCurrentTestScenarioById(Arg.Is(TestScenarioid))
              .Returns(testScenario);

            IEnumerable<Reference> FundingStreamList = new[]
            {
                    new Reference
                    {
                        Id=  "fs1",
                        Name= "Funding Stream Name"
                    }
                };

            SpecificationSummary specification = new SpecificationSummary()
            {
                Id = SpecificationId,
                Name = "Test Specification",
                FundingPeriod = new Reference("1617", "2016/2017"),
                Description = "Test Description",
                FundingStreams = FundingStreamList,
            };

            specsClient
                .GetSpecificationSummary(Arg.Is(SpecificationId))
               .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

            EditTestScenarioPageModel pageModel = CreatePageModel(specsClient, scenarioClient);

            // Act
            IActionResult result = await pageModel.OnGetAsync(TestScenarioid);

            // Assert
            result
               .Should()
               .BeOfType<PageResult>();

            pageModel.TestScenarioId.Should().Be("scenario-id");
            pageModel.SpecificationId.Should().Be(SpecificationId);
            pageModel.SpecificationName.Should().Be("Test Specification");
            pageModel.EditScenarioViewModel.Description.Should().Be("Test Scenario for testing");
            pageModel.EditScenarioViewModel.Name.Should().Be("Test scenario for Spec - Test Spec");
            pageModel.EditScenarioViewModel.Gherkin.Should().Be("Given test scenario Then validate test scenario");
        }

        [TestMethod]
        public async Task EditTestScenarioPageModel_OnGetAsync_WhenUserHasEditQaTestPermission_ThenDoesUserHavePermissionToSaveisTrue()
        {
            // Arrange
            ApiResponse<TestScenario> testScenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario()
            {
                Description = "Test Scenario for testing",
                Gherkin = "Given test scenario Then validate test scenario",
                Id = "100",
                Name = "Test scenario for Spec - Test Spec",
                SpecificationId = SpecificationId,
                Author = new Reference() { Id = "", Name = "" },
                Version = 1
            });

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IScenariosApiClient scenarioClient = CreateScenarioApiClient();

            scenarioClient
              .GetCurrentTestScenarioById(Arg.Is(TestScenarioid))
              .Returns(testScenario);

            IEnumerable<Reference> FundingStreamList = new[]
            {
                    new Reference
                    {
                        Id=  "fs1",
                        Name= "Funding Stream Name"
                    }
                };

            SpecificationSummary specification = new SpecificationSummary()
            {
                Id = SpecificationId,
                Name = "Test Specification",
                FundingPeriod = new Reference("1617", "2016/2017"),
                Description = "Test Description",
                FundingStreams = FundingStreamList,
            };

            specsClient
                .GetSpecificationSummary(Arg.Is(SpecificationId))
               .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditQaTests))
                .Returns(true);

            EditTestScenarioPageModel pageModel = CreatePageModel(specsClient, scenarioClient, authorizationHelper: authorizationHelper);

            // Act
            await pageModel.OnGetAsync(TestScenarioid);

            // Assert
            pageModel.DoesUserHavePermissionToSave.Should().Be("true");
        }

        [TestMethod]
        public async Task EditTestScenarioPageModel_OnGetAsync_WhenUserDoesNotHaveEditQaTestPermission_ThenDoesUserHavePermissionToSaveisFalse()
        {
            // Arrange
            ApiResponse<TestScenario> testScenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario()
            {
                Description = "Test Scenario for testing",
                Gherkin = "Given test scenario Then validate test scenario",
                Id = "100",
                Name = "Test scenario for Spec - Test Spec",
                SpecificationId = SpecificationId,
                Author = new Reference() { Id = "", Name = "" },
                Version = 1
            });

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IScenariosApiClient scenarioClient = CreateScenarioApiClient();

            scenarioClient
              .GetCurrentTestScenarioById(Arg.Is(TestScenarioid))
              .Returns(testScenario);

            IEnumerable<Reference> FundingStreamList = new[]
            {
                    new Reference
                    {
                        Id=  "fs1",
                        Name= "Funding Stream Name"
                    }
                };

            SpecificationSummary specification = new SpecificationSummary()
            {
                Id = SpecificationId,
                Name = "Test Specification",
                FundingPeriod = new Reference("1617", "2016/2017"),
                Description = "Test Description",
                FundingStreams = FundingStreamList,
            };

            specsClient
                .GetSpecificationSummary(Arg.Is(SpecificationId))
               .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditQaTests))
                .Returns(false);

            EditTestScenarioPageModel pageModel = CreatePageModel(specsClient, scenarioClient, authorizationHelper: authorizationHelper);

            // Act
            await pageModel.OnGetAsync(TestScenarioid);

            // Assert
            pageModel.DoesUserHavePermissionToSave.Should().Be("false");
        }

        private static EditTestScenarioPageModel CreatePageModel(
             ISpecsApiClient specsApiClient = null,
             IScenariosApiClient scenariosApiClient = null,
             IMapper mapper = null,
             ILogger logger = null,
             IAuthorizationHelper authorizationHelper = null)
        {
            return new EditTestScenarioPageModel(
                specsApiClient ?? CreateSpecsApiClient(),
                scenariosApiClient ?? CreateScenarioApiClient(),
                mapper ?? CreateMapper(),
                logger ?? CreateLogger(),
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditQaTests));
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IScenariosApiClient CreateScenarioApiClient()
        {
            return Substitute.For<IScenariosApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

        private static IMapper CreateMapper()
        {
            return MappingHelper.CreateFrontEndMapper();
        }
    }
}
