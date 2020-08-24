using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Interfaces.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class GraphControllerTests 
    {
        private IGraphCalculationService _graphCalculationService;
        private const string SpecificationId = "SpecificationId";

        [TestInitialize]
        public void Initialize()
        {
            _graphCalculationService = Substitute.For<IGraphCalculationService>();
        }

        [TestMethod]
        public async Task GetCalculationCircularDependencies_WhenCalled_ThenResponseIsSameAsServiceResponse()
        {
            string okObjectValue = "OkObjectValue";

            GivenOkGetCalculationCircularDependencies(okObjectValue);

            GraphController graphController = CreateGraphController();

            IActionResult actionResult = await WhenGetCalculationCircularDependencies(graphController);

            ThenOkObjectResponseReturned(actionResult, okObjectValue);
        }

        private GraphController CreateGraphController()
        {
            return new GraphController(_graphCalculationService);
        }

        private void GivenOkGetCalculationCircularDependencies(object okObjectValue)
        {
            _graphCalculationService
                .GetCalculationCircularDependencies(SpecificationId)
                .Returns(new OkObjectResult(okObjectValue));
        }

        private async Task<IActionResult> WhenGetCalculationCircularDependencies(GraphController graphController)
        {
            return await graphController.GetCalculationCircularDependencies(SpecificationId);
        }

        private void ThenOkObjectResponseReturned(IActionResult actionResult, object expectedOkObjectValue)
        {
            actionResult
                .Should()
                .NotBeNull()
                .And
                .BeOfType<OkObjectResult>();

            OkObjectResult okObjectResult = actionResult as OkObjectResult;

            okObjectResult
                .Value
                .Should()
                .NotBeNull()
                .And
                .BeSameAs(expectedOkObjectValue);
        }

    }
}
