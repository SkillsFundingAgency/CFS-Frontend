// <copyright file="CalculationSearchServiceTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.Services
{
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

            ApiResponse<SearchResults<CalculationSearchResult>> expectedServiceResult = null;

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
        public async Task PerformSearch_SearchResultsReturnedCorrectly()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            int numberOfItems = 25;

            ApiResponse<SearchResults<CalculationSearchResult>> itemResult = GeneratePagedResult(numberOfItems);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            CalculationSearchResultItemViewModel[] calcs = results.Calculations.ToArray();

            for (int i = 0; i < calcs.Length; i++)
            {
                calcs[i].Id.Should().Be((i + 10).ToString());
                calcs[i].Name.Should().Be($"Calculation {i + 1}");
            }
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

            ApiResponse<SearchResults<CalculationSearchResult>> itemResult = GeneratePagedResult(numberOfItems, facets);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            CalculationSearchResultItemViewModel[] calcs = results.Calculations.ToArray();

            for (int i = 0; i < calcs.Length; i++)
            {
                calcs[i].Id.Should().Be((i + 10).ToString());
                calcs[i].Name.Should().Be($"Calculation {i + 1}");
            }

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

            var itemResult = GeneratePagedResult(numberOfItems, facets);

            calcsClient
                .FindCalculations(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            CalculationSearchResultItemViewModel[] calcs = results.Calculations.ToArray();

            for (int i = 0; i < calcs.Length; i++)
            {
                calcs[i].Id.Should().Be((i + 10).ToString());
                calcs[i].Name.Should().Be($"Calculation {i + 1}");
            }

            results.Facets.Count().Should().Be(facets.Count());

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

            var itemResult = GeneratePagedResult(numberOfItems);

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

            var itemResult = GeneratePagedResult(numberOfItems);

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

            var itemResult = GeneratePagedResult(numberOfItems);
            itemResult.Content.TotalCount = 75;

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

            var itemResult = GeneratePagedResult(numberOfItems);
            itemResult.Content.TotalCount = 175;

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

        [TestMethod]
        public async Task PerformSearch_SortExpressionPassedCorrectlyToCallee()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ICalculationSearchService calculationSearchService = new CalculationSearchService(calcsClient, mapper, logger);

            IEnumerable<string> orderByExpression = new List<string> { "name asc" };

            int numberOfItems = 50;

            var itemResult = GeneratePagedResult(numberOfItems);
            itemResult.Content.TotalCount = 175;

            calcsClient
                .FindCalculations(Arg.Is<SearchFilterRequest>(_ => _.OrderBy == orderByExpression))
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
                OrderBy = orderByExpression
            };

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(100);
        }

        private ApiResponse<SearchResults<CalculationSearchResult>> GeneratePagedResult(int numberOfItems, IEnumerable<SearchFacet> facets = null)
        {
            SearchResults<CalculationSearchResult> output = new SearchResults<CalculationSearchResult>();

            var items = new List<CalculationSearchResult>();

            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationSearchResult()
                {
                    Id = $"{i + 10}",
                    Name = $"Calculation {i + 1}",
                    SpecificationId = $"{i}",
                });
            }

            output.Results = items.AsEnumerable();
            output.TotalCount = numberOfItems;
            output.Facets = facets;
            ApiResponse<SearchResults<CalculationSearchResult>> result = new ApiResponse<SearchResults<CalculationSearchResult>>(HttpStatusCode.OK, output);
            return result;
        }
    }
}
