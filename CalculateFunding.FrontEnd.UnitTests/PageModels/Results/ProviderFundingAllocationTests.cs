namespace CalculateFunding.Frontend.PageModels.Results
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Results;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;

    [TestClass]
  public class ProviderFundingAllocationTests
    {
        [TestMethod]
        public void OnGetAsync_GivenNullProviderReturnsArgumentNullExceptionThrown()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = Substitute.For<ILogger>();

            ProviderAllocationLinePageModel providerAllocPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            // Act - Assert
            Assert.ThrowsExceptionAsync<ArgumentNullException>(async () => await providerAllocPageModel.OnGetAsync(null, string.Empty, string.Empty));

        }

        [TestMethod]
        public void OnGetAsync_ReturnsErrorWhenFundingPeriodResponseIsNull()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderAllocationLinePageModel providerAllocPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            Provider provider = CreateProvider();

            IEnumerable<Reference> academicYears = null;

            IList<SpecificationSummary> specSummary = GetSpecSummary();

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            ProviderResults providerResults = new ProviderResults()
            {
                AllocationResults = allocResult,
                CalculationResults = calResult
            };

            var fundingPeriods = specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.NotFound, academicYears));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
               .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.OK, providerResults));

            resultsApiClient.GetSpecifications("2")
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specSummary));


            // Act

            Func<Task> test = async () => await providerAllocPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            test
               .Should()
               .ThrowExactly<System.InvalidOperationException>().WithMessage("Unable to retreive Periods: Status Code = NotFound");
        }

        [TestMethod]
        public async Task OnGetAsync_ReturnsValidAcademicYearAsync()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderAllocationLinePageModel providerAllocPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            Provider provider = CreateProvider();

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            IList<SpecificationSummary> specSummary = GetSpecSummary();

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

            resultsApiClient.GetSpecifications("2")
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specSummary));

            // Act
            IActionResult result = await providerAllocPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            PageResult pageResult = result as PageResult;

            pageResult.Should().NotBeNull();

            providerAllocPageModel.FundingPeriods.Should().NotBeNull();

        }

        [TestMethod]
        public async Task OnGetAsync_WhenGettingProviderResponseIsSuccess_PopulatesProviderDetails()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderAllocationLinePageModel providerAllocPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = CreateProvider();

            IList<SpecificationSummary> specSummary = GetSpecSummary();

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

            resultsApiClient.GetSpecifications("2")
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specSummary));

            // Act
            IActionResult result = await providerAllocPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            providerAllocPageModel.ViewModel.Should().NotBeNull();
            providerAllocPageModel.ViewModel.Upin.Should().Be(234234);
            providerAllocPageModel.ViewModel.Ukprn.Should().Be(345345);
            providerAllocPageModel.ViewModel.Urn.Should().Be(2234);
            providerAllocPageModel.ViewModel.ProviderType.Should().Be("Academy");
        }


        [TestMethod]
        public void OnGetAsync_WhenGettingProviderResponseIsNotSuccess_ThrowsException()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderAllocationLinePageModel providerAllocPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = null;

            IList<SpecificationSummary> specSummary = GetSpecSummary();

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

            resultsApiClient.GetSpecifications("2")
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specSummary));

            // Act
            Func<Task> test = async () => await providerAllocPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            test
            .Should()
            .ThrowExactly<System.InvalidOperationException>().WithMessage("Unable to retreive Provider information: Status Code = NotFound");

        }

        [TestMethod]
        public async Task OnGetAsync_WhenGettingProviderResultsIsSuccess_AllocationDetails_Populated()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderAllocationLinePageModel providerAllocPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = CreateProvider();

            IList<SpecificationSummary> specSummary = GetSpecSummary();

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

            resultsApiClient.GetSpecifications("2")
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specSummary));

            // Act
            IActionResult result = await providerAllocPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            providerAllocPageModel.ViewModel.AllocationLineItems.Should().HaveSameCount(allocResult);

        }

        [TestMethod]
        public async Task OnGetAsync_WhenGettingProviderResultsIsNotSuccess_AllocationDetails_NotPopulated()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderAllocationLinePageModel providerAllocPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = CreateProvider();

            IList<SpecificationSummary> specSummary = GetSpecSummary();

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            ProviderResults providerResults = null;

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.NoContent, providerResults));

            resultsApiClient.GetSpecifications("2")
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specSummary));

            // Act
            IActionResult result = await providerAllocPageModel.OnGetAsync("2", "1617", "2");

            // Assert
            PageResult pageResult = result as PageResult;
            pageResult.Should().NotBeNull();
            providerAllocPageModel.ViewModel.AllocationLineItems.Should().HaveCount(0);
            providerAllocPageModel.ViewModel.CalculationItems.Should().HaveCount(0);
        }

        [TestMethod]
        public void OnGetAsync_WhenGettingSpecificationSummaryIsNotSuccess_ThrowsError()
        {
            // Arrange
            IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ILogger logger = CreateLogger();

            ProviderAllocationLinePageModel providerAllocPageModel = CreatePageModel(resultsApiClient, specsClient, mapper, logger);

            IEnumerable<Reference> fundingPeriods = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            Provider provider = CreateProvider();

            IList<SpecificationSummary> specSummary = null;

            IList<CalculationResultItem> calResult = GetCalcResults();

            IList<AllocationLineResultItem> allocResult = GetAllocationResults();

            ProviderResults providerResults = null;

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider));

            specsClient.GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.NoContent, providerResults));

            resultsApiClient.GetSpecifications("2")
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specSummary));


            // Act
            Func<Task> test = async () => await providerAllocPageModel.OnGetAsync("2", "1617", "2");

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

        private IList<SpecificationSummary> GetSpecSummary()
        {
            SpecificationSummary specsummary1 = new SpecificationSummary()
            {
                FundingStreams = new List<Reference>() { new Reference() { Id = "1", Name = "Test Funding Stream 1" } },
                FundingPeriod = new Reference() { Id = "1617", Name = "2016-2017" },
                Id = "1",
                Name = "Test Spec 1"
            };

            SpecificationSummary specsummary2 = new SpecificationSummary()
            {
                FundingStreams = new List<Reference>() { new Reference() { Id = "2", Name = "Test Funding Stream 2" } },
                FundingPeriod = new Reference() { Id = "1617", Name = "2016-2017" },
                Id = "2",
                Name = "Test Spec 2"
            };

            IList<SpecificationSummary> specSummary = new List<SpecificationSummary>
            {
                specsummary1,
                specsummary2
            };
            return specSummary;
        }

        private IList<CalculationResultItem> GetCalcResults()
        {
            CalculationResultItem cal1 = new CalculationResultItem()
            {
                Calculation = new Reference { Id = "1", Name = "Calc 1" },
                Value = 234234234
            };
            CalculationResultItem cal2 = new CalculationResultItem()
            {
                Calculation = new Reference { Id = "2", Name = "Calc 2" },
                Value = 4234234,

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

        private static ProviderAllocationLinePageModel CreatePageModel(IResultsApiClient resultsApiClient, ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger)
        {
            return new ProviderAllocationLinePageModel(resultsApiClient,  mapper, specsApiClient, logger);
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

    }
}
