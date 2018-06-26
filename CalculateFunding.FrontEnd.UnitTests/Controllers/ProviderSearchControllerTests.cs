// <copyright file="ProviderSearchControllerTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.Controllers
{
    using System;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class ProviderSearchControllerTests
    {
        [TestMethod]
        public void SearchProviders_GivenNullRequestObject_ThrowsArgumentNullException()
        {
            // Arrange
            ProviderSearchController controller = CreateController();

            SearchRequestViewModel requestModel = null;

            // Act
            Func<Task> test = async () => await controller.SearchProviders(requestModel);

            // Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task SearchProviders_GivenNullResultsReturnedFromSearch_ReturnsStatusCode500()
        {
            // Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            IProviderSearchService searchService = CreateSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((ProviderSearchResultViewModel)null);

            ProviderSearchController controller = CreateController(searchService);

            // Act
            IActionResult actionResult = await controller.SearchProviders(requestModel);

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

        [TestMethod]
        public async Task SearchProviders_GivenResultsReturnedFromSearch_ReturnsOK()
        {
            // Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            ProviderSearchResultViewModel results = new ProviderSearchResultViewModel();

            IProviderSearchService searchService = CreateSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(results);

            ProviderSearchController controller = CreateController(searchService);

            // Act
            IActionResult actionResult = await controller.SearchProviders(requestModel);

            // Asserts
            actionResult
                .Should()
                .BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public void SearchCalculationProviderResults_GivenNullRequestObject_ThrowsArgumentNullException()
        {
            // Arrange
            ProviderSearchController controller = CreateController();

            SearchRequestViewModel requestModel = null;

            // Act
            Func<Task> test = async () => await controller.SearchCalculationProviderResults(requestModel);

            // Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }


        [TestMethod]
        public async Task SearchCalculationProviderResults_GivenNullResultsReturnedFromSearch_ReturnsStatusCode500()
        {
            // Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            ICalculationProviderResultsSearchService searchService = CreateCalculationProviderResultsSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((CalculationProviderResultSearchResultViewModel)null);

            ProviderSearchController controller = CreateController(calculationProviderResultsSearchService: searchService);

            // Act
            IActionResult actionResult = await controller.SearchCalculationProviderResults(requestModel);

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

        [TestMethod]
        public async Task SearchCalculationProviderResults_GivenResultsReturnedFromSearch_ReturnsOK()
        {
            // Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            CalculationProviderResultSearchResultViewModel results = new CalculationProviderResultSearchResultViewModel();

            ICalculationProviderResultsSearchService searchService = CreateCalculationProviderResultsSearchService();

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(results);

            ProviderSearchController controller = CreateController(calculationProviderResultsSearchService: searchService);

            // Act
            IActionResult actionResult = await controller.SearchCalculationProviderResults(requestModel);

            // Asserts
            actionResult
                .Should()
                .BeOfType<OkObjectResult>();
        }

        private static ProviderSearchController CreateController(
            IProviderSearchService searchService = null,
            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = null)
        {
            return new ProviderSearchController(
                searchService ?? CreateSearchService(), 
                calculationProviderResultsSearchService ?? CreateCalculationProviderResultsSearchService());
        }

        private static IProviderSearchService CreateSearchService()
        {
            return Substitute.For<IProviderSearchService>();
        }

        private static ICalculationProviderResultsSearchService CreateCalculationProviderResultsSearchService()
        {
            return Substitute.For<ICalculationProviderResultsSearchService>();
        }
    }
}
