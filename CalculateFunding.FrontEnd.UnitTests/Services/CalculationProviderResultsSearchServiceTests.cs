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
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class CalculationProviderResultsSearchServiceTests
    {
        private IResultsApiClient _resultsClient;
        private ICalculationsApiClient _calculationsClient;
        private IMapper _mapper;
        private ILogger _logger;
        private CalculationProviderResultsSearchService _resultsSearchService;

        [TestInitialize]
        public void TestInitialize()
        {
            _resultsClient = Substitute.For<IResultsApiClient>();
            _calculationsClient = Substitute.For<ICalculationsApiClient>();
            MapperConfiguration mapperConfiguration = new MapperConfiguration(c =>
            {
                c.AddProfile<FrontEndMappingProfile>();
            });
            _mapper = mapperConfiguration.CreateMapper();

            _logger = Substitute.For<ILogger>();

            _resultsSearchService = new CalculationProviderResultsSearchService(_resultsClient, _calculationsClient, _mapper, _logger);
        }

        [TestMethod]
        public void PerformSearch_GivenFindCalculationProviderResultsServiceUnavailable_ThenHttpExceptionThrown()
        {
            // Arrange
            _resultsClient
                .When(a => a.SearchCalculationProviderResults(Arg.Any<SearchModel>()))
                .Do(x => throw new HttpRequestException());

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            Func<Task> test = () => _resultsSearchService.PerformSearch(request);

            // Assert
            test
                .Should()
                .Throw<HttpRequestException>();
        }

        [TestMethod]
        public async Task PerformSearch_GivenFindCalculationProviderResultsServiceReturnsNotFound_ThenNullReturned()
        {
            // Arrange
            _resultsClient
                .SearchCalculationProviderResults(Arg.Any<SearchModel>())
                .Returns((ApiResponse<CalculationProviderResultSearchResults>)null);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            CalculationProviderResultSearchResultViewModel result = await _resultsSearchService.PerformSearch(request);

            // Assert
            result
                .Should()
                .BeNull();
        }

        [TestMethod]
        public async Task PerformSearch_GivenFirstSearchResultReturnedCorrectly_EnsuresResult()
        {
            // Arrange
            int numberOfItems = 25;

            CalculationProviderResultSearchResults itemResult = GenerateSearchResults(numberOfItems);

            _resultsClient
                .SearchCalculationProviderResults(Arg.Any<SearchModel>())
                .Returns(new ApiResponse<CalculationProviderResultSearchResults>(HttpStatusCode.OK, itemResult));

            SearchRequestViewModel request = new SearchRequestViewModel();

            AndCalculationExistsForCalcId("calcId");

            // Act
            CalculationProviderResultSearchResultViewModel results = await _resultsSearchService.PerformSearch(request);

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
                .ProviderName
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

        private void AndCalculationExistsForCalcId(string calculationId)
        {
            Calculation calculation = new Calculation()
            {
                CalculationType = Common.ApiClient.Calcs.Models.CalculationType.Additional,
                ValueType = CalculationValueType.Currency,
            };

            _calculationsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calculation));
        }

        [TestMethod]
        public async Task PerformSearch_GivenFirstSearchResultReturnedCorrectly_EnsuresResults()
        {
            // Arrange
            int numberOfItems = 25;

            CalculationProviderResultSearchResults itemResult = GenerateSearchResults(numberOfItems);

            _resultsClient
                .SearchCalculationProviderResults(Arg.Any<SearchModel>())
                .Returns(new ApiResponse<CalculationProviderResultSearchResults>(HttpStatusCode.OK, itemResult));

            SearchRequestViewModel request = new SearchRequestViewModel();

            AndCalculationExistsForCalcId("calcId");

            // Act
            CalculationProviderResultSearchResultViewModel results = await _resultsSearchService.PerformSearch(request);

            // Assert
            results.TotalResults.Should().Be(numberOfItems + 1);
            results.TotalErrorResults.Should().Be(1);
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_EnsuresFacetsLoadedCorrectly()
        {
            // Arrange
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

            _resultsClient
                .SearchCalculationProviderResults(Arg.Any<SearchModel>())
                .Returns(new ApiResponse<CalculationProviderResultSearchResults>(HttpStatusCode.OK, itemResult));

            SearchRequestViewModel request = new SearchRequestViewModel();

            AndCalculationExistsForCalcId("calcId");

            // Act
            CalculationProviderResultSearchResultViewModel results = await _resultsSearchService.PerformSearch(request);

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
                .ProviderName
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



        CalculationProviderResultSearchResults GenerateSearchResults(int numberOfItems, IEnumerable<Facet> facets = null)
        {
            CalculationProviderResultSearchResults result = new CalculationProviderResultSearchResults();
            List<CalculationProviderResultSearchResult> items = new List<CalculationProviderResultSearchResult>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationProviderResultSearchResult
                {
                    Id = $"{i + 10}",
                    CalculationId = "calcId",
                    CalculationName = $"calc-{i + 1}",
                    ProviderName = $"prov-{i + 1}",
                    CalculationResult = i + 1,
                });
            }

            items.Add(new CalculationProviderResultSearchResult
            {
                Id = $"{numberOfItems + 10}",
                CalculationName = $"prov-{numberOfItems + 1}",
                CalculationId = "calcId",
                CalculationResult = numberOfItems + 1,
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
