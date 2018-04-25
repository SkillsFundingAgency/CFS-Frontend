namespace CalculateFunding.Frontend.PageModels.Results
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.Pages.Results;
    using CalculateFunding.Frontend.ViewModels.Common;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;
    using System;
    using System.Collections.Generic;

    [TestClass]
    public class ProviderScenarioResultsPageModelTests
    {
        [TestMethod]
        public void OnGetAsync_GivenNullProviderId_Returns_ArgumentNullExceptionThrown()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = Substitute.For<ILogger>();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

            ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, specsClient, mapper, logger);

            // Act - Assert
            Assert.ThrowsExceptionAsync<ArgumentNullException>(async () => await providerScenarioResultsPageModel.OnGetAsync(null, 1, "", "1819", "1" ));

        }


        //[TestMethod]
        //public void OnGetAsync_ReturnsErrorWhenAcademicYearResponseIsNull()
        //{
        //    // Arrange
        //    IResultsApiClient resultsApiClient = CreateApiClient();

        //    ISpecsApiClient specsClient = CreateSpecsApiClient();

        //    IMapper mapper = CreateMapper();

        //    ILogger logger = CreateLogger();

        //    ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

        //    ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, specsClient, mapper, logger);

        //    Provider provider = CreateProvider();

        //    IEnumerable<Reference> academicYears = null;

        //    resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
        //        .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

        //    SearchRequestViewModel searchRequest = CreateSearchRequest();

        //    //TestScenarioSearchResultViewModel TestScenarioSearchResults = 

        //    var academicyears = specsClient.GetAcademicYears()
        //        .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.NotFound, academicYears));

        //    //resultsApiClient.get(Arg.Is("2"), Arg.Is("2"))
        //    //   .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.OK, TestScenarioSearchResults));


        //    // Act

        //    Func<Task> test = async () => await  providerScenarioResultsPageModel.OnGetAsync("2", 1, "", "1819", "1");

        //    // Assert
        //    test
        //       .Should()
        //       .ThrowExactly<System.InvalidOperationException>().WithMessage("Unable to retreive Periods: Status Code = NotFound");
        //}





        private Provider CreateProvider()
        {
            return new Provider()
            {
                ProviderType = "Academy",
                ProviderSubtype = "Academy",
                LocalAuthority = "LA",
                UPIN = 234234,
                UKPRN = 345345,
                URN = 2234,
                DateOpened = new DateTime(12, 01, 23),
                Id = "2",
                Name = "Test school"
            };
        }

        private SearchRequestViewModel  CreateSearchRequest()
        {
           // return Substitute.For<SearchRequestViewModel>();          
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = 1,
                IncludeFacets = false,
                SearchTerm = "",
                Filters = new Dictionary<string, string[]> { { "providerId", new[] { "2" } },
                                                             {"specificationId", new[]{"2" } }
                                                           }
            };

            return searchRequest;          
        }

        private static IResultsApiClient CreateApiClient()
        {
            return Substitute.For<IResultsApiClient>();
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IMapper CreateMapper()
        {
            return MappingHelper.CreateFrontEndMapper();
        }

        private static ITestScenarioSearchService CreateTestScenarioSearchService()
        {
            return Substitute.For<ITestScenarioSearchService>();
        }

        private static ProviderScenarioResultsPageModel CreatePageModel(ITestScenarioSearchService testScenarioSearchService, IResultsApiClient resultsApiClient, ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger)
        {
            return new ProviderScenarioResultsPageModel(testScenarioSearchService, resultsApiClient, mapper, specsApiClient,  logger);
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

    }
}
