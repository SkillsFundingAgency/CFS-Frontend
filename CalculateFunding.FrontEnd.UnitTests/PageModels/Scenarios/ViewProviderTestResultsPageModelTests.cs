using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.Pages.Scenarios;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Scenarios;
using CalculateFunding.Frontend.ViewModels.TestEngine;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;

namespace CalculateFunding.Frontend.PageModels.Scenarios
{
    [TestClass]
    public class ViewProviderTestResultsPageModelTests
    {
        const string Scenarioid = "scenario-id";

        [TestMethod]
        public async Task OnGetAsync_GivenScenarioNotReturned_ReturnsNotFoundResult()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.NotFound);

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(scenariosApiClient: apiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeAssignableTo<NotFoundResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenResultsIsNull_ReturnsStatusCodeResult500()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            TestScenarioViewModel scenarioViewModel = new TestScenarioViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((ProviderTestsSearchResultViewModel)null);

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(scenariosApiClient: apiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Provider Results returned null");
        }

        [TestMethod]
        public async Task OnGetAsync_GivenResultsReturned_ReturnsPage()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient scenariosClient = CreateScenariosClient();
            scenariosClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            TestScenarioViewModel scenarioViewModel = new TestScenarioViewModel();

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ITestEngineApiClient testEngineClient = CreateTestEngineClient();

            List<TestScenarioResultCounts> countResults = new List<TestScenarioResultCounts>();

            testEngineClient
                .GetTestResultCounts(Arg.Is<TestScenarioResultCountsRequestModel>(c => c.TestScenarioIds.Count() == 1 && c.TestScenarioIds.First() == Scenarioid))
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, countResults));

            ISpecificationsApiClient specsApiClient = CreateSpecsClient();
            specsApiClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(resultsService, testEngineClient, scenariosClient, specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeAssignableTo<PageResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenScenarioNotReturned_ReturnsNotFoundResult()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.NotFound);

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(scenariosApiClient: apiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeAssignableTo<NotFoundResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenResultsIsNull_ReturnsStatusCodeResult500()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            TestScenarioViewModel scenarioViewModel = new TestScenarioViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((ProviderTestsSearchResultViewModel)null);

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(scenariosApiClient: apiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(Scenarioid, null, "");

            //Assert
            result
                 .Should()
                 .BeOfType<InternalServerErrorResult>()
                 .Which
                 .Value
                 .Should()
                 .Be("Provider Results returned null");
        }

        [TestMethod]
        public async Task OnPostAsync_GivenResultsReturned_ReturnsPage()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient scenariosClient = CreateScenariosClient();
            scenariosClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            TestScenarioViewModel scenarioViewModel = new TestScenarioViewModel();

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ITestEngineApiClient testEngineClient = CreateTestEngineClient();

            List<TestScenarioResultCounts> countResults = new List<TestScenarioResultCounts>();

            testEngineClient
                .GetTestResultCounts(Arg.Is<TestScenarioResultCountsRequestModel>(c => c.TestScenarioIds.Count() == 1 && c.TestScenarioIds.First() == Scenarioid))
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, countResults));

            ISpecificationsApiClient specsApiClient = CreateSpecsClient();
            specsApiClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(resultsService, testEngineClient, scenariosClient, specsApiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeAssignableTo<PageResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCountTaskIsNull_ThenErrorIsReturned()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ITestEngineApiClient testEngineApiClient = CreateTestEngineClient();

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns((ApiResponse<IEnumerable<TestScenarioResultCounts>>)null);

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(resultsService, testEngineApiClient, scenariosApiClient: apiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Count Task result was null");

            await testEngineApiClient
                 .Received(1)
                 .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>());
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCountTaskIsNull_ThenErrorIsReturned()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ITestEngineApiClient testEngineApiClient = CreateTestEngineClient();

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns((ApiResponse<IEnumerable<TestScenarioResultCounts>>)null);

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(resultsService, testEngineApiClient, scenariosApiClient: apiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Count Task result was null");

            await testEngineApiClient
                 .Received(1)
                 .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>());
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCountTaskStatusCodeNotOk_ThenErrorIsReturned()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ITestEngineApiClient testEngineApiClient = CreateTestEngineClient();

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.InternalServerError, null));

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(resultsService, testEngineApiClient, scenariosApiClient: apiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Count Task didn't return OK, but instead 'InternalServerError'");

            await testEngineApiClient
                 .Received(1)
                 .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>());
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCountTaskReturnsNullContent_ThenErrorIsReturned()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ITestEngineApiClient testEngineApiClient = CreateTestEngineClient();

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, null));

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(resultsService, testEngineApiClient, scenariosApiClient: apiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Count Task result content was null");

            await testEngineApiClient
                 .Received(1)
                 .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>());
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCountTaskReturnsNoItems_ThenCoverageIsSetCorrectly()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ITestEngineApiClient testEngineApiClient = CreateTestEngineClient();

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, Enumerable.Empty<TestScenarioResultCounts>()));

            ISpecificationsApiClient specsApiClient = CreateSpecsClient();
            specsApiClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(
                resultsService, testEngineApiClient,
                scenariosApiClient: apiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            await testEngineApiClient
                 .Received(1)
                 .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>());

            pageModel
                .TestCoverage
                .Should()
                .Be(0);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCountTaskHasItemsForTestCoverage_ThenCoverageIsSetCorrectly()
        {
            //Arrange
            ApiResponse<TestScenario> scenario = new ApiResponse<TestScenario>(HttpStatusCode.OK, new TestScenario());

            IScenariosApiClient apiClient = CreateScenariosClient();
            apiClient
                .GetCurrentTestScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ITestEngineApiClient testEngineApiClient = CreateTestEngineClient();

            List<TestScenarioResultCounts> testScenarioResultCounts = new List<TestScenarioResultCounts>();
            testScenarioResultCounts.Add(new TestScenarioResultCounts()
            {
                Failed = 17,
                Ignored = 186,
                Passed = 345,
                TestScenarioId = "1",
            });

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, testScenarioResultCounts));

            ISpecificationsApiClient specsApiClient = CreateSpecsClient();
            specsApiClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

            ViewProviderTestResultsPageModel pageModel = CreatePageModel(
                resultsService, testEngineApiClient, 
                scenariosApiClient: apiClient, 
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            await testEngineApiClient
                 .Received(1)
                 .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>());

            pageModel
                .TestCoverage
                .Should()
                .Be(66.1M);
        }

        static ViewProviderTestResultsPageModel CreatePageModel(
            ITestResultsSearchService testResultsSearchService = null,
            ITestEngineApiClient testEngineApiClient = null,
            IScenariosApiClient scenariosApiClient = null,
            ISpecificationsApiClient specsApiClient = null,
            IMapper mapper = null)
        {
            return new ViewProviderTestResultsPageModel(
                testResultsSearchService ?? CreateResultsService(),
                testEngineApiClient ?? CreateTestEngineClient(),
                scenariosApiClient ?? CreateScenariosClient(),
                specsApiClient ?? CreateSpecsClient(),
                mapper ?? CreateMapper());
        }

        static ITestResultsSearchService CreateResultsService()
        {
            return Substitute.For<ITestResultsSearchService>();
        }

        static ITestEngineApiClient CreateTestEngineClient()
        {
            return Substitute.For<ITestEngineApiClient>();
        }

        static IScenariosApiClient CreateScenariosClient()
        {
            return Substitute.For<IScenariosApiClient>();
        }

        static ISpecificationsApiClient CreateSpecsClient()
        {
            return Substitute.For<ISpecificationsApiClient>();
        }

        static IMapper CreateMapper()
        {
            return MappingHelper.CreateFrontEndMapper();
        }
    }
}
