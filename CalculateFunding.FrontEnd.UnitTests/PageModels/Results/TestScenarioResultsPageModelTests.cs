using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.Pages.Results;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Results
{
    [TestClass]
    public class TestScenarioResultsPageModelTests
    {
        [TestMethod]
        public async Task TestScenarioResults_OnGetAsync_WhenRequestedWithDefaultOptions_ThenPageIsReturned()
        {
            // Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            ITestScenarioResultsService testScenarioResultsService = CreateScenarioResultsService();

            List<FundingPeriod> fundingPeriods = new List<FundingPeriod>
            {
                new FundingPeriod{ Id ="1617", Name = "2016/2017" },
                new FundingPeriod{ Id ="1718", Name = "2017/2018" },
                new FundingPeriod{ Id ="1819", Name = "2018/2019" }
            };

            TestScenarioResultsPageModel pageModel = CreatePageModel(testScenarioResultsService, policiesApiClient);

            policiesApiClient
                 .GetFundingPeriods()
                 .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            TestScenarioResultViewModel testScenarioResultViewModel = new TestScenarioResultViewModel()
            {
                Specifications = new List<ReferenceViewModel>()
                 {
                     new ReferenceViewModel("spec1", "Specification 1"),
                     new ReferenceViewModel("spec2", "Specification 2"),
                     new ReferenceViewModel("spec3", "Specification 3"),
                 },
                TestResults = new List<TestScenarioResultItemViewModel>()
                  {
                       new TestScenarioResultItemViewModel()
                     {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        Passes = 5,
                        Failures = 10,
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                     },
                  }
            };

            testScenarioResultsService
                .PerformSearch(Arg.Any<TestScenarioResultRequestViewModel>())
                .Returns(testScenarioResultViewModel);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null, null, null);

            // Assert
            result
                .Should()
                .NotBeNull()
                .And
                .BeOfType<PageResult>();

            pageModel
                .FundingPeriods
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                         Text = "2016/2017",
                         Value = "1617",
                    },
                    new SelectListItem()
                    {
                         Text = "2017/2018",
                         Value = "1718",
                    },
                    new SelectListItem()
                    {
                         Text = "2018/2019",
                         Value = "1819",
                    },
                });

            pageModel.SearchResults.Should().NotBeNull();

            pageModel
                .SearchResults
                .Should()
                .BeEquivalentTo(testScenarioResultViewModel);
        }

        [TestMethod]
        public async Task TestScenarioResults_OnGetAsync_WhenRequestedWithSecondPage_ThenPageIsReturned()
        {
            // Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            ITestScenarioResultsService testScenarioResultsService = CreateScenarioResultsService();

            List<FundingPeriod> fundingPeriods = new List<FundingPeriod>
            {
                new FundingPeriod{ Id ="1617", Name = "2016/2017" },
                new FundingPeriod{ Id ="1718", Name = "2017/2018" },
                new FundingPeriod{ Id ="1819", Name = "2018/2019" }
            };

            TestScenarioResultsPageModel pageModel = CreatePageModel(testScenarioResultsService, policiesApiClient);

            policiesApiClient
                 .GetFundingPeriods()
                 .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            TestScenarioResultViewModel testScenarioResultViewModel = new TestScenarioResultViewModel()
            {
                Specifications = new List<ReferenceViewModel>()
                 {
                     new ReferenceViewModel("spec1", "Specification 1"),
                     new ReferenceViewModel("spec2", "Specification 2"),
                     new ReferenceViewModel("spec3", "Specification 3"),
                 },
                TestResults = new List<TestScenarioResultItemViewModel>()
                  {
                       new TestScenarioResultItemViewModel()
                     {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        Passes = 5,
                        Failures = 10,
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                     },
                  }
            };

            testScenarioResultsService
                .PerformSearch(Arg.Is<TestScenarioResultRequestViewModel>(c => c.PageNumber == 2))
                .Returns(testScenarioResultViewModel);

            // Act
            IActionResult result = await pageModel.OnGetAsync(2, null, null, null);

            // Assert
            result
                .Should()
                .NotBeNull()
                .And
                .BeOfType<PageResult>();

            pageModel
                .FundingPeriods
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                         Text = "2016/2017",
                         Value = "1617",
                    },
                    new SelectListItem()
                    {
                         Text = "2017/2018",
                         Value = "1718",
                    },
                    new SelectListItem()
                    {
                         Text = "2018/2019",
                         Value = "1819",
                    },
                });

            pageModel.SearchResults.Should().NotBeNull();

            pageModel
                .SearchResults
                .Should()
                .BeEquivalentTo(testScenarioResultViewModel);
        }

        [TestMethod]
        public async Task TestScenarioResults_OnGetAsync_WhenRequestedWithSearchTerm_ThenPageIsReturned()
        {
            // Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            ITestScenarioResultsService testScenarioResultsService = CreateScenarioResultsService();

            string searchTerm = "searchTerm";

            List<FundingPeriod> fundingPeriods = new List<FundingPeriod>
            {
                new FundingPeriod{ Id ="1617", Name = "2016/2017" },
                new FundingPeriod{ Id ="1718", Name = "2017/2018" },
                new FundingPeriod{ Id ="1819", Name = "2018/2019" }
            };

            TestScenarioResultsPageModel pageModel = CreatePageModel(testScenarioResultsService, policiesApiClient);

            policiesApiClient
                 .GetFundingPeriods()
                 .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            TestScenarioResultViewModel testScenarioResultViewModel = new TestScenarioResultViewModel()
            {
                Specifications = new List<ReferenceViewModel>()
                 {
                     new ReferenceViewModel("spec1", "Specification 1"),
                     new ReferenceViewModel("spec2", "Specification 2"),
                     new ReferenceViewModel("spec3", "Specification 3"),
                 },
                TestResults = new List<TestScenarioResultItemViewModel>()
                  {
                       new TestScenarioResultItemViewModel()
                     {
                        Id = "ts1",
                        Name ="Test Scenario 1",
                        Passes = 5,
                        Failures = 10,
                        LastUpdatedDate = new DateTime(2018, 1, 5, 7, 8, 9),
                     },
                  }
            };

            testScenarioResultsService
                .PerformSearch(Arg.Any<TestScenarioResultRequestViewModel>())
                .Returns(testScenarioResultViewModel);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, searchTerm, null, null);

            // Assert
            result
                .Should()
                .NotBeNull()
                .And
                .BeOfType<PageResult>();

            pageModel
                .FundingPeriods
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                         Text = "2016/2017",
                         Value = "1617",
                    },
                    new SelectListItem()
                    {
                         Text = "2017/2018",
                         Value = "1718",
                    },
                    new SelectListItem()
                    {
                         Text = "2018/2019",
                         Value = "1819",
                    },
                });

            pageModel.SearchResults.Should().NotBeNull();

            pageModel
                .SearchResults
                .Should()
                .BeEquivalentTo(testScenarioResultViewModel);

            await testScenarioResultsService
                .Received(1)
                .PerformSearch(Arg.Is<TestScenarioResultRequestViewModel>(c => c.SearchTerm == searchTerm));
        }

        private static TestScenarioResultsPageModel CreatePageModel(
            ITestScenarioResultsService resultsService = null,
            IPoliciesApiClient policiesApiClient = null)
        {
            return new TestScenarioResultsPageModel(
                resultsService ?? CreateScenarioResultsService(),
                policiesApiClient ?? CreatePoliciesApiClient());
        }

        private static ITestScenarioResultsService CreateScenarioResultsService()
        {
            return Substitute.For<ITestScenarioResultsService>();
        }

        private static IPoliciesApiClient CreatePoliciesApiClient()
        {
            return Substitute.For<IPoliciesApiClient>();
        }

        private static ITestEngineApiClient CreateTestEngineApiClient()
        {
            return Substitute.For<ITestEngineApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }
    }
}
