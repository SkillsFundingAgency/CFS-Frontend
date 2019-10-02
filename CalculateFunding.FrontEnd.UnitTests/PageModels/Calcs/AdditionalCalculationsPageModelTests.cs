using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.Pages.Calcs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.RazorPages;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Calcs
{
    [TestClass]
    public class AdditionalCalculationsPageModelTests
    {
        private const string specificationId = "spec123";

        [TestMethod]
        public async Task AdditionalCalculationsModel_OnGet_WhenSpecificationNotFound_ThenNotFoundReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            specsApiClient.GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.NotFound, null));

            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            AdditionalCalculationsModel additionalCalculationsModel = CreateAdditionalCalculationsModel(specsApiClient, datasetsApiClient);

            // Act
            IActionResult result = await additionalCalculationsModel.OnGet(specificationId, null, null);

            // Assert
            result
                .Should()
                .BeOfType<NotFoundObjectResult>()
                .Which
                .Value
                .Should()
                .Be("Specification not found");
        }

        [TestMethod]
        public async Task AdditionalCalculationsModel_OnGet_WhenDatasetsApiFailed_ThenErrorShouldBeReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            specsApiClient.GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification()));

            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.NotFound, null));

            AdditionalCalculationsModel additionalCalculationsModel = CreateAdditionalCalculationsModel(specsApiClient, datasetsApiClient);

            // Act
            IActionResult result = await additionalCalculationsModel.OnGet(specificationId, null, null);

            // Assert
            result
                .Should()
                .BeOfType<NotFoundObjectResult>()
                .Which
                .Value
                .Should()
                .Be("Data schemas not found");
        }

        [TestMethod]
        public async Task AdditionalCalculationsModel_OnGet_GivenResultsFoundInSearch_ReturnsPage()
        {
            // Arrange
            IEnumerable<DatasetSchemasAssigned> datasetSchemas = Enumerable.Empty<DatasetSchemasAssigned>();

            CalculationSearchResultViewModel calculationSearchResultViewModel = new CalculationSearchResultViewModel
            {
                Calculations = new[]
                {
                    new CalculationSearchResultItemViewModel()
                }
            };

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            ICalculationSearchService calculationSearchService = CreateSearchService();
            calculationSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(calculationSearchResultViewModel);

            specsApiClient.GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification()));

            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemas));

            AdditionalCalculationsModel additionalCalculationsModel = CreateAdditionalCalculationsModel(
                specsApiClient, datasetsApiClient, calculationSearchService: calculationSearchService);

            // Act
            IActionResult result = await additionalCalculationsModel.OnGet(specificationId, null, null);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            additionalCalculationsModel
                .InitialSearchResults
                .Should()
                .NotBeEmpty();
            
            CalculationSearchResultViewModel deserializedModel = JsonConvert.DeserializeObject<CalculationSearchResultViewModel>(additionalCalculationsModel.InitialSearchResults);

            deserializedModel
                .Calculations
                .Should()
                .HaveCount(1);
        }

        public AdditionalCalculationsModel CreateAdditionalCalculationsModel(
            ISpecsApiClient specsClient = null,
            IDatasetsApiClient datasetsClient = null,
            IMapper mapper = null,
            ICalculationSearchService calculationSearchService = null)
        {
            return new AdditionalCalculationsModel(
                specsClient ?? CreateSpecsApiClient(),
                datasetsClient ?? CreateDatasetsApiClient(),
                mapper ?? CreateMapper(),
                calculationSearchService ?? CreateSearchService());
        }

        private ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private IDatasetsApiClient CreateDatasetsApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        private ICalculationSearchService CreateSearchService()
        {
            return Substitute.For<ICalculationSearchService>();
        }


    }
}
