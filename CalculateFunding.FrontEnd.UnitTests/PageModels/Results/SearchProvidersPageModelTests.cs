﻿// <copyright file="SearchProvidersPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Results
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Pages.Results;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
   public class SearchProvidersPageModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_GivenNullSearchResultsReturns_ReturnsStatusCode500()
        {
            // Arrange
            IProviderSearchService searchService = CreateSearchService();

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((ProviderSearchResultViewModel)null);

            ViewProviderResultsPageModel pageModel = CreatePageModel(searchService);

            // Act
            IActionResult actionResult = await pageModel.OnGetAsync(1, string.Empty);

            // Assert
            actionResult
                .Should()
                .BeOfType<StatusCodeResult>()
                .Which.StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenSearchResultsReturnsResults_ReturnsPage()
        {
            // Arrange
            IProviderSearchService searchService = CreateSearchService();

            ProviderSearchResultViewModel model = new ProviderSearchResultViewModel();

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(model);

            ViewProviderResultsPageModel pageModel = CreatePageModel(searchService);

            // Act
            IActionResult actionResult = await pageModel.OnGetAsync(1, string.Empty);

            // Assert
            actionResult
                .Should()
                .BeOfType<PageResult>();
        }

        private static ViewProviderResultsPageModel CreatePageModel(IProviderSearchService searchService)
        {
            return new ViewProviderResultsPageModel(searchService ?? CreateSearchService());
        }

        private static IProviderSearchService CreateSearchService()
        {
            return Substitute.For<IProviderSearchService>();
        }
    }
}
