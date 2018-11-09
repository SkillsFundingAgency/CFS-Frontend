namespace CalculateFunding.Frontend.PageModels.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Results;
    using Serilog;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using System.Linq;

    [TestClass]
    public class ProviderFundingCalculationTests
    {

        [TestMethod]
        public void OnGetAsync_GivenNullProviderReturnsArgumentNullExceptionThrown()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = Substitute.For<ILogger>();

            ProviderCalcsResultsPageModel providerCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            // Act - Assert
            Assert.ThrowsExceptionAsync<ArgumentNullException>(async () => await providerCalcPageModel.OnGetAsync(null, string.Empty, string.Empty));

        }

        [TestMethod]
        public void OnGetAsync_ReturnsErrorWhenFundingPeriodResponseIsNull()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            Provider provider = CreateProvider();

            IEnumerable<Reference> fundingPeriods = null;

            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            ProviderResults providerResults = new ProviderResults()
            {
                AllocationResults = allocResult,
                CalculationResults = calResult
            };

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.NotFound, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
               .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.OK, providerResults));

            resultsApiClient.GetSpecificationIdsForProvider("2")
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            // Act

            Func<Task> test = async () => await provideCalcPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            test
               .Should()
               .ThrowExactly<System.InvalidOperationException>().WithMessage("Unable to retreive Periods: Status Code = NotFound");
        }

        [TestMethod]
        public async Task OnGetAsync_ReturnsValidFundingPeriodAsync()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            Provider provider = CreateProvider();

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            ProviderResults providerResults = new ProviderResults()
            {
                AllocationResults = allocResult,
                CalculationResults = calResult
            };

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.OK, providerResults));


            resultsApiClient.GetSpecificationIdsForProvider("2")
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<Clients.SpecsClient.Models.SpecificationSummary>>(HttpStatusCode.OK, new List<Clients.SpecsClient.Models.SpecificationSummary>()));

            // Act
            IActionResult result = await provideCalcPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            result.Should()
                .BeOfType<PageResult>()
                .Which.Should().NotBeNull("Action result was null");

            provideCalcPageModel.FundingPeriods.Should().NotBeNull();
        }

        [TestMethod]
        public void OnGetAsync_WhenGettingProviderResponseIsNotSuccess_ThrowsException()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = null;

            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            ProviderResults providerResults = new ProviderResults()
            {
                AllocationResults = allocResult,
                CalculationResults = calResult
            };

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.NotFound, provider));

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.OK, providerResults));

            resultsApiClient.GetSpecificationIdsForProvider("2")
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<Clients.SpecsClient.Models.SpecificationSummary>>(HttpStatusCode.OK, new List<Clients.SpecsClient.Models.SpecificationSummary>()));

            // Act
            Func<Task> test = async () => await provideCalcPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            test
            .Should()
            .ThrowExactly<System.InvalidOperationException>().WithMessage("Unable to retreive Provider information: Status Code = NotFound");

        }

        [TestMethod]
        public async Task OnGetAsync_WhenGettingProviderResponseIsSuccess_PopulatesProviderDetails()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = CreateProvider();

            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            ProviderResults providerResults = new ProviderResults()
            {
                AllocationResults = allocResult,
                CalculationResults = calResult
            };

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.OK, providerResults));

            resultsApiClient.GetSpecificationIdsForProvider("2")
            .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<Clients.SpecsClient.Models.SpecificationSummary>>(HttpStatusCode.OK, new List<Clients.SpecsClient.Models.SpecificationSummary>()));

            // Act
            IActionResult result = await provideCalcPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            provideCalcPageModel.ViewModel.Should().NotBeNull();
            provideCalcPageModel.ViewModel.Upin.Should().Be(234234);
            provideCalcPageModel.ViewModel.Ukprn.Should().Be(345345);
            provideCalcPageModel.ViewModel.Urn.Should().Be(2234);
            provideCalcPageModel.ViewModel.ProviderType.Should().Be("Academy");
        }

        [TestMethod]
        public async Task OnGetAsync_WhenGettingProviderResultsIsSuccess_CalculationDetails_Populated()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = CreateProvider();

            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            ProviderResults providerResults = new ProviderResults()
            {
                AllocationResults = allocResult,
                CalculationResults = calResult
            };

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.OK, providerResults));

            resultsApiClient.GetSpecificationIdsForProvider("2")
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<Clients.SpecsClient.Models.SpecificationSummary>>(HttpStatusCode.OK, new List<Clients.SpecsClient.Models.SpecificationSummary>()));

            // Act
            IActionResult result = await provideCalcPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            provideCalcPageModel.ViewModel.CalculationItems.Should().HaveSameCount(calResult);

            provideCalcPageModel.ViewModel.CalculationItems.First().CalculationType.Should().Be(Clients.SpecsClient.Models.CalculationSpecificationType.Number);

            provideCalcPageModel.ViewModel.CalculationItems.Last().CalculationType.Should().Be(Clients.SpecsClient.Models.CalculationSpecificationType.Funding);
        }

        [TestMethod]
        public async Task OnGetAsync_WhenGettingProviderResultsIsNotSuccess_CalculationDetails_NotPopulated()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = CreateProvider();

            IEnumerable<string> specSummary = GetSpecificationsWithResults();

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            ProviderResults providerResults = null;

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.NoContent, providerResults));

            resultsApiClient.GetSpecificationIdsForProvider("2")
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));

            specsClient
                .GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<Clients.SpecsClient.Models.SpecificationSummary>>(HttpStatusCode.OK, new List<Clients.SpecsClient.Models.SpecificationSummary>()));

            // Act
            IActionResult result = await provideCalcPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            PageResult pageResult = result as PageResult;
            pageResult.Should().NotBeNull();
            provideCalcPageModel.ViewModel.AllocationLineItems.Should().HaveCount(0);
            provideCalcPageModel.ViewModel.CalculationItems.Should().HaveCount(0);
        }


        [TestMethod]
        public void OnGetAsync_WhenGettingSpecificationSummaryIsNotSuccess_ThrowsError()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = CreateProvider();

            IList<string> specSummary = null;

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            ProviderResults providerResults = null;

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.NoContent, providerResults));

            resultsApiClient.GetSpecificationIdsForProvider("2")
                .Returns(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, specSummary));


            // Act
            Func<Task> test = async () => await provideCalcPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            test
            .Should()
            .ThrowExactly<System.InvalidOperationException>();
        }

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

        private IEnumerable<string> GetSpecificationsWithResults()
        {
            return new List<string>()
            {
                "1",
                "2",
            };
        }

        private IList<CalculationResultItem> GetCalcResults()
        {
            CalculationResultItem cal1 = new CalculationResultItem()
            {
                Calculation = new Reference { Id = "1", Name = "Calc 1" },
                Value = 234234234,
                CalculationType = Clients.SpecsClient.Models.CalculationSpecificationType.Number
            };
            CalculationResultItem cal2 = new CalculationResultItem()
            {
                Calculation = new Reference { Id = "2", Name = "Calc 2" },
                Value = 4234234,
                CalculationType = Clients.SpecsClient.Models.CalculationSpecificationType.Funding
            };

            IList<CalculationResultItem> calResult = new List<CalculationResultItem>
            {
                cal1,
                cal2
            };

            return calResult;
        }

        private IList<AllocationLineResultItem> GetAllocationResults()
        {
            AllocationLineResultItem alloc1 = new AllocationLineResultItem()
            {
                AllocationLine = new Reference { Id = "1", Name = "Alloc 1" },
                Value = 234234
            };

            AllocationLineResultItem alloc2 = new AllocationLineResultItem()
            {
                AllocationLine = new Reference { Id = "2", Name = "Alloc 2" },
                Value = 23434234
            };

            IList<AllocationLineResultItem> allocResult = new List<AllocationLineResultItem>()
            {
                alloc1,
                alloc2
            };

            return allocResult;
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
        private static ProviderCalcsResultsPageModel CreatePageModel(IResultsApiClient resultsApiClient, ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger)
        {
            return new ProviderCalcsResultsPageModel(resultsApiClient, specsApiClient, mapper, logger);
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

    }

}
