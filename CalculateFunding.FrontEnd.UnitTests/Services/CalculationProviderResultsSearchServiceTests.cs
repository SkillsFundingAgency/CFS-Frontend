using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class CalculationProviderResultsSearchServiceTests
    {

        [TestMethod]
        public void PerformSearch_GivenFindCalculationProviderResultsServiceUnavailable_ThenHttpExceptionThrown()
        {
            // Arrange
            IResultsApiClient resultClient = Substitute.For<IResultsApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = CreateMapper();
            CalculationProviderResultsSearchService resultsSearchService = CreateSearchService(resultClient, mapper, logger);

            resultClient
                .When(a => a.FindCalculationProviderResults(Arg.Any<SearchFilterRequest>()))
                .Do(x => { throw new HttpRequestException(); });

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            Func<Task> test = () => resultsSearchService.PerformSearch(request);
           
            // Assert
            test
                .Should()
                .Throw<HttpRequestException>();
        }

        [TestMethod]
        public async Task PerformSearch_GivenFindCalculationProviderResultsServiceReturnsNotFound_ThenNullReturned()
        {
            // Arrange
            IResultsApiClient resultClient = Substitute.For<IResultsApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = CreateMapper();

            CalculationProviderResultsSearchService resultsSearchService = CreateSearchService(resultClient, mapper, logger);

            PagedResult<CalculationProviderResultSearchResultItem> expectedServiceResult = null;

            resultClient
                .FindCalculationProviderResults(Arg.Any<SearchFilterRequest>())
                .Returns(expectedServiceResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationProviderResultSearchResultViewModel result = await resultsSearchService.PerformSearch(request);

            // Assert
            result
                .Should()
                .BeNull();
        }

        [TestMethod]
        public async Task PerformSearch_GivenFirstSearchResultReturnedCorrectly_EnsuresResult()
        {
            // Arrange
            IResultsApiClient resultClient = Substitute.For<IResultsApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CalculationProviderResultsSearchService resultsSearchService = CreateSearchService(resultClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<CalculationProviderResultSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            resultClient
                .FindCalculationProviderResults(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationProviderResultSearchResultViewModel results = await resultsSearchService.PerformSearch(request);

            // Assert
            CalculationProviderResultSearchResultItemViewModel first = results.CalculationProviderResults.First();
            first
                .Should()
                .NotBeNull();

            first
                .Id
                .Should()
                .Be("10");

            first
                .CalculationType
                .Should()
                .Be(CalculationSpecificationType.Number);

            first
                .Name
                .Should()
                .Be("prov-1");

            first
                .CalculationResult
                .Should()
                .Be(1);
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_EnsuresFacetsLoadedCorrectly()
        {
            // Arrange
            IResultsApiClient resultClient = Substitute.For<IResultsApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CalculationProviderResultsSearchService resultsSearchService = CreateSearchService(resultClient, mapper, logger);

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

            PagedResult<CalculationProviderResultSearchResultItem> itemResult = GeneratePagedResult(numberOfItems, facets);

            resultClient
                .FindCalculationProviderResults(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationProviderResultSearchResultViewModel results = await resultsSearchService.PerformSearch(request);

            // Assert
            CalculationProviderResultSearchResultItemViewModel first = results.CalculationProviderResults.First();
            first
                .Should()
                .NotBeNull();

            first
                .Id
                .Should()
                .Be("10");

            first
                .CalculationType
                .Should()
                .Be(CalculationSpecificationType.Number);

            first
                .Name
                .Should()
                .Be("prov-1");

            first
                .CalculationResult
                .Should()
                .Be(1);

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


        static CalculationProviderResultsSearchService CreateSearchService(IResultsApiClient resultsApiClient = null, IMapper mapper = null, ILogger logger = null)
        {
            return new CalculationProviderResultsSearchService(
                resultsApiClient ?? CreateResultsApiClient(),
                mapper ?? CreateMapper(),
                logger ?? CreateLogger());
        }

        static IResultsApiClient CreateResultsApiClient()
        {
            return Substitute.For<IResultsApiClient>();
        }

        static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

        PagedResult<CalculationProviderResultSearchResultItem> GeneratePagedResult(int numberOfItems, IEnumerable<SearchFacet> facets = null)
        {
            PagedResult<CalculationProviderResultSearchResultItem> result = new PagedResult<CalculationProviderResultSearchResultItem>();
            List<CalculationProviderResultSearchResultItem> items = new List<CalculationProviderResultSearchResultItem>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationProviderResultSearchResultItem()
                {
                    Id = $"{i + 10}",
                    Name = $"prov-{i + 1}",
                    CalculationResult = i + 1,
                    CalculationType = "Number"
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
