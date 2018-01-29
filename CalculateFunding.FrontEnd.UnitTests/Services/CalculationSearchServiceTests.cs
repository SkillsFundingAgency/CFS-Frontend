﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Calculations;
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
                .When(a => a.FindCalculations(Arg.Any<CalculationSearchFilterRequest>()))
                .Do(x => { throw new HttpRequestException(); });

            CalculationSearchRequestViewModel request = new CalculationSearchRequestViewModel();


            // Act
            Action pageAction = new Action(() =>
            {
                CalculationSearchResultViewModel result = calculationSearchService.PerformSearch(request).Result;
            });

            // Assert
            pageAction.ShouldThrow<HttpRequestException>();
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
                .FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(expectedServiceResult);

            CalculationSearchRequestViewModel request = new CalculationSearchRequestViewModel();


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
                .FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(itemResult);

            CalculationSearchRequestViewModel request = new CalculationSearchRequestViewModel();

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            CalculationSearchResultItemViewModel first = results.Calculations.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.SpecificationName.Should().Be("Spec Name");
            first.Status.Should().Be("Unknown");
            first.PeriodName.Should().Be("Test Period");
            first.Name.Should().Be("Calculation 1");
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
                .FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(itemResult);

            CalculationSearchRequestViewModel request = new CalculationSearchRequestViewModel();

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
                .FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(itemResult);

            CalculationSearchRequestViewModel request = new CalculationSearchRequestViewModel();

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
                .FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(itemResult);

            CalculationSearchRequestViewModel request = new CalculationSearchRequestViewModel()
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
                .FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(itemResult);

            CalculationSearchRequestViewModel request = new CalculationSearchRequestViewModel()
            {
                PageNumber = 2,
            };

            // Act
            CalculationSearchResultViewModel results = await calculationSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(100);
        }

        private PagedResult<CalculationSearchResultItem> GeneratePagedResult(int numberOfItems)
        {
            PagedResult<CalculationSearchResultItem> result = new PagedResult<CalculationSearchResultItem>();
            List<CalculationSearchResultItem> items = new List<CalculationSearchResultItem>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new CalculationSearchResultItem()
                {
                    Id = $"{i + 10}",
                    Name = $"Calculation {i + 1}",
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
    }
}
