// <copyright file="CalcsIndexPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Calcs;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class CalcsIndexPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenFirstPageRequestedWithNoFilters_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            int generatedNumberOfItems = 10;

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                SearchTerm = null,
                PageNumber = null,
                IncludeFacets = false,
                Filters = null,
            };

            CalculationSearchResultViewModel expectedCalculationResult = GenerateSearchResult(generatedNumberOfItems);

            calculationSearchService.PerformSearch(Arg.Is<SearchRequestViewModel>(
                    m => m.PageNumber == searchRequest.PageNumber &&
                    m.SearchTerm == searchRequest.SearchTerm &&
                    m.IncludeFacets == searchRequest.IncludeFacets &&
                    m.Filters == searchRequest.Filters))
                .Returns(expectedCalculationResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null, null, null);

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.SearchResults.Should().NotBeNull();
            pageModel.SearchResults.Calculations.Should().HaveCount(generatedNumberOfItems, "The number of items returned in the calculations list should equal the expected results");
            pageModel.SearchResults.PagerState.Should().NotBeNull("Pager State should not be null");
            pageModel.SearchTerm.Should().Be(searchRequest.SearchTerm);
            pageModel.SearchResults.PagerState.CurrentPage.Should().Be(1);
            pageModel.SearchResults.PagerState.DisplayNumberOfPages.Should().Be(4);
            pageModel.SearchResults.PagerState.NextPage.Should().BeNull("Next Page should be null");
            pageModel.SearchResults.PagerState.PreviousPage.Should().BeNull("Preview Page should be null");
        }

        [TestMethod]
        public async Task OnGet_WhenSecondPageRequestedWithNoFilters_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            int generatedNumberOfItems = 50;
            int requestedPage = 2;

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                SearchTerm = null,
                PageNumber = requestedPage,
                IncludeFacets = false,
                Filters = null,
            };

            CalculationSearchResultViewModel expectedCalculationResult = GenerateSearchResult(generatedNumberOfItems);
            expectedCalculationResult.StartItemNumber = 51;
            expectedCalculationResult.EndItemNumber = 100;
            expectedCalculationResult.PagerState = new ViewModels.Common.PagerState(2, 2);

            calculationSearchService.PerformSearch(Arg.Is<SearchRequestViewModel>(
                    m => m.PageNumber == searchRequest.PageNumber &&
                    m.SearchTerm == searchRequest.SearchTerm &&
                    m.IncludeFacets == searchRequest.IncludeFacets &&
                    m.Filters == searchRequest.Filters))
                .Returns(expectedCalculationResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(requestedPage, null, null, null);

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.SearchResults.Should().NotBeNull();
            pageModel.SearchResults.Calculations.Should().HaveCount(generatedNumberOfItems, "The number of items returned in the calculations list should equal the expected results");
            pageModel.SearchResults.PagerState.Should().NotBeNull("Pager State should not be null");
            pageModel.SearchTerm.Should().Be(searchRequest.SearchTerm);
            pageModel.SearchResults.PagerState.CurrentPage.Should().Be(2);
            pageModel.SearchResults.PagerState.DisplayNumberOfPages.Should().Be(4);
            pageModel.SearchResults.PagerState.NextPage.Should().BeNull("Next Page should be null");
            pageModel.SearchResults.PagerState.PreviousPage.Should().BeNull("Preview Page should be null");
        }

        [TestMethod]
        public async Task OnPostAsync_WhenFirstPageRequestedWithNoFilters_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            int generatedNumberOfItems = 10;

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                SearchTerm = null,
                PageNumber = null,
                IncludeFacets = false,
                Filters = null,
            };

            CalculationSearchResultViewModel expectedCalculationResult = GenerateSearchResult(generatedNumberOfItems);

            calculationSearchService.PerformSearch(Arg.Is<SearchRequestViewModel>(
                    m => m.PageNumber == searchRequest.PageNumber &&
                    m.SearchTerm == searchRequest.SearchTerm &&
                    m.IncludeFacets == searchRequest.IncludeFacets &&
                    m.Filters == searchRequest.Filters))
                .Returns(expectedCalculationResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnPostAsync(null);

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.SearchResults.Should().NotBeNull();
            pageModel.SearchResults.Calculations.Should().HaveCount(generatedNumberOfItems, "The number of items returned in the calculations list should equal the expected results");
            pageModel.SearchResults.PagerState.Should().NotBeNull("Pager State should not be null");
            pageModel.SearchTerm.Should().Be(searchRequest.SearchTerm);
            pageModel.SearchResults.PagerState.CurrentPage.Should().Be(1);
            pageModel.SearchResults.PagerState.DisplayNumberOfPages.Should().Be(4);
            pageModel.SearchResults.PagerState.NextPage.Should().BeNull("Next Page should be null");
            pageModel.SearchResults.PagerState.PreviousPage.Should().BeNull("Preview Page should be null");
        }

        [TestMethod]
        public async Task OnPostAsync_WhenSecondPageRequestedWithNoFilters_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            int generatedNumberOfItems = 50;
            int requestedPage = 2;

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                SearchTerm = null,
                PageNumber = requestedPage,
                IncludeFacets = false,
                Filters = null,
            };

            CalculationSearchResultViewModel expectedCalculationResult = GenerateSearchResult(generatedNumberOfItems);
            expectedCalculationResult.StartItemNumber = 51;
            expectedCalculationResult.EndItemNumber = 100;
            expectedCalculationResult.PagerState = new ViewModels.Common.PagerState(2, 2);

            calculationSearchService.PerformSearch(Arg.Is<SearchRequestViewModel>(
                    m => m.PageNumber == searchRequest.PageNumber &&
                    m.SearchTerm == searchRequest.SearchTerm &&
                    m.IncludeFacets == searchRequest.IncludeFacets &&
                    m.Filters == searchRequest.Filters))
                .Returns(expectedCalculationResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(requestedPage, null, null, null);

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.SearchResults.Should().NotBeNull();
            pageModel.SearchResults.Calculations.Should().HaveCount(generatedNumberOfItems, "The number of items returned in the calculations list should equal the expected results");
            pageModel.SearchResults.PagerState.Should().NotBeNull("Pager State should not be null");
            pageModel.SearchTerm.Should().Be(searchRequest.SearchTerm);
            pageModel.SearchResults.PagerState.CurrentPage.Should().Be(2);
            pageModel.SearchResults.PagerState.DisplayNumberOfPages.Should().Be(4);
            pageModel.SearchResults.PagerState.NextPage.Should().BeNull("Next Page should be null");
            pageModel.SearchResults.PagerState.PreviousPage.Should().BeNull("Preview Page should be null");
        }

        [TestMethod]
        public async Task OnPostAsync_WhenFirstPageRequestedWithSearchTerm_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            int generatedNumberOfItems = 10;
            string searchTerm = "test search";

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                SearchTerm = searchTerm,
                PageNumber = null,
                IncludeFacets = false,
                Filters = null,
            };

            CalculationSearchResultViewModel expectedCalculationResult = GenerateSearchResult(generatedNumberOfItems);

            calculationSearchService.PerformSearch(Arg.Is<SearchRequestViewModel>(
                    m => m.PageNumber == searchRequest.PageNumber &&
                    m.SearchTerm == searchRequest.SearchTerm &&
                    m.IncludeFacets == searchRequest.IncludeFacets &&
                    m.Filters == searchRequest.Filters))
                .Returns(expectedCalculationResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            pageModel.SearchTerm = searchTerm;

            // Act
            IActionResult result = await pageModel.OnPostAsync(null);

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.SearchResults.Should().NotBeNull();
            pageModel.SearchResults.Calculations.Should().HaveCount(generatedNumberOfItems, "The number of items returned in the calculations list should equal the expected results");
            pageModel.SearchResults.PagerState.Should().NotBeNull("Pager State should not be null");
            pageModel.SearchTerm.Should().Be(searchRequest.SearchTerm);
            pageModel.SearchResults.PagerState.CurrentPage.Should().Be(1);
            pageModel.SearchResults.PagerState.DisplayNumberOfPages.Should().Be(4);
            pageModel.SearchResults.PagerState.NextPage.Should().BeNull("Next Page should be null");
            pageModel.SearchResults.PagerState.PreviousPage.Should().BeNull("Preview Page should be null");
        }

        [TestMethod]
        public async Task OnPostAsync_WhenSecondPageRequestedWithSearchTerm_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            int generatedNumberOfItems = 50;
            int requestedPage = 2;
            string searchTerm = "test search";

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                SearchTerm = searchTerm,
                PageNumber = requestedPage,
                IncludeFacets = false,
                Filters = null,
            };

            CalculationSearchResultViewModel expectedCalculationResult = GenerateSearchResult(generatedNumberOfItems);
            expectedCalculationResult.StartItemNumber = 51;
            expectedCalculationResult.EndItemNumber = 100;
            expectedCalculationResult.PagerState = new ViewModels.Common.PagerState(2, 2);

            calculationSearchService.PerformSearch(Arg.Is<SearchRequestViewModel>(
                    m => m.PageNumber == searchRequest.PageNumber &&
                    m.SearchTerm == searchRequest.SearchTerm &&
                    m.IncludeFacets == searchRequest.IncludeFacets &&
                    m.Filters == searchRequest.Filters))
                .Returns(expectedCalculationResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            pageModel.SearchTerm = searchTerm;

            // Act
            IActionResult result = await pageModel.OnPostAsync(requestedPage);

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.SearchResults.Should().NotBeNull();
            pageModel.SearchResults.Calculations.Should().HaveCount(generatedNumberOfItems, "The number of items returned in the calculations list should equal the expected results");
            pageModel.SearchResults.PagerState.Should().NotBeNull("Pager State should not be null");
            pageModel.SearchTerm.Should().Be(searchTerm);
            pageModel.SearchResults.PagerState.CurrentPage.Should().Be(2);
            pageModel.SearchResults.PagerState.DisplayNumberOfPages.Should().Be(4);
            pageModel.SearchResults.PagerState.NextPage.Should().BeNull("Next Page should be null");
            pageModel.SearchResults.PagerState.PreviousPage.Should().BeNull("Preview Page should be null");
        }

        [TestMethod]
        public async Task OnGet_WhenNoCalculationsExist()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            PagedResult<CalculationSearchResultItem> zeroItemResult = new PagedResult<CalculationSearchResultItem>()
            {
                Items = Enumerable.Empty<CalculationSearchResultItem>(),
                PageNumber = 1,
                PageSize = 50,
                TotalItems = 0,
                TotalPages = 0,
            };

            calcsClient.FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(zeroItemResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null, null, null);

            // Assert
            result.Should().NotBeNull();
            pageModel.SearchResults.CurrentPage.Should().Be(1);
            pageModel.SearchResults.Calculations.Should().BeEmpty();
            pageModel.SearchResults.PagerState.CurrentPage.Should().Be(1);
        }

        [TestMethod]
        public void OnGet_WhenFindCalculationsServiceUnavailable_ThenHttpExceptionThrown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            calcsClient
                .When(a => a.FindCalculations(Arg.Any<SearchFilterRequest>()))
                .Do(x => { throw new HttpRequestException(); });

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            Action pageAction = new Action(() =>
            {
                IActionResult result = pageModel.OnGetAsync(null, null, null, null).Result;
            });

            // Assert
            pageAction.Should().Throw<HttpRequestException>();
        }

        [TestMethod]
        public async Task OnGet_WhenFindCalculationsServiceReturnsNull_ThenServerErrorResponseIsReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            calculationSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((CalculationSearchResultViewModel)null);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null, null, null);

            // Assert
            result.Should().BeOfType<StatusCodeResult>();
            StatusCodeResult typedResult = result as StatusCodeResult;
            typedResult.StatusCode.Should().Be(500);
        }

        [TestMethod]
        public async Task OnGet_WhenDraftSavedRequested_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(10);

            string draftCalculationId = "5";

            Calculation expectedDraftCalculation = new Calculation()
            {
                Id = draftCalculationId,
                Name = "Draft Calculation 5"
            };

            ApiResponse<Calculation> calculationResponse = new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, expectedDraftCalculation);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            calcsClient
                .GetCalculationById(expectedDraftCalculation.Id)
                .Returns(calculationResponse);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, draftCalculationId, null, null);

            // Assert
            pageModel.DraftSavedCalculation.Should().NotBeNull();
            pageModel.DraftSavedCalculation.Name.Should().Be(expectedDraftCalculation.Name);
        }

        [TestMethod]
        public async Task OnGet_WhenPublishedCalculationRequested_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(10);

            string publishedCalculationId = "15";

            Calculation expectedPublishedCalculation = new Calculation()
            {
                Id = publishedCalculationId,
                Name = "Published Calculation 5"
            };

            ApiResponse<Calculation> calculationResponse = new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, expectedPublishedCalculation);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            calcsClient
                .GetCalculationById(expectedPublishedCalculation.Id)
                .Returns(calculationResponse);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null, publishedCalculationId, null);

            // Assert
            pageModel.PublishedCalculation.Should().NotBeNull();
            pageModel.PublishedCalculation.Name.Should().Be(expectedPublishedCalculation.Name);
        }

        private PagedResult<CalculationSearchResultItem> GeneratePagedResult(int numberOfItems)
        {
            PagedResult<CalculationSearchResultItem> result = new PagedResult<CalculationSearchResultItem>();
            List<CalculationSearchResultItem> items = new List<CalculationSearchResultItem>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationSearchResultItem()
                {
                    Id = $"{i}",
                    Name = $"Calculation {i}",
                    PeriodName = "Test Period",
                    SpecificationName = "Spec Name",
                    Status = "Unknown",
                });
            }

            result.Items = items.AsEnumerable();
            result.PageNumber = 1;
            result.PageSize = 50;
            result.TotalItems = numberOfItems;
            result.TotalPages = 1;

            return result;
        }

        private CalculationSearchResultViewModel GenerateSearchResult(int numberOfItems)
        {
            CalculationSearchResultViewModel result = new CalculationSearchResultViewModel()
            {
                CurrentPage = 1,
                EndItemNumber = numberOfItems,
                Facets = null,
                PagerState = new ViewModels.Common.PagerState(1, 1),
                StartItemNumber = 1,
                TotalResults = numberOfItems,
            };

            List<CalculationSearchResultItemViewModel> items = new List<CalculationSearchResultItemViewModel>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationSearchResultItemViewModel()
                {
                    Id = $"{i}",
                    Name = $"Calculation {i}",
                    PeriodName = "Test Period",
                    SpecificationName = "Spec Name",
                    Status = "Unknown",
                });
            }

            result.Calculations = items.AsEnumerable();

            return result;
        }
    }
}
