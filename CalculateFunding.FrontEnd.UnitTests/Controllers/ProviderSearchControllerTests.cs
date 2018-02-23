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

        private static ProviderSearchController CreateController(IProviderSearchService searchService = null)
        {
            return new ProviderSearchController(searchService ?? CreateSearchService());
        }

        private static IProviderSearchService CreateSearchService()
        {
            return Substitute.For<IProviderSearchService>();
        }
    }
}
