using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Calcs;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Calculations;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    [TestClass]
    public class CalcsIndexPageModelTests
    {
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

            calcsClient.FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(zeroItemResult);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);
            // Act
            IActionResult result = await pageModel.OnGet(null, null, null);

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
                .When(a => a.FindCalculations(Arg.Any<CalculationSearchFilterRequest>()))
                .Do(x => { throw new HttpRequestException(); });

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            Action pageAction = new Action(() =>
            {
                IActionResult result = pageModel.OnGet(null, null, null).Result;
            });

            // Assert
            pageAction.ShouldThrow<HttpRequestException>();
        }

        [TestMethod]
        public async Task OnGet_WhenFindCalculationsServiceReturnsNull_ThenServerErrorResponseIsReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ICalculationSearchService calculationSearchService = Substitute.For<ICalculationSearchService>();
           
            calculationSearchService
                .PerformSearch(Arg.Any<CalculationSearchRequestViewModel>())
                .Returns((CalculationSearchResultViewModel)null);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGet(null, null, null);


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
                .FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(itemResult);

            calcsClient
                .GetCalculationById(expectedDraftCalculation.Id)
                .Returns(calculationResponse);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGet(null, draftCalculationId, null);

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
                .FindCalculations(Arg.Any<CalculationSearchFilterRequest>())
                .Returns(itemResult);

            calcsClient
                .GetCalculationById(expectedPublishedCalculation.Id)
                .Returns(calculationResponse);

            IndexPageModel pageModel = new IndexPageModel(calcsClient, calculationSearchService);

            // Act
            IActionResult result = await pageModel.OnGet(null, null, publishedCalculationId);

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
    }
}
