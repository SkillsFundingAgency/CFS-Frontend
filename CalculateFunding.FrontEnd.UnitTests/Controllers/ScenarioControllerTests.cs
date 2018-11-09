using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Scenarios;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ScenarioControllerTests
    {
        [TestMethod]
        public async Task CreateTestScenario_WhenUserDoesHaveCreateQaTestPermission_ThenActionAllowed()
        {
            // Arrange
            string specificationId = "abc123";

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanCreateQaTests))
                .Returns(true);

            IScenariosApiClient scenariosClient = CreateScenariosClient();
            scenariosClient
                .CreateTestScenario(Arg.Any<CreateScenarioModel>())
                .Returns(new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario()));

            ScenarioController controller = CreateScenarioController(authorizationHelper: authorizationHelper, scenariosClient: scenariosClient);

            // Act
            IActionResult result = await controller.CreateTestScenario(specificationId, new ScenarioCreateViewModel());

            // Assert
            result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task CreateTestScenario_WhenUserDoesNotHaveCreateQaTestPermission_ThenReturn403()
        {
            // Arrange
            string specificationId = "abc123";

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanCreateQaTests))
                .Returns(false);

            ScenarioController controller = CreateScenarioController(authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.CreateTestScenario(specificationId, new ScenarioCreateViewModel());

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        public async Task SaveTestScenario_WhenUserDoesHaveEditQaTestPermission_ThenActionAllowed()
        {
            // Arrange
            string specificationId = "abc123";

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanEditQaTests))
                .Returns(true);

            IScenariosApiClient scenariosClient = CreateScenariosClient();
            scenariosClient.UpdateTestScenario(Arg.Any<TestScenarioUpdateModel>())
                .Returns(new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario()));

            ScenarioController controller = CreateScenarioController(authorizationHelper: authorizationHelper, scenariosClient: scenariosClient);

            // Act
            IActionResult result = await controller.SaveTestScenario(specificationId, "test123", new ScenarioEditViewModel());

            // Assert
            result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task SaveTestScenario_WhenUserDoesNotHaveEditQaTestPermission_ThenReturn403()
        {
            // Arrange
            string specificationId = "abc123";

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanEditQaTests))
                .Returns(false);

            ScenarioController controller = CreateScenarioController(authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.SaveTestScenario(specificationId, "test123", new ScenarioEditViewModel());

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        private ScenarioController CreateScenarioController(IAuthorizationHelper authorizationHelper, IScenariosApiClient scenariosClient = null)
        {
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ILogger logger = Substitute.For<ILogger>();

            return new ScenarioController(scenariosClient ?? CreateScenariosClient(),
                mapper,
                logger,
                authorizationHelper);
        }

        private IScenariosApiClient CreateScenariosClient()
        {
            return Substitute.For<IScenariosApiClient>();
        }
    }
}
