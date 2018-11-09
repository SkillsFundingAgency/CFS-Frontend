// <copyright file="CalculationSearchServiceTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.Services
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;
    using FluentAssertions;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class CalculationSearchServiceTests
    {
        [TestMethod]
        public void PerformSearch_WhenFindCalculationsServiceUnavailable_ThenHttpExceptionThrown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            calcsClient
                .When(a => a.FindCalculations(Arg.Any<SearchFilterRequest>()))
                .Do(x => { throw new HttpRequestException(); });

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            Action pageAction = new Action(() =>
            {
                CalculationSearchResultViewModel result = calculationSearchService.PerformSearch(request).Result;
            });

            // Assert
            pageAction.Should().Throw<HttpRequestException>();
        }

        [TestMethod]
        public async Task PerformSearch_WhenFindCalculationsServiceReturnsNotFound_ThenNullReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            PagedResult<CalculationSearchResultItem> expectedServiceResult = null;

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(expectedServiceResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel result = await calculationSearchService.PerformSearch(request);

            // Assert
            result.Should().BeNull();
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultReturnedCorrectly()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            CalculationSearchResultItemViewModel first = results.Calculations.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.SpecificationName.Should().Be("Spec Name");
            first.Status.Should().Be("Unknown");
            first.FundingPeriodName.Should().Be("Test Period");
            first.Name.Should().Be("Calculation 1");
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_ReturnedCorrectly()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            int numberOfItems = 25;

            IEnumerable<SearchFacet> facets = new[]
            {
                new SearchFacet(), new SearchFacet()
            };

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems, facets);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            CalculationSearchResultItemViewModel first = results.Calculations.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.SpecificationName.Should().Be("Spec Name");
            first.Status.Should().Be("Unknown");
            first.FundingPeriodName.Should().Be("Test Period");
            first.Name.Should().Be("Calculation 1");

            results.Facets.Count().Should().Be(2);
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_EnsuresFacetsLoadedCorrectly()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            int numberOfItems = 25;

            IEnumerable<SearchFacet> facets = new[]
            {
                new SearchFacet
                {
                    Name = "facet 1",
                    FacetValues = new[]
                    {
                        new SearchFacetValue { Name = "f1", Count = 5 }
                    }
                },
                new SearchFacet
                {
                    Name = "facet 2",
                    FacetValues = new[]
                    {
                        new SearchFacetValue { Name = "f2", Count = 11 },
                        new SearchFacetValue { Name = "f3", Count = 1 }
                    }
                }
            };

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems, facets);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            CalculationSearchResultItemViewModel first = results.Calculations.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.SpecificationName.Should().Be("Spec Name");
            first.Status.Should().Be("Unknown");
            first.FundingPeriodName.Should().Be("Test Period");
            first.Name.Should().Be("Calculation 1");

            results.Facets.Count().Should().Be(2);
            results.Facets.First().Name.Should().Be("facet 1");
            results.Facets.First().FacetValues.Count().Should().Be(1);
            results.Facets.First().FacetValues.First().Name.Should().Be("f1");
            results.Facets.First().FacetValues.First().Count.Should().Be(5);
            results.Facets.Last().Name.Should().Be("facet 2");
            results.Facets.Last().FacetValues.Count().Should().Be(2);
            results.Facets.Last().FacetValues.First().Name.Should().Be("f2");
            results.Facets.Last().FacetValues.First().Count.Should().Be(11);
            results.Facets.Last().FacetValues.Last().Name.Should().Be("f3");
            results.Facets.Last().FacetValues.Last().Count.Should().Be(1);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnZeroItems()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            int numberOfItems = 0;

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(0);
            results.EndItemNumber.Should().Be(0);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSinglePageOfItems()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(1);
            results.EndItemNumber.Should().Be(numberOfItems);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSecondPageOfItemsWithLessThanPageSize()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);
            itemResult.PageNumber = 2;
            itemResult.PageSize = 50;
            itemResult.TotalItems = 75;

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
            };

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(75);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSecondPageOfItemsWithMorePagesAvailable()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            int numberOfItems = 50;

            PagedResult<CalculationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);
            itemResult.PageNumber = 2;
            itemResult.PageSize = 50;
            itemResult.TotalItems = 175;

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
            };

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(100);
        }

        private PagedResult<CalculationSearchResultItem> GeneratePagedResult(int numberOfItems, IEnumerable<SearchFacet> facets = null)
        {
            PagedResult<CalculationSearchResultItem> result = new PagedResult<CalculationSearchResultItem>();
            List<CalculationSearchResultItem> items = new List<CalculationSearchResultItem>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationSearchResultItem()
                {
                    Id = $"{i + 10}",
                    Name = $"Calculation {i + 1}",
                    FundingPeriodName = "Test Period",
                    SpecificationName = "Spec Name",
                    Status = "Unknown",
                });
            }

            result.Items = items.AsEnumerable();
            result.PageNumber = 1;
            result.PageSize = 50;
            result.TotalItems = numberOfItems;
            result.TotalPages = 1;
            result.Facets = facets;

            return result;
        }
    }
}
