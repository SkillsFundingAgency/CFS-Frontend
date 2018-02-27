namespace CalculateFunding.Frontend.PageModels.Results
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Results;
    using Castle.Core.Logging;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;

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

            ProviderCalcsResultsPageModel providerCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper);

            ILogger logger = Substitute.For<ILogger>();           
        
            // Act - Assert
            Assert.ThrowsExceptionAsync<ArgumentNullException>(async () => await providerCalcPageModel.OnGetAsync(null, string.Empty, string.Empty));

        }

        [TestMethod]
        public async Task onGetAsync_GivenValidPeriodIdReturnsValidAcademicYearAsync()
        {
            // Arrange
           IResultsApiClient resultsApiClient = CreateApiClient();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            IMapper mapper = CreateMapper();

            ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper);

            Provider provider = new Provider()
            {
                ProviderType = "Academy",
                ProviderSubtype = "Academy",
                LocalAuthority = "LA",
                UPIN = 234234,
                UKPRN = 345345,
                URN = 2234,
                DateOpened = new DateTime(12,01,23),
                Id = "10923",
                Name = "Test school"
            };


            IEnumerable<Reference> academicYears = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };

            // string expectedYear = "2016-2017";

            SpecificationSummary specsummary1 = new SpecificationSummary()
            {
                 FundingStream = new Reference() { Id="1", Name="Test Funding Stream"},
                  Period = new Reference() {Id="1617",Name= "2016-2017" },
                  Id = "234",
                  Name = "Test Spec"
            };

            SpecificationSummary specsummary2 = new SpecificationSummary()
            {
                FundingStream = new Reference() { Id = "1", Name = "Test Funding Stream" },
                Period = new Reference() { Id = "1617", Name = "2016-2017" },
                Id = "234",
                Name = "Test Spec"
            };

            IList<SpecificationSummary> specSummary = new List<SpecificationSummary>
            {
                specsummary1,
                specsummary2
            };

            CalculationResultItem cal1 = new CalculationResultItem(){
                Calculation = new Reference {Id ="1", Name ="Calc 1"},
                Value =234234234              
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

            AllocationLineResultItem alloc1 = new AllocationLineResultItem() {
                AllocationLine = new Reference {Id="1", Name="Alloc 1" },
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

            ProviderResults providerResults = new ProviderResults()
            {
                 AllocationResults = allocResult,
                 CalculationResults = calResult
            }; 

            resultsApiClient.GetProviderByProviderId(Arg.Any<string>())
                .Returns(new ApiResponse<Provider>(HttpStatusCode.OK, provider) );

            specsClient.GetAcademicYears()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, academicYears));

            resultsApiClient.GetProviderResults(Arg.Is("2"), Arg.Is("2"))
                .Returns(new ApiResponse<ProviderResults>(HttpStatusCode.OK, providerResults));

            resultsApiClient.GetSpecifications("2")
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specSummary));


            IActionResult result = await provideCalcPageModel.OnGetAsync("2", "1617", "2");

            // Assert

            result.Should().NotBeNull();
            //result.

                   
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
        private static ProviderCalcsResultsPageModel CreatePageModel(IResultsApiClient resultsApiClient, ISpecsApiClient specsApiClient, IMapper mapper)
        {
            return new ProviderCalcsResultsPageModel( resultsApiClient,  specsApiClient,  mapper);
        }

    }

}
