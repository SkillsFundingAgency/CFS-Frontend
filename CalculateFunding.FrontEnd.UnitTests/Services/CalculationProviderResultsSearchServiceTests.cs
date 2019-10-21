using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Helpers;
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
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.Models.Search;

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
                .When(a => a.SearchCalculationProviderResults(Arg.Any<SearchModel>()))
                .Do(x => throw new HttpRequestException());

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

            resultClient
                .SearchCalculationProviderResults(Arg.Any<SearchModel>())
                .Returns((ApiResponse<CalculationProviderResultSearchResults>)null);

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

            CalculationProviderResultSearchResults itemResult = GenerateSearchResults(numberOfItems);

            resultClient
	            .SearchCalculationProviderResults(Arg.Any<SearchModel>())
	            .Returns(new ApiResponse<CalculationProviderResultSearchResults>(HttpStatusCode.OK, itemResult));

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

            CalculationProviderResultSearchResultItemViewModel last = results.CalculationProviderResults.Last();

            last
                .CalculationExceptionType
                .Should()
                .Be("Exception");

            last
                .CalculationExceptionMessage
                .Should()
                .Be("An exception has occurred");
        }

        [TestMethod]
        public async Task PerformSearch_GivenFirstSearchResultReturnedCorrectly_EnsuresResults()
        {
            // Arrange
            IResultsApiClient resultClient = Substitute.For<IResultsApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CalculationProviderResultsSearchService resultsSearchService = CreateSearchService(resultClient, mapper, logger);

            int numberOfItems = 25;

            CalculationProviderResultSearchResults itemResult = GenerateSearchResults(numberOfItems);

            resultClient
	            .SearchCalculationProviderResults(Arg.Any<SearchModel>())
	            .Returns(new ApiResponse<CalculationProviderResultSearchResults>(HttpStatusCode.OK, itemResult));

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationProviderResultSearchResultViewModel results = await resultsSearchService.PerformSearch(request);

            // Assert
            results.TotalResults.Should().Be(numberOfItems + 1);
            results.TotalErrorResults.Should().Be(1);
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

            IEnumerable<Facet> facets = new[]
            {
                new Facet
                {
                    Name = "facet 1",
                    FacetValues = new[]
                    {
                        new FacetValue { Name = "f1", Count = 5 }
                    }
                },
                new Facet
                {
                    Name = "facet 2",
                    FacetValues = new[]
                    {
                        new FacetValue { Name = "f2", Count = 11 },
                        new FacetValue { Name = "f3", Count = 1 }
                    }
                }
            };

            CalculationProviderResultSearchResults itemResult = GenerateSearchResults(numberOfItems, facets);

            resultClient
                .SearchCalculationProviderResults(Arg.Any<SearchModel>())
                .Returns(new ApiResponse<CalculationProviderResultSearchResults>(HttpStatusCode.OK, itemResult));

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

        CalculationProviderResultSearchResults GenerateSearchResults(int numberOfItems, IEnumerable<Facet> facets = null)
        {
	        CalculationProviderResultSearchResults result = new CalculationProviderResultSearchResults();
            List<CalculationProviderResultSearchResult> items = new List<CalculationProviderResultSearchResult>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationProviderResultSearchResult
                {
                    Id = $"{i + 10}",
                    CalculationName = $"prov-{i + 1}",
                    CalculationResult = i + 1,
                    CalculationType = "Number"
                });
            }

            items.Add(new CalculationProviderResultSearchResult
            {
                Id = $"{numberOfItems + 10}",
                CalculationName = $"prov-{numberOfItems + 1}",
                CalculationResult = numberOfItems + 1,
                CalculationType = "Number",
                CalculationExceptionType = "Exception",
                CalculationExceptionMessage = "An exception has occurred"
            });

            result.Results = items.AsEnumerable();
            result.TotalCount = numberOfItems + 1;
            result.TotalErrorCount = 1;
            result.Facets = facets;

            return result;
        }
    }
}
