﻿using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.Pages.Calcs;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    [TestClass]
    public class CalcsIndexPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenFirstPageRequestedWithNoFilters_ThenSuccessfullyShown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();

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

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();

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

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();

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

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();

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

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();

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

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();

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

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            CalculationSearchResultViewModel searchResult = GenerateSearchResult(0);

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();
            calculationSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            calculationSearchService
                .When(a => a.PerformSearch(Arg.Any<SearchRequestViewModel>()))
                .Do(x => { throw new HttpRequestException(); });

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();

            calculationSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((CalculationSearchResultViewModel)null);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            var itemResult = GeneratePagedResult(10);
			
            string draftCalculationId = "5";

            Calculation expectedDraftCalculation = new Calculation()
            {
                Id = draftCalculationId,
            };

            ApiResponse<Calculation> calculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, expectedDraftCalculation);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            calcsClient
                .GetCalculationById(expectedDraftCalculation.Id)
                .Returns(calculationResponse);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

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
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            var itemResult = GeneratePagedResult(10);

            string publishedCalculationId = "15";

            Calculation expectedPublishedCalculation = new Calculation()
            {
                Id = publishedCalculationId,
            };


            ApiResponse<Calculation> calculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, expectedPublishedCalculation);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            calcsClient
                .GetCalculationById(expectedPublishedCalculation.Id)
                .Returns(calculationResponse);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null, publishedCalculationId, null);

            // Assert
            pageModel.PublishedCalculation.Should().NotBeNull();
            pageModel.PublishedCalculation.Name.Should().Be(expectedPublishedCalculation.Name);
            pageModel
                .ShouldViewResultsLinkBeEnabled
                .Should()
                .Be(false);
        }

        [TestMethod]
        public void OnGet_WhenIsNewEditCalculationPageEnabledFeaturToggleIsOn_ThenSetsShouldViewResultsLinkBeEnabledToRue()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            featureToggle
                .IsNewEditCalculationPageEnabled()
                .Returns(true);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();

            // Act
            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService, featureToggle);

            // Assert
            pageModel
                .ShouldViewResultsLinkBeEnabled
                .Should()
                .Be(true);
        }

        private Task<ApiResponse<SearchResults<CalculationSearchResult>>> GeneratePagedResult(int numberOfItems)
        {
            

            List<CalculationSearchResult> items = new List<CalculationSearchResult>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationSearchResult()
                {
                    Id = $"{i}",
                    Name = $"Calculation {i}",
                });
            }

            var result = new ApiResponse<SearchResults<CalculationSearchResult>>(HttpStatusCode.OK,
	            new SearchResults<CalculationSearchResult> {Results = items.AsEnumerable(),})
            {
	            Content = {Results = items.AsEnumerable(), TotalCount = numberOfItems}
            };

            return new Task<ApiResponse<SearchResults<CalculationSearchResult>>>(() => result);
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
                    FundingPeriodName = "Test Period",
                    SpecificationName = "Spec Name",
                    Status = "Unknown",
                });
            }

            result.Calculations = items.AsEnumerable();

            return result;
        }
    }
}
