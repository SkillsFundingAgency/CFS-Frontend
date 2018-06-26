namespace CalculateFunding.Frontend.Controllers
{
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.TestEngine;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using System;
    using System.Threading.Tasks;

    [TestClass]
    public class TestScenarioSearchControllerTests
    {
        [TestMethod]
        public void SearchTestScenarios_GivenNullRequestObject_ThrowsArgumentNullException()
        {

            // Arrange
            TestScenarioSearchController controller = CreateController();

            SearchRequestViewModel requestModel = null;

            // Act
            Func<Task> test = async () => await controller.SearchTestScenarios(requestModel);

            // Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task SearchTestScenarios_GivenResultsReturnedFromSearch_ReturnsOK()
        {
            // Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            TestScenarioSearchResultViewModel results = new TestScenarioSearchResultViewModel();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(results);

            TestScenarioSearchController controller = CreateController(searchService);

            // Act
            IActionResult actionResult = await controller.SearchTestScenarios(requestModel);

            // Asserts
            actionResult
                .Should()
                .BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task SearchTestScenarios_GivenNullResultsReturnedFromSearch_ReturnsStatusCode500()
        {
            // Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((TestScenarioSearchResultViewModel)null);

            TestScenarioSearchController controller = CreateController(searchService);

            // Act
            IActionResult actionResult = await controller.SearchTestScenarios(requestModel);

            // Asserts
            actionResult
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = actionResult as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        private static TestScenarioSearchController CreateController(ITestScenarioSearchService searchService = null)
        {
            return new TestScenarioSearchController(searchService ?? CreateTestScenarioSearchService());
        }

        private static ITestScenarioSearchService CreateTestScenarioSearchService()
        {
            return Substitute.For<ITestScenarioSearchService>();
        }
    }
}
