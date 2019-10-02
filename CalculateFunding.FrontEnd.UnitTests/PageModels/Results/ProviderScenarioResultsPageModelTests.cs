using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;

namespace CalculateFunding.Frontend.PageModels.Results
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Policies.Models;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.ApiClient.Providers.Models.Search;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.Pages.Results;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.TestEngine;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class ProviderScenarioResultsPageModelTests
    {
        [TestMethod]
        public void OnGetAsync_GivenNullProviderId_Returns_ArgumentNullExceptionThrown()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

            ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, specsApiClient: specsClient);

            // Act - Assert
            Assert.ThrowsExceptionAsync<ArgumentNullException>(async () => await providerScenarioResultsPageModel.OnGetAsync(null, 1, "", "1819", "1"));

        }

        [TestMethod]
        public void OnGetAsync_ReturnsErrorWhenFundingPeriodResponseIsNull()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();
            IProvidersApiClient providersApiClient = CreateProvidersApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            ISpecsApiClient specsClient = CreateSpecsApiClient();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

            ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, specsApiClient: specsClient, policiesApiClient: policiesApiClient);

            ProviderVersionSearchResult provider = CreateProvider();

            IEnumerable<FundingPeriod> fundingPeriods = null;

            providersApiClient.GetProviderByIdFromMaster(Arg.Any<string>())
                .Returns(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, provider));

            SearchRequestViewModel searchRequest = CreateSearchRequest();

            policiesApiClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            // Act
            Func<Task> test = async () => await providerScenarioResultsPageModel.OnGetAsync("2", 1, "", "1819", "1");

            // Assert
            test
               .Should()
               .ThrowExactly<System.InvalidOperationException>()
               .WithMessage("Unable to retreive Periods: Status Code = OK");
        }

        [TestMethod]
        public async Task OnGetAsync_ReturnsValidFundingPeriodAsync()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();
            IProvidersApiClient providersApiClient = CreateProvidersApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            ISpecsApiClient specsClient = CreateSpecsApiClient();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

            ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, providersApiClient, specsApiClient: specsClient, policiesApiClient: policiesApiClient);

            ProviderVersionSearchResult provider = CreateProvider();
            IEnumerable<FundingPeriod> fundingPeriods = GetExampleFundingPeriods();

            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            policiesApiClient.GetFundingPeriods()
               .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetSpecificationIdsForProvider("2")
               .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            providersApiClient.GetProviderByIdFromMaster(Arg.Any<string>())
                .Returns(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, provider));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, new List<SpecificationSummary>()));

            //Act
            IActionResult actionResult = await providerScenarioResultsPageModel.OnGetAsync("2", 1, "", "1819", "1");

            // Assert
            actionResult
                .Should()
                 .BeOfType<PageResult>();

            await policiesApiClient
                .Received(1)
                .GetFundingPeriods();
        }

        private static IEnumerable<FundingPeriod> GetExampleFundingPeriods()
        {
            return new[] {
                new FundingPeriod()
                {
                    Name = "2016-2017",
                    Id = "1617",
                },
                new FundingPeriod()
                {
                    Name = "2017-2018",
                    Id = "1718",
                },
                new FundingPeriod()
                {
                    Name = "2018-2019",
                    Id = "1819",
                },
            };
        }

        [TestMethod]
        public async Task OnGetAsync_WithNullProviderResultsReturned_ReturnsStatusCode500()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();
            IProvidersApiClient providersApiClient = CreateProvidersApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            ISpecsApiClient specsClient = CreateSpecsApiClient();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

            ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, specsApiClient: specsClient, policiesApiClient: policiesApiClient);

            ProviderVersionSearchResult provider = null;

            IEnumerable<FundingPeriod> fundingPeriods = GetExampleFundingPeriods();

            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            policiesApiClient.GetFundingPeriods()
               .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetSpecificationIdsForProvider("2")
               .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            providersApiClient.GetProviderByIdFromMaster(Arg.Any<string>())
                .Returns(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.NotFound, provider));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, new List<SpecificationSummary>()));

            //Act
            IActionResult actionResult = await providerScenarioResultsPageModel.OnGetAsync("2", 1, "", "1819", "1");

            // Assert
            actionResult
                .Should()
                 .BeOfType<StatusCodeResult>().Which.StatusCode.Should().Be(500);
        }

        [TestMethod]
        public async Task OnGetAsync_WithValidProviderResultsReturned_PopulatesProviderDetails()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();
            IProvidersApiClient providersApiClient = CreateProvidersApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

            ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, specsApiClient: specsClient, policiesApiClient: policiesApiClient, providersApiClient: providersApiClient);

            ProviderVersionSearchResult provider = CreateProvider();

            IEnumerable<FundingPeriod> fundingPeriods = GetExampleFundingPeriods();
            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            policiesApiClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetSpecificationIdsForProvider("2")
               .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            providersApiClient.GetProviderByIdFromMaster(Arg.Any<string>())
                .Returns(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, provider));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, new List<SpecificationSummary>()));

            //Act
            IActionResult actionResult = await providerScenarioResultsPageModel.OnGetAsync("2", 1, "", "1819", "1");

            // Assert
            actionResult
            .Should()
            .BeOfType<PageResult>();

            providerScenarioResultsPageModel.ProviderInfoModel.Should().NotBeNull();
            providerScenarioResultsPageModel.ProviderInfoModel.Upin.Should().Be(234234);
            providerScenarioResultsPageModel.ProviderInfoModel.Ukprn.Should().Be(345345);
            providerScenarioResultsPageModel.ProviderInfoModel.Urn.Should().Be(2234);
            providerScenarioResultsPageModel.ProviderInfoModel.ProviderType.Should().Be("Academy");

        }


        [TestMethod]
        public async Task OnGetAsync_WhenTestScenariosSearchResultsFound_ThenSuccessfullyShown()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();
            IProvidersApiClient providersApiClient = CreateProvidersApiClient();
            ISpecsApiClient specsClient = CreateSpecsApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

            ProviderVersionSearchResult provider = CreateProvider();

            IEnumerable<FundingPeriod> fundingPeriods = GetExampleFundingPeriods();
            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            policiesApiClient.GetFundingPeriods()
                          .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetSpecificationIdsForProvider(Arg.Any<string>())
               .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            providersApiClient.GetProviderByIdFromMaster(Arg.Any<string>())
                .Returns(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, provider));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, new List<SpecificationSummary>()));

            IList<TestScenarioSearchResultItemViewModel> testScenarioSearchResultItems = GetTestScenarioSearchResults();

            string specificationId = "2";

            TestScenarioSearchResultViewModel results = new TestScenarioSearchResultViewModel()
            {
                TestScenarios = testScenarioSearchResultItems,
                TotalResults = 2,
                CurrentPage = 1,
            };

            SearchRequestViewModel searchRequest = CreateSearchRequest();
            searchRequest.Filters["specificationId"][0] = specificationId;

            searchService.PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(results);

            ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, providersApiClient, specsApiClient: specsClient, policiesApiClient: policiesApiClient);

            //Act
            IActionResult actionResult = await providerScenarioResultsPageModel.OnGetAsync("1", 1, "", "1819", specificationId);

            // Assert
            actionResult
               .Should()
               .BeOfType<PageResult>();

            providerScenarioResultsPageModel.TestScenarioSearchResults.Should().NotBeNull();
            providerScenarioResultsPageModel.FundingPeriods.Count().Should().Be(3);

            await searchService.Received(1).PerformSearch(Arg.Is<SearchRequestViewModel>(r =>
               r.PageNumber == searchRequest.PageNumber &&
               r.IncludeFacets == searchRequest.IncludeFacets &&
               r.SearchTerm == searchRequest.SearchTerm &&
               r.Filters["providerId"][0] == searchRequest.Filters["providerId"][0] &&
               r.Filters["specificationId"][0] == searchRequest.Filters["specificationId"][0]
           ));
        }

        [TestMethod]
        public async Task OnGetAsync_WhenTestScenariosSearchResultsFoundThenTestCoverageIsCalculated_ThenSuccessfullyShown()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();
            IProvidersApiClient providersApiClient = CreateProvidersApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            ISpecsApiClient specsClient = CreateSpecsApiClient();

            ITestScenarioSearchService searchService = CreateTestScenarioSearchService();

            ProviderVersionSearchResult provider = CreateProvider();

            IEnumerable<FundingPeriod> fundingPeriods = GetExampleFundingPeriods();
            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            policiesApiClient.GetFundingPeriods()
                          .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetSpecificationIdsForProvider(Arg.Any<string>())
               .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            providersApiClient.GetProviderByIdFromMaster(Arg.Any<string>())
                .Returns(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, provider));

            IList<TestScenarioSearchResultItemViewModel> testScenarioSearchResultItems = GetTestScenarioSearchResults();
            TestScenarioSearchResultItemViewModel ignoredItem = new TestScenarioSearchResultItemViewModel()
            {
                Id = "3",
                LastUpdatedDate = new DateTime(12, 01, 23),
                ProviderId = "1",
                ProviderName = "Provider 1",
                SpecificationId = "2",
                SpecificationName = "Spec 02",
                TestResult = "Ignored",
                TestScenarioId = "2",
                TestScenarioName = "Test Scenario 02",
                LastUpdatedDateDisplay = "1",
            };

            testScenarioSearchResultItems.Add(ignoredItem);

            TestScenarioSearchResultItemViewModel failedItem = new TestScenarioSearchResultItemViewModel()
            {
                Id = "4",
                LastUpdatedDate = new DateTime(12, 01, 23),
                ProviderId = "1",
                ProviderName = "Provider 1",
                SpecificationId = "2",
                SpecificationName = "Spec 02",
                TestResult = "Failed",
                TestScenarioId = "2",
                TestScenarioName = "Test Scenario 02",
                LastUpdatedDateDisplay = "1",
            };

            testScenarioSearchResultItems.Add(failedItem);

            string specificationId = "2";

            TestScenarioSearchResultViewModel results = new TestScenarioSearchResultViewModel()
            {
                TestScenarios = testScenarioSearchResultItems,
                TotalResults = 4,
                CurrentPage = 1,
            };

            SearchRequestViewModel searchRequest = CreateSearchRequest();
            searchRequest.Filters["specificationId"][0] = specificationId;

            searchService.PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(results);

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, new List<SpecificationSummary>()));

            ProviderScenarioResultsPageModel providerScenarioResultsPageModel = CreatePageModel(searchService, resultsApiClient, providersApiClient, specsApiClient: specsClient, policiesApiClient: policiesApiClient);

            //Act
            IActionResult actionResult = await providerScenarioResultsPageModel.OnGetAsync("1", 1, "", "1819", specificationId);

            // Assert
            actionResult
               .Should()
               .BeOfType<PageResult>();

            providerScenarioResultsPageModel.Passed.Should().Be(2);
            providerScenarioResultsPageModel.Failed.Should().Be(1);
            providerScenarioResultsPageModel.Ignored.Should().Be(1);
            providerScenarioResultsPageModel.TestCoverage.Should().Be(75);
        }

        private ProviderVersionSearchResult CreateProvider()
        {
            return new ProviderVersionSearchResult()
            {
                ProviderType = "Academy",
                ProviderSubType = "Academy",
                Authority = "LA",
                UPIN = "234234",
                UKPRN = "345345",
                URN = "2234",
                DateOpened = new DateTime(12, 01, 23),
                Id = "1",
                Name = "Test school"
            };
        }

        private SearchRequestViewModel CreateSearchRequest()
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = 1,
                IncludeFacets = false,
                SearchTerm = "",
                Filters = new Dictionary<string, string[]> {
                                                            { "providerId", new[] { "1" } },
                                                            { "specificationId", new[]{"1" } }
                                                           }
            };

            return searchRequest;
        }

        private IList<TestScenarioSearchResultItemViewModel> GetTestScenarioSearchResults()
        {
            TestScenarioSearchResultItemViewModel testScen1 = new TestScenarioSearchResultItemViewModel()
            {
                Id = "1",
                LastUpdatedDate = new DateTime(12, 01, 23),
                ProviderId = "1",
                ProviderName = "Provider 1",
                SpecificationId = "1",
                SpecificationName = "Spec 01",
                TestResult = "Passed",
                TestScenarioId = "1",
                TestScenarioName = "Test Scenario 01",
                LastUpdatedDateDisplay = "1",
            };
            TestScenarioSearchResultItemViewModel testScen2 = new TestScenarioSearchResultItemViewModel()
            {
                Id = "2",
                LastUpdatedDate = new DateTime(12, 01, 23),
                ProviderId = "1",
                ProviderName = "Provider 1",
                SpecificationId = "2",
                SpecificationName = "Spec 02",
                TestResult = "Passed",
                TestScenarioId = "2",
                TestScenarioName = "Test Scenario 02",
                LastUpdatedDateDisplay = "1",
            };

            IList<TestScenarioSearchResultItemViewModel> TestScenarioResults = new List<TestScenarioSearchResultItemViewModel>
            {
                testScen1,
                testScen2
            };

            return TestScenarioResults;
        }

        private IEnumerable<string> GetSpecificationsWithResults()
        {
            return new List<string>()
            {
                "1",
                "2",
            };
        }

        private static IResultsApiClient CreateApiClient()
        {
            return Substitute.For<IResultsApiClient>();
        }

        private static IProvidersApiClient CreateProvidersApiClient()
        {
            return Substitute.For<IProvidersApiClient>();
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IPoliciesApiClient CreatePoliciesApiClient()
        {
            return Substitute.For<IPoliciesApiClient>();
        }

        private static IMapper CreateMapper()
        {
            return MappingHelper.CreateFrontEndMapper();
        }

        private static ITestScenarioSearchService CreateTestScenarioSearchService()
        {
            return Substitute.For<ITestScenarioSearchService>();
        }

        private static ProviderScenarioResultsPageModel CreatePageModel(
                ITestScenarioSearchService testScenarioSearchService = null,
                IResultsApiClient resultsApiClient = null,
                IProvidersApiClient providersApiClient = null,
                ISpecsApiClient specsApiClient = null,
                IPoliciesApiClient policiesApiClient = null,
                IMapper mapper = null,
                ILogger logger = null)
        {
            return new ProviderScenarioResultsPageModel(
                testScenarioSearchService ?? CreateTestScenarioSearchService(),
            resultsApiClient ?? CreateApiClient(),
            providersApiClient ?? CreateProvidersApiClient(),
            mapper ?? CreateMapper(),
            specsApiClient ?? CreateSpecsApiClient(),
            policiesApiClient ?? CreatePoliciesApiClient(),
            logger ?? CreateLogger());
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

    }
}
