// <copyright file="SpecificationSearchServiceTests.cs" company="Department for Education">
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
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using FluentAssertions;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class SpecificationSearchServiceTests
    {
        [TestMethod]
        public void PerformSearch_WhenFindSpecificationsServiceUnavailable_ThenHttpExceptionThrown()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

            specsClient
                .When(a => a.FindSpecifications(Arg.Any<SearchFilterRequest>()))
                .Do(x => { throw new HttpRequestException(); });

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            Action pageAction = new Action(() =>
            {
                SpecificationSearchResultViewModel result = SpecificationSearchService.PerformSearch(request).Result;
            });

            // Assert
            pageAction.Should().Throw<HttpRequestException>();
        }

        [TestMethod]
        public async Task PerformSearch_WhenFindSpecificationsServiceReturnsNotFound_ThenNullReturned()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

            PagedResult<SpecificationSearchResultItem> expectedServiceResult = null;

            specsClient
                .FindSpecifications(Arg.Any<SearchFilterRequest>())
                .Returns(expectedServiceResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            SpecificationSearchResultViewModel result = await SpecificationSearchService.PerformSearch(request);

            // Assert
            result.Should().BeNull();
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultReturnedCorrectly()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<SpecificationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            specsClient
                .FindSpecifications(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            SpecificationSearchResultViewModel results = await SpecificationSearchService.PerformSearch(request);

            // Assert
            SpecificationSearchResultItemViewModel first = results.Specifications.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.Name.Should().Be("Specification 1");
            first.Status.Should().Be("Draft");
            first.FundingPeriodName.Should().Be("Test Period");
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_ReturnedCorrectly()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

            int numberOfItems = 25;

            IEnumerable<SearchFacet> facets = new[]
            {
                new SearchFacet(), new SearchFacet()
            };

            PagedResult<SpecificationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems, facets);

            specsClient
                .FindSpecifications(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            SpecificationSearchResultViewModel results = await SpecificationSearchService.PerformSearch(request);

            // Assert
            SpecificationSearchResultItemViewModel first = results.Specifications.First();

            first
                .Should()
                .NotBeNull();

            first
                .Should()
                .BeEquivalentTo(new SpecificationSearchResultItemViewModel()
                {
                    Id = "10",
                    Name = "Specification 1",
                    FundingPeriodName = "Test Period",
                    FundingPeriodId = "FundingPeriodID",
                    Status = "Draft",
                    Description = "Description",
                    FundingStreamIds = new[] { "fs1", "fs2" },
                    FundingStreamNames = new[] { "Funding Stream 1", "Funding Stream 2" },
                    LastUpdatedDate = new DateTime(2018, 12, 5, 12, 5, 6),
                });

            results
                .Facets
                .Count()
                .Should()
                .Be(2);
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_EnsuresFacetsLoadedCorrectly()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

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

            PagedResult<SpecificationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems, facets);

            specsClient
                .FindSpecifications(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            SpecificationSearchResultViewModel results = await SpecificationSearchService.PerformSearch(request);

            // Assert
            SpecificationSearchResultItemViewModel first = results.Specifications.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.Name.Should().Be("Specification 1");
            first.Status.Should().Be("Draft");
            first.FundingPeriodName.Should().Be("Test Period");

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
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

            int numberOfItems = 0;

            PagedResult<SpecificationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            specsClient
                .FindSpecifications(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            SpecificationSearchResultViewModel results = await SpecificationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(0);
            results.EndItemNumber.Should().Be(0);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSinglePageOfItems()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<SpecificationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            specsClient
                .FindSpecifications(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            SpecificationSearchResultViewModel results = await SpecificationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(1);
            results.EndItemNumber.Should().Be(numberOfItems);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSecondPageOfItemsWithLessThanPageSize()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<SpecificationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);
            itemResult.PageNumber = 2;
            itemResult.PageSize = 50;
            itemResult.TotalItems = 75;

            specsClient
                .FindSpecifications(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
            };

            // Act
            SpecificationSearchResultViewModel results = await SpecificationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(75);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSecondPageOfItemsWithMorePagesAvailable()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ISpecificationSearchService SpecificationSearchService = new SpecificationSearchService(specsClient, mapper, logger);

            int numberOfItems = 50;

            PagedResult<SpecificationSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);
            itemResult.PageNumber = 2;
            itemResult.PageSize = 50;
            itemResult.TotalItems = 175;

            specsClient
                .FindSpecifications(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
            };

            // Act
            SpecificationSearchResultViewModel results = await SpecificationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(100);
        }

        private PagedResult<SpecificationSearchResultItem> GeneratePagedResult(int numberOfItems, IEnumerable<SearchFacet> facets = null)
        {
            PagedResult<SpecificationSearchResultItem> result = new PagedResult<SpecificationSearchResultItem>();
            List<SpecificationSearchResultItem> items = new List<SpecificationSearchResultItem>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new SpecificationSearchResultItem()
                {
                    Id = $"{i + 10}",
                    Name = $"Specification {i + 1}",
                    FundingPeriodName = "Test Period",
                    FundingPeriodId = "FundingPeriodID",
                    Status = "Draft",
                    Description = "Description",
                    FundingStreamIds = new[] { "fs1", "fs2" },
                    FundingStreamNames = new[] { "Funding Stream 1", "Funding Stream 2" },
                    LastUpdatedDate = new DateTime(2018, 12, 5, 12, 5, 6),
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
