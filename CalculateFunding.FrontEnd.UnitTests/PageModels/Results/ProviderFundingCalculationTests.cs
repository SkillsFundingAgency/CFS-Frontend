namespace CalculateFunding.Frontend.PageModels.Results
{
    using AutoMapper;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Results;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using System;

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

            // Act - Assert
            Assert.ThrowsExceptionAsync<ArgumentNullException>(async () => await providerCalcPageModel.OnGetAsync(null, string.Empty, string.Empty));

        }

        //[TestMethod]
        //public async onGetAsync_GivenValidPeriodIdReturnsValidAcademicYear()
        //{
        //    // Arrange
        //    IResultsApiClient resultsApiClient = CreateApiClient();

        //    ISpecsApiClient specsClient = CreateSpecsApiClient();

        //    IMapper mapper = CreateMapper();

        //    ProviderCalcsResultsPageModel provideCalcPageModel = CreatePageModel(resultsApiClient, specsClient, mapper);

        //   // IActionResult result = await provideCalcPageModel.OnGetAsync(1, "", 2);


        //}





















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
