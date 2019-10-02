// <copyright file="IndexModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Specs
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Common.ApiClient.Specifications;
    using Extensions;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.Pages.Specs;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class IndexModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsReturnsNoResults_ReturnsPageResult()
        {
            // Arrange
            ISpecificationSearchService searchService = CreateSearchService();

            SpecificationSearchResultViewModel searchResult = new SpecificationSearchResultViewModel()
            {
                CurrentPage = 1,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Specifications = new List<SpecificationSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            IndexModel indexModel = CreateIndexModel(searchService);

            // Act
            IActionResult result = await indexModel.OnGetAsync(null, null);

            // Assert
            result
                .Should()
                .NotBeNull();

            indexModel
                .InitialSearchResults
                .Should()
                .NotBeNull();

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == 1 &&
                    c.SearchTerm == null));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsReturnsResults_ReturnsPageResult()
        {
            // Arrange
            ISpecificationSearchService searchService = CreateSearchService();

            SpecificationSearchResultViewModel searchResult = new SpecificationSearchResultViewModel()
            {
                CurrentPage = 1,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Specifications = new List<SpecificationSearchResultItemViewModel>()
                {
                    new SpecificationSearchResultItemViewModel()
                    {
                        Id = "search1",
                        Name = "search one",
                        Description = "Description",
                        LastUpdatedDate = new DateTime(2018, 3, 5, 12, 34, 52),
                        FundingPeriodId = "fundingPeriodId",
                        FundingPeriodName = "Funding Period Name",
                        FundingStreamIds = new[] { "fs1", "fs2" },
                        FundingStreamNames = new[] { "Funding Stream One", "Funding Stream Two" },
                        Status = "Draft",
                    },
                },
                StartItemNumber = 1,
                TotalResults = 0
            };


            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            IndexModel indexModel = CreateIndexModel(searchService);

            // Act
            IActionResult result = await indexModel.OnGetAsync(null, null);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            indexModel
                .InitialSearchResults
                .Should()
                .NotBeNull();

            indexModel
                .SearchResults
                .Should()
                .BeEquivalentTo(new SpecificationSearchResultViewModel()
                    {
                        CurrentPage = 1,
                        EndItemNumber = 0,
                        Facets = new List<SearchFacetViewModel>(),
                        PagerState = new PagerState(1, 1),
                        Specifications = new List<SpecificationSearchResultItemViewModel>()
                        {
                            new SpecificationSearchResultItemViewModel()
                            {
                                Id = "search1",
                                Name = "search one",
                                Description = "Description",
                                LastUpdatedDate = new DateTime(2018, 3, 5, 12, 34, 52),
                                FundingPeriodId = "fundingPeriodId",
                                FundingPeriodName = "Funding Period Name",
                                FundingStreamIds = new[] { "fs1", "fs2" },
                                FundingStreamNames = new[] { "Funding Stream One", "Funding Stream Two" },
                                Status = "Draft",
                            },
                        },
                        StartItemNumber = 1,
                        TotalResults = 0
                });

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == 1 &&
                    c.SearchTerm == null));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsSecondPageRequested_ReturnsPageResult()
        {
            // Arrange
            ISpecificationSearchService searchService = CreateSearchService();

            SpecificationSearchResultViewModel searchResult = new SpecificationSearchResultViewModel()
            {
                CurrentPage = 2,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Specifications = new List<SpecificationSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            IndexModel indexModel = CreateIndexModel(searchService);

            // Act
            IActionResult result = await indexModel.OnGetAsync(null, 2);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            indexModel
                .InitialSearchResults
                .Should()
                .NotBeNull();

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == 2 &&
                    c.SearchTerm == null));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsSearchTermRequested_ReturnsPageResult()
        {
            // Arrange
            ISpecificationSearchService searchService = CreateSearchService();

            const string searchTerm = "testTerm";

            SpecificationSearchResultViewModel searchResult = new SpecificationSearchResultViewModel()
            {
                CurrentPage = 2,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Specifications = new List<SpecificationSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            IndexModel indexModel = CreateIndexModel(searchService);

            // Act
            IActionResult result = await indexModel.OnGetAsync(searchTerm, null);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            indexModel
                .InitialSearchResults
                .Should()
                .NotBeNull();

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == 1 &&
                    c.SearchTerm == searchTerm));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsReturnsNullResults_ThenErrorReturned()
        {
            // Arrange
            ISpecificationSearchService searchService = CreateSearchService();

            SpecificationSearchResultViewModel searchResult = null;

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            IndexModel indexModel = CreateIndexModel(searchService);

            // Act
            IActionResult result = await indexModel.OnGetAsync(null, null);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("There was an error retrieving Specifications from the Search Index.");

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == 1 &&
                    c.SearchTerm == null));
        }

        private static IndexModel CreateIndexModel(
            ISpecificationSearchService searchService = null,
            ISpecsApiClient specsApiClient = null)
        {
            return new IndexModel(
                searchService ?? CreateSearchService(),
                specsApiClient ?? CreateSpecsApiClient());
        }

        private static ISpecificationSearchService CreateSearchService()
        {
            return Substitute.For<ISpecificationSearchService>();
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }
    }
}
