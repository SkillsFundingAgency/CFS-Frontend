using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.TestEngine;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    [TestClass]
    public class TestEngineControllerTests
    {
        [TestMethod]
        public void CompileTestScenario_GivenNullSpecificationId_ThrowsArgumentException()
        {
            //Arrange
            const string specificationId = "";

            TestEngineController controller = CreateController();

            //Act
            Func<Task> test = async () => await controller.CompileTestScenario(specificationId, null);

            //Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public void CompileTestScenario_GivenNullViewModel_ThrowsArgumentException()
        {
            //Arrange
            const string specificationId = "test-spec";

            TestEngineController controller = CreateController();

            //Act
            Func<Task> test = async () => await controller.CompileTestScenario(specificationId, null);

            //Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task CompileTestScenario_GivenInvalidModelState_ReturnsBadRequest()
        {
            //Arrange
            const string specificationId = "test-spec";

            ScenarioCompileViewModel viewModel = new ScenarioCompileViewModel();

            TestEngineController controller = CreateController();

            PageContext pageContext = new PageContext();

            controller
                .ModelState
                .AddModelError("error", "an error");

            //Act
            IActionResult result = await controller.CompileTestScenario(specificationId, viewModel);

            //Assert
            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public void CompileTestScenario_GivenResultFailedThrowsInvalidOperationException()
        {
            //Arrange
            const string specificationId = "test-spec";

            ScenarioCompileViewModel viewModel = new ScenarioCompileViewModel();

            ScenarioCompileModel compileModel = new ScenarioCompileModel();

            IMapper mapper = CreateMapper();
            mapper
                .Map<ScenarioCompileModel>(Arg.Is(viewModel))
                .Returns(compileModel);

            ApiResponse<IEnumerable<ScenarioCompileError>> result = new ApiResponse<IEnumerable<ScenarioCompileError>>(HttpStatusCode.BadRequest);
            ITestEngineApiClient apiClient = CreateApiClient();
            apiClient
                .CompileScenario(Arg.Is(compileModel))
                .Returns(result);

            TestEngineController controller = CreateController(mapper: mapper, testEngineApiClient: apiClient);

            //Act
            Func<Task> test = async () => await controller.CompileTestScenario(specificationId, viewModel);

            //Assert
            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task CompileTestScenario_GivenResultFromApiIsOK_ReturnsOKObjectResult()
        {
            //Arrange
            const string specificationId = "test-spec";

            ScenarioCompileViewModel viewModel = new ScenarioCompileViewModel();

            ScenarioCompileModel compileModel = new ScenarioCompileModel();

            IMapper mapper = CreateMapper();
            mapper
                .Map<ScenarioCompileModel>(Arg.Is(viewModel))
                .Returns(compileModel);

            ApiResponse<IEnumerable<ScenarioCompileError>> result = new ApiResponse<IEnumerable<ScenarioCompileError>>(HttpStatusCode.OK);
            ITestEngineApiClient apiClient = CreateApiClient();
            apiClient
                .CompileScenario(Arg.Is(compileModel))
                .Returns(result);

            TestEngineController controller = CreateController(mapper: mapper, testEngineApiClient: apiClient);

            //Act
            IActionResult actionResult = await controller.CompileTestScenario(specificationId, viewModel);

            //Assert
            actionResult
                .Should()
                .BeAssignableTo<OkObjectResult>();
        }

        [TestMethod]
        public void SearchProviders_GivenNullSearchRequest_ThrowsArgumentException()
        {
            //Arrange
            SearchRequestViewModel requestModel = null;

            TestEngineController controller = CreateController();

            //Act
            Func<Task> test = async () => await controller.SearchProviders(requestModel);

            //Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task SearchProvider_GivenNullResultFromSearch_ReturnsStatusCode500()
        {
            //Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            ITestResultsSearchService resultsSearchService = CreateResultsSearchService();
            resultsSearchService
                .PerformProviderTestResultsSearch(Arg.Is(requestModel))
                .Returns((ProviderTestsSearchResultViewModel)null);

            TestEngineController testEngineController = CreateController(testResultsSearchService: resultsSearchService);

            //Act
            IActionResult result = await testEngineController.SearchProviders(requestModel);

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
        public async Task SearchProvider_GivenNResultReturnedFromSearch_ReturnsOKResult()
        {
            //Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            ProviderTestsSearchResultViewModel viewModel = new ProviderTestsSearchResultViewModel();

            ITestResultsSearchService resultsSearchService = CreateResultsSearchService();
            resultsSearchService
                .PerformProviderTestResultsSearch(Arg.Is(requestModel))
                .Returns(viewModel);

            TestEngineController testEngineController = CreateController(testResultsSearchService: resultsSearchService);

            //Act
            IActionResult result = await testEngineController.SearchProviders(requestModel);

            //Assert
            result
                .Should()
                .BeAssignableTo<OkObjectResult>();
        }

        static TestEngineController CreateController(ITestEngineApiClient testEngineApiClient = null, IMapper mapper = null, 
            ITestResultsSearchService testResultsSearchService = null)
        {
            return new TestEngineController(testEngineApiClient ?? CreateApiClient(), mapper ?? CreateMapper(),
                testResultsSearchService ?? CreateResultsSearchService());
        }

        static ITestEngineApiClient CreateApiClient()
        {
            return Substitute.For<ITestEngineApiClient>();
        }

        static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        static ITestResultsSearchService CreateResultsSearchService()
        {
            return Substitute.For<ITestResultsSearchService>();
        }
    }
}
