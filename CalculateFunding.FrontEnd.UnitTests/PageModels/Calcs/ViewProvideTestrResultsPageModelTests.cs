using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
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
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    [TestClass]
    public class ViewProvideTestrResultsPageModelTests
    {
        const string Scenarioid = "scenario-id";

        [TestMethod]
        public async Task OnGetAsync_GivenScenarioNotReturned_ReturnsNotFoundResult()
        {
            //Arrange
            ApiResponse<Scenario> scenario = new ApiResponse<Scenario>(HttpStatusCode.NotFound);

            IScenariosApiClient apiClient = CreateApiClient();
            apiClient
                .GetScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ViewProvideTestResultsPageModel pageModel = CreatePageModel(scenariosApiClient: apiClient);

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
            ApiResponse<Scenario> scenario = new ApiResponse<Scenario>(HttpStatusCode.OK, new Scenario());

            IScenariosApiClient apiClient = CreateApiClient();
            apiClient
                .GetScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ScenarioViewModel scenarioViewModel = new ScenarioViewModel();

            IMapper mapper = CreateMapper();
            mapper
                .Map<ScenarioViewModel>(Arg.Any<Scenario>())
                .Returns(scenarioViewModel);

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((ProviderTestsSearchResultViewModel)null);

            ViewProvideTestResultsPageModel pageModel = CreatePageModel(scenariosApiClient: apiClient, mapper: mapper);

            //Act
            IActionResult result = await pageModel.OnGetAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeAssignableTo<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenResultsReturned_ReturnsPage()
        {
            //Arrange
            ApiResponse<Scenario> scenario = new ApiResponse<Scenario>(HttpStatusCode.OK, new Scenario());

            IScenariosApiClient apiClient = CreateApiClient();
            apiClient
                .GetScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ScenarioViewModel scenarioViewModel = new ScenarioViewModel();

            IMapper mapper = CreateMapper();
            mapper
                .Map<ScenarioViewModel>(Arg.Any<Scenario>())
                .Returns(scenarioViewModel);

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewProvideTestResultsPageModel pageModel = CreatePageModel(resultsService, apiClient, mapper: mapper);

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
            ApiResponse<Scenario> scenario = new ApiResponse<Scenario>(HttpStatusCode.NotFound);

            IScenariosApiClient apiClient = CreateApiClient();
            apiClient
                .GetScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ViewProvideTestResultsPageModel pageModel = CreatePageModel(scenariosApiClient: apiClient);

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
            ApiResponse<Scenario> scenario = new ApiResponse<Scenario>(HttpStatusCode.OK, new Scenario());

            IScenariosApiClient apiClient = CreateApiClient();
            apiClient
                .GetScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ScenarioViewModel scenarioViewModel = new ScenarioViewModel();

            IMapper mapper = CreateMapper();
            mapper
                .Map<ScenarioViewModel>(Arg.Any<Scenario>())
                .Returns(scenarioViewModel);

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((ProviderTestsSearchResultViewModel)null);

            ViewProvideTestResultsPageModel pageModel = CreatePageModel(scenariosApiClient: apiClient, mapper: mapper);

            //Act
            IActionResult result = await pageModel.OnPostAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeAssignableTo<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnPostAsync_GivenResultsReturned_ReturnsPage()
        {
            //Arrange
            ApiResponse<Scenario> scenario = new ApiResponse<Scenario>(HttpStatusCode.OK, new Scenario());

            IScenariosApiClient apiClient = CreateApiClient();
            apiClient
                .GetScenarioById(Arg.Is(Scenarioid))
                .Returns(scenario);

            ScenarioViewModel scenarioViewModel = new ScenarioViewModel();

            IMapper mapper = CreateMapper();
            mapper
                .Map<ScenarioViewModel>(Arg.Any<Scenario>())
                .Returns(scenarioViewModel);

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsService = CreateResultsService();
            resultsService
                .PerformProviderTestResultsSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewProvideTestResultsPageModel pageModel = CreatePageModel(resultsService, apiClient, mapper);

            //Act
            IActionResult result = await pageModel.OnPostAsync(Scenarioid, null, "");

            //Assert
            result
                .Should()
                .BeAssignableTo<PageResult>();
        }

        static ViewProvideTestResultsPageModel CreatePageModel(ITestResultsSearchService testResultsSearchService = null, 
            IScenariosApiClient scenariosApiClient = null, IMapper mapper = null)
        {
            return new ViewProvideTestResultsPageModel(testResultsSearchService ?? CreateResultsService(), 
                scenariosApiClient ?? CreateApiClient(), mapper ?? CreateMapper());
        }

        static ITestResultsSearchService CreateResultsService()
        {
            return Substitute.For<ITestResultsSearchService>();
        }

        static IScenariosApiClient CreateApiClient()
        {
            return Substitute.For<IScenariosApiClient>();
        }

        static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }
    }
}
