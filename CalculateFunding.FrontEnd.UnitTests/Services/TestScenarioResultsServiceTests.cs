using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using CalculateFunding.Frontend.ViewModels.Scenarios;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class TestScenarioResultsServiceTests
    {
        [TestMethod]
        public async Task TestScenarioResultsService_PerformSearch_WhenTestScenariosExist_ThenResultsAreReturned()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient);

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = null,
            };

            ScenarioSearchResultViewModel scenarioSearchResultViewModel = new ScenarioSearchResultViewModel()
            {
                CurrentPage = 1,
                TotalResults = 1,
                StartItemNumber = 1,
                EndItemNumber = 1,
                Scenarios = new List<ScenarioSearchResultItemViewModel>()
                {
                    new ScenarioSearchResultItemViewModel()
                    {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        FundingPeriodName = "2018/2019",
                        Status = "Passed",
                        SpecificationName = "Specifcation 1",
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                    }
                }
            };

            searchService.PerformSearch(Arg.Is<SearchRequestViewModel>(s => s.SearchTerm == resultRequestViewModel.SearchTerm))
                .Returns(scenarioSearchResultViewModel);

            List<SpecificationSummary> specifications = CreateSpecifications();

            specsApiClient
                .GetSpecificationSummaries()
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specifications.AsEnumerable()));

            List<TestScenarioResultCounts> testScenarioResultCounts = new List<TestScenarioResultCounts>();
            testScenarioResultCounts.Add(new TestScenarioResultCounts()
            {
                Passed = 5,
                Failed = 10,
                Ignored = 50,
                LastUpdatedDate = new DateTime(2018, 10, 5, 7, 8, 9),
                TestScenarioId = "ts1",
                TestScenarioName = "Test Scenario 1",
            });

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, testScenarioResultCounts));

            // Act
            TestScenarioResultViewModel resultViewModel = await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            resultViewModel.Should().NotBeNull();

            TestScenarioResultViewModel expectedResult = new TestScenarioResultViewModel()
            {
                CurrentPage = 1,
                EndItemNumber = 1,
                Facets = new List<SearchFacetViewModel>(),
                FundingPeriodId = null,
                Specifications = new List<ReferenceViewModel>()
                {
                    new ReferenceViewModel("spec1", "Specification 1"),
                    new ReferenceViewModel("spec2", "Specification 2"),
                    new ReferenceViewModel("spec3", "Specification for 2018/2019"),

                },
                StartItemNumber = 1,
                TotalResults = 1,
                TestResults = new List<TestScenarioResultItemViewModel>()
                 {
                     new TestScenarioResultItemViewModel()
                     {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        Passes = 5,
                        Failures = 10,
                        Ignored = 50,
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                     }
                 }
            };

            resultViewModel.Should().BeEquivalentTo(expectedResult);

            await specsApiClient
                 .Received(1)
                .GetSpecificationSummaries();
        }

        [TestMethod]
        public async Task TestScenarioResultsService_PerformSearch_WhenTestScenariosExistAndSpecificationIdProvided_ThenResultsAreReturned()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();

            string specificationId = "spec1";

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient);

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = specificationId,
            };

            ScenarioSearchResultViewModel scenarioSearchResultViewModel = new ScenarioSearchResultViewModel()
            {
                CurrentPage = 1,
                TotalResults = 1,
                StartItemNumber = 1,
                EndItemNumber = 1,
                Scenarios = new List<ScenarioSearchResultItemViewModel>()
                {
                    new ScenarioSearchResultItemViewModel()
                    {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        FundingPeriodName = "2018/2019",
                        Status = "Passed",
                        SpecificationName = "Specifcation 1",
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                    }
                }
            };

            searchService.PerformSearch(Arg.Is<SearchRequestViewModel>(s => s.SearchTerm == resultRequestViewModel.SearchTerm))
                .Returns(scenarioSearchResultViewModel);

            List<SpecificationSummary> specifications = CreateSpecifications();

            specsApiClient
                .GetSpecificationSummaries()
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specifications.AsEnumerable()));

            List<TestScenarioResultCounts> testScenarioResultCounts = new List<TestScenarioResultCounts>();
            testScenarioResultCounts.Add(new TestScenarioResultCounts()
            {
                Passed = 5,
                Failed = 10,
                Ignored = 50,
                LastUpdatedDate = new DateTime(2018, 10, 5, 7, 8, 9),
                TestScenarioId = "ts1",
                TestScenarioName = "Test Scenario 1",
            });

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, testScenarioResultCounts));

            // Act
            TestScenarioResultViewModel resultViewModel = await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            resultViewModel.Should().NotBeNull();

            TestScenarioResultViewModel expectedResult = new TestScenarioResultViewModel()
            {
                CurrentPage = 1,
                EndItemNumber = 1,
                Facets = new List<SearchFacetViewModel>(),
                FundingPeriodId = null,
                Specifications = new List<ReferenceViewModel>()
                {
                    new ReferenceViewModel("spec1", "Specification 1"),
                    new ReferenceViewModel("spec2", "Specification 2"),
                    new ReferenceViewModel("spec3", "Specification for 2018/2019"),

                },
                StartItemNumber = 1,
                TotalResults = 1,
                TestResults = new List<TestScenarioResultItemViewModel>()
                 {
                     new TestScenarioResultItemViewModel()
                     {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        Passes = 5,
                        Failures = 10,
                        Ignored = 50,
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                     }
                 }
            };

            resultViewModel.Should().BeEquivalentTo(expectedResult);

            await searchService
                 .Received(1)
                 .PerformSearch(Arg.Is<SearchRequestViewModel>(a => a.Filters["specificationId"][0] == specificationId));
        }

        [TestMethod]
        public async Task TestScenarioResultsService_PerformSearch_WhenTestScenariosExistAndValidPeriodIdProvided_ThenResultsAreReturned()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();

            string periodId = "1819";

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient);

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = periodId,
                SpecificationId = null,
            };

            ScenarioSearchResultViewModel scenarioSearchResultViewModel = new ScenarioSearchResultViewModel()
            {
                CurrentPage = 1,
                TotalResults = 1,
                StartItemNumber = 1,
                EndItemNumber = 1,
                Scenarios = new List<ScenarioSearchResultItemViewModel>()
                {
                    new ScenarioSearchResultItemViewModel()
                    {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        FundingPeriodName = "2018/2019",
                        Status = "Passed",
                        SpecificationName = "Specifcation 1",
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                    }
                }
            };

            searchService.PerformSearch(Arg.Is<SearchRequestViewModel>(s => s.SearchTerm == resultRequestViewModel.SearchTerm))
                .Returns(scenarioSearchResultViewModel);

            List<SpecificationSummary> specifications = CreateSpecifications();

            specsApiClient
                .GetSpecifications(Arg.Is(periodId))
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specifications.AsEnumerable()));

            List<TestScenarioResultCounts> testScenarioResultCounts = new List<TestScenarioResultCounts>();
            testScenarioResultCounts.Add(new TestScenarioResultCounts()
            {
                Passed = 5,
                Failed = 10,
                Ignored = 50,
                LastUpdatedDate = new DateTime(2018, 10, 5, 7, 8, 9),
                TestScenarioId = "ts1",
                TestScenarioName = "Test Scenario 1",
            });

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, testScenarioResultCounts));

            // Act
            TestScenarioResultViewModel resultViewModel = await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            resultViewModel.Should().NotBeNull();

            TestScenarioResultViewModel expectedResult = new TestScenarioResultViewModel()
            {
                CurrentPage = 1,
                EndItemNumber = 1,
                Facets = new List<SearchFacetViewModel>(),
                FundingPeriodId = null,
                Specifications = new List<ReferenceViewModel>()
                {
                    new ReferenceViewModel("spec1", "Specification 1"),
                    new ReferenceViewModel("spec2", "Specification 2"),
                    new ReferenceViewModel("spec3", "Specification for 2018/2019"),

                },
                StartItemNumber = 1,
                TotalResults = 1,
                TestResults = new List<TestScenarioResultItemViewModel>()
                 {
                     new TestScenarioResultItemViewModel()
                     {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        Passes = 5,
                        Failures = 10,
                        Ignored = 50,
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                     }
                 }
            };

            resultViewModel.Should().BeEquivalentTo(expectedResult);

            await searchService
                 .Received(1)
                 .PerformSearch(Arg.Is<SearchRequestViewModel>(a => a.Filters["fundingPeriodId"][0] == periodId));

            await specsApiClient
                .Received(1)
                .GetSpecifications(periodId);
        }

        [TestMethod]
        public void TestScenarioResultsService_PerformSearch_WhenTestScenariosSearchResultsIsNull_ThenExceptionThrown()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();
            ILogger logger = CreateLogger();

            string specificationId = "spec1";

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient, logger: logger);

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = specificationId,
            };

            ScenarioSearchResultViewModel scenarioSearchResultViewModel = null;

            searchService.PerformSearch(Arg.Is<SearchRequestViewModel>(s => s.SearchTerm == resultRequestViewModel.SearchTerm))
                .Returns(scenarioSearchResultViewModel);

            List<SpecificationSummary> specifications = CreateSpecifications();

            specsApiClient
                .GetSpecificationSummaries()
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specifications.AsEnumerable()));

            // Act
            Func<Task> action = async () => await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            action.
                Should()
                .ThrowExactly<InvalidOperationException>()
                .WithMessage("Scenario Search Results response was null");

            logger
                .Received(1)
                .Warning(Arg.Is<string>("Scenario Search Results response was null"));
        }

        [TestMethod]
        public async Task TestScenarioResultsService_PerformSearch_WhenGetAllSpecificationsLookupIsNull_ThenExceptionThrown()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();
            ILogger logger = CreateLogger();

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = null,
            };

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient, logger: logger);

            searchService.PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(new ScenarioSearchResultViewModel());

            List<SpecificationSummary> specifications = CreateSpecifications();

            specsApiClient
                .GetSpecificationSummaries()
                .Returns((ApiResponse<IEnumerable<SpecificationSummary>>)null);

            // Act
            Func<Task> action = async () => await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            action.
                Should()
                .ThrowExactly<InvalidOperationException>()
                .WithMessage("Specifications API Response was null");

            logger
                .Received(1)
                .Warning(Arg.Is("Specifications API Response was null"));

            await specsApiClient
                 .Received(1)
                .GetSpecificationSummaries();
        }

        [TestMethod]
        public void TestScenarioResultsService_PerformSearch_WhenGetAllSpecificationsLookupResponseIsNotOk_ThenExceptionThrown()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();
            ILogger logger = CreateLogger();

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = null,
            };

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient, logger: logger);

            searchService.PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(new ScenarioSearchResultViewModel());

            specsApiClient
                .GetSpecificationSummaries()
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.InternalServerError, null));

            // Act
            Func<Task> action = async () => await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            action.
                Should()
                .ThrowExactly<InvalidOperationException>()
                .WithMessage("Specifications API Response content did not return OK, but instead 'InternalServerError'");

            logger
                .Received(1)
                .Warning(Arg.Is("Specifications API Response content did not return OK, but instead {specificationsApiResponse.StatusCode}"), Arg.Is(HttpStatusCode.InternalServerError));
        }

        [TestMethod]
        public void TestScenarioResultsService_PerformSearch_WhenRowCountsApiCallReturnsNull_ThenExceptionThrown()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();
            ILogger logger = CreateLogger();

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = null,
            };

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient, logger: logger);

            searchService.PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(new ScenarioSearchResultViewModel()
                {
                    Scenarios = new List<ScenarioSearchResultItemViewModel>()
                    {
                        new ScenarioSearchResultItemViewModel()
                        {
                             Id= "s1",
                             Name = "S1",
                        },
                        new ScenarioSearchResultItemViewModel()
                        {
                             Id= "s2",
                             Name = "S2",
                        },
                    }
                });

            List<SpecificationSummary> specifications = CreateSpecifications();

            specsApiClient
                .GetSpecificationSummaries()
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specifications));

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns((ApiResponse<IEnumerable<TestScenarioResultCounts>>)null);

            // Act
            Func<Task> action = async () => await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            action.
                Should()
                .ThrowExactly<InvalidOperationException>()
                .WithMessage("Row counts api request failed with null response");

            logger
                .Received(1)
                .Warning(Arg.Is("Row counts api request failed with null response"));
        }

        [TestMethod]
        public void TestScenarioResultsService_PerformSearch_WhenRowCountsApiCallDoesNotReturnOk_ThenExceptionThrown()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();
            ILogger logger = CreateLogger();

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = null,
            };

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient, logger: logger);

            searchService.PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(new ScenarioSearchResultViewModel()
                {
                    Scenarios = new List<ScenarioSearchResultItemViewModel>()
                    {
                        new ScenarioSearchResultItemViewModel()
                        {
                             Id= "s1",
                             Name = "S1",
                        },
                        new ScenarioSearchResultItemViewModel()
                        {
                             Id= "s2",
                             Name = "S2",
                        },
                    }
                });

            List<SpecificationSummary> specifications = CreateSpecifications();

            specsApiClient
                .GetSpecificationSummaries()
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specifications));

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.InternalServerError, null));

            // Act
            Func<Task> action = async () => await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            action.
                Should()
                .ThrowExactly<InvalidOperationException>()
                .WithMessage("Row counts api request failed with status code: InternalServerError");

            logger
                .Received(1)
                .Warning(Arg.Is("Row counts api request failed with status code: {rowCounts.StatusCode}"), Arg.Is(HttpStatusCode.InternalServerError));
        }

        [TestMethod]
        public void TestScenarioResultsService_PerformSearch_WhenGetAllSpecificationsLookupContentIsNull_ThenExceptionThrown()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();
            ILogger logger = CreateLogger();

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = null,
            };

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient, logger: logger);

            searchService.PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(new ScenarioSearchResultViewModel());

            specsApiClient
                .GetSpecificationSummaries()
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, null));

            // Act
            Func<Task> action = async () => await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            action.
                Should()
                .ThrowExactly<InvalidOperationException>()
                .WithMessage("Specifications API Response content was null");

            logger
                .Received(1)
                .Warning(Arg.Is("Specifications API Response content was null"));
        }

        [TestMethod]
        public void TestScenarioResultsService_PerformSearch_WhenRowCountsApiCallContentIsNull_ThenExceptionThrown()
        {
            // Arrange
            IScenarioSearchService searchService = CreateScenarioSearchService();
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            ITestEngineApiClient testEngineApiClient = CreateTestEngineApiClient();
            ILogger logger = CreateLogger();

            TestScenarioResultRequestViewModel resultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                SearchTerm = "",
                PageNumber = 1,
                FundingPeriodId = null,
                SpecificationId = null,
            };

            TestScenarioResultsService testScenarioResultsService = CreateService(searchService, specsApiClient, testEngineApiClient, logger: logger);

            searchService.PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(new ScenarioSearchResultViewModel()
                {
                    Scenarios = new List<ScenarioSearchResultItemViewModel>()
                    {
                        new ScenarioSearchResultItemViewModel()
                        {
                             Id= "s1",
                             Name = "S1",
                        },
                        new ScenarioSearchResultItemViewModel()
                        {
                             Id= "s2",
                             Name = "S2",
                        },
                    }
                });

            List<SpecificationSummary> specifications = CreateSpecifications();

            specsApiClient
                .GetSpecificationSummaries()
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specifications));

            testEngineApiClient
                .GetTestResultCounts(Arg.Any<TestScenarioResultCountsRequestModel>())
                .Returns(new ApiResponse<IEnumerable<TestScenarioResultCounts>>(HttpStatusCode.OK, null));

            // Act
            Func<Task> action = async () => await testScenarioResultsService.PerformSearch(resultRequestViewModel);

            // Assert
            action.
                Should()
                .ThrowExactly<InvalidOperationException>()
                .WithMessage("Row counts api request failed with null content");

            logger
                .Received(1)
                .Warning(Arg.Is("Row counts api request failed with null content"));
        }

        private static TestScenarioResultsService CreateService(
            IScenarioSearchService scenarioSearchService = null,
            ISpecsApiClient specsApiClient = null,
            ITestEngineApiClient testEngineApiClient = null,
            IMapper mapper = null,
            ILogger logger = null
            )
        {
            return new TestScenarioResultsService(
                scenarioSearchService ?? CreateScenarioSearchService(),
                 specsApiClient ?? CreateSpecsApiClient(),
                 testEngineApiClient ?? CreateTestEngineApiClient(),
                 mapper ?? MappingHelper.CreateFrontEndMapper(),
                 logger ?? CreateLogger()
                );
        }

        private static IScenarioSearchService CreateScenarioSearchService()
        {
            return Substitute.For<IScenarioSearchService>();
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static ITestEngineApiClient CreateTestEngineApiClient()
        {
            return Substitute.For<ITestEngineApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

        private static List<SpecificationSummary> CreateSpecifications()
        {
            List<SpecificationSummary> specifications = new List<SpecificationSummary>();
            specifications.Add(new SpecificationSummary()
            {
                Id = "spec1",
                Name = "Specification 1",
                FundingPeriod = new Reference("1718", "2017/2018"),
            });

            specifications.Add(new SpecificationSummary()
            {
                Id = "spec2",
                Name = "Specification 2",
                FundingPeriod = new Reference("1718", "2017/2018"),
            });

            specifications.Add(new SpecificationSummary()
            {
                Id = "spec3",
                Name = "Specification for 2018/2019",
                FundingPeriod = new Reference("1819", "2018/2019"),
            });


            return specifications;
        }
    }
}
