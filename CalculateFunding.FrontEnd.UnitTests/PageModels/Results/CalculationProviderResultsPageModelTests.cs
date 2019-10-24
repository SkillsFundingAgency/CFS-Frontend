using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Frontend.Pages.Results;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;

namespace CalculateFunding.Frontend.PageModels.Results
{
    [TestClass]
    public class CalculationProviderResultsPageModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_GivenNullOrEmptyCalculationId_ReturnsBadRequest()
        {
            //Arrange
            const string calculationId = "";

            CalculationProviderResultsPageModel pageModel = CreatePageModel();

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationCouldNotBeFound_ReturnsNotFound()
        {
            //Arrange
            const string calculationId = "calc-id";

            ApiResponse<Calculation> calculation = new ApiResponse<Calculation>(HttpStatusCode.NotFound);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(calculation);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationsApiClient: calculationsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<NotFoundResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationFoundButNullSearchResults_ReturnsStatusCode500()
        {
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
            {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationFoundButGettingAssignedSchemasForSpecRetunsBadRequest_ReturnsStatusCode500()
        {
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
            {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.BadRequest);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper: mapper, datasetsApiClient: datasetsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationFoundButGettingAssignedSchemasForSpecRetunsOKWithNullContent_ReturnsStatusCode500()
        {
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
            {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper: mapper, datasetsApiClient: datasetsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationFoundButGettingAssignedSchemasForSpecRetunsNull_ReturnsStatusCode500()
        {
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
            {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = null;

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper: mapper, datasetsApiClient: datasetsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationAndNullPageNumberFoundWithSearchResults_ReturnsPage()
        {
            //Arrange
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
           {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultSearchResultViewModel calculationProviderResultSearchResultViewModel = new CalculationProviderResultSearchResultViewModel
            {
                CalculationProviderResults = new[] { new CalculationProviderResultSearchResultItemViewModel() }
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();
            calculationProviderResultsSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(calculationProviderResultSearchResultViewModel);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .CalculationProviderResults
                .CalculationProviderResults
                .Any()
                .Should()
                .BeTrue();

            await
            calculationProviderResultsSearchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(m => m.PageNumber == 1));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationAndAPageNumberFoundWithSearchResults_ReturnsPage()
        {
            //Arrange
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
           {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultSearchResultViewModel calculationProviderResultSearchResultViewModel = new CalculationProviderResultSearchResultViewModel
            {
                CalculationProviderResults = new[] { new CalculationProviderResultSearchResultItemViewModel() }
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();
            calculationProviderResultsSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(calculationProviderResultSearchResultViewModel);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, 2, "");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .CalculationProviderResults
                .CalculationProviderResults
                .Any()
                .Should()
                .BeTrue();

            await
            calculationProviderResultsSearchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(m => m.PageNumber == 2));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationFoundButHasNoAssignedDataSources_ReturnsPageDoesNotPerformSearch()
        {
            //Arrange
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
           {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = false
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultSearchResultViewModel calculationProviderResultSearchResultViewModel = new CalculationProviderResultSearchResultViewModel
            {
                CalculationProviderResults = new[] { new CalculationProviderResultSearchResultItemViewModel() }
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            await
                calculationProviderResultsSearchService
                    .DidNotReceive()
                    .PerformSearch(Arg.Any<SearchRequestViewModel>());
        }

        [TestMethod]
        public async Task OnGetAsync_GivenCalculationFoundWithEmptySearchResults_ReturnsPage()
        {
            //Arrange
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
           {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultSearchResultViewModel calculationProviderResultSearchResultViewModel = new CalculationProviderResultSearchResultViewModel
            {
                CalculationProviderResults = Enumerable.Empty<CalculationProviderResultSearchResultItemViewModel>()
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();
            calculationProviderResultsSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(calculationProviderResultSearchResultViewModel);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .CalculationProviderResults
                .CalculationProviderResults
                .Any()
                .Should()
                .BeFalse();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenNullOrEmptyCalculationId_ReturnsBadRequest()
        {
            //Arrange
            const string calculationId = "";

            CalculationProviderResultsPageModel pageModel = CreatePageModel();

            //Act
            IActionResult result = await pageModel.OnPostAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationCouldNotBeFound_ReturnsNotFound()
        {
            //Arrange
            const string calculationId = "calc-id";

            ApiResponse<Calculation> calculation = new ApiResponse<Calculation>(HttpStatusCode.NotFound);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(calculation);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationsApiClient: calculationsApiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<NotFoundResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationFoundButNullSearchResults_ReturnsStatusCode500()
        {
            //Arrange
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
            {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationFoundButGettingAssignedSchemasForSpecRetunsBadRequest_ReturnsStatusCode500()
        {
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
            {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.BadRequest);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper: mapper, datasetsApiClient: datasetsApiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationFoundButGettingAssignedSchemasForSpecRetunsOKWithNullContent_ReturnsStatusCode500()
        {
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
            {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationFoundWithSearchResults_ReturnsPage()
        {
            //Arrange
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
           {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultSearchResultViewModel calculationProviderResultSearchResultViewModel = new CalculationProviderResultSearchResultViewModel
            {
                CalculationProviderResults = new[] { new CalculationProviderResultSearchResultItemViewModel() }
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();
            calculationProviderResultsSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(calculationProviderResultSearchResultViewModel);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .CalculationProviderResults
                .CalculationProviderResults
                .Any()
                .Should()
                .BeTrue();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationFoundWithEmptySearchResults_ReturnsPage()
        {
            //Arrange
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            IEnumerable<DatasetSpecificationRelationshipViewModel> datasetSchemasAssignedList = new[]
           {
                new DatasetSpecificationRelationshipViewModel
                {
                    IsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultSearchResultViewModel calculationProviderResultSearchResultViewModel = new CalculationProviderResultSearchResultViewModel
            {
                CalculationProviderResults = Enumerable.Empty<CalculationProviderResultSearchResultItemViewModel>()
            };

            ApiResponse<Calculation> CalculationResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, calculation);

            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            calculationsApiClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(CalculationResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationViewModel>(Arg.Is(calculation))
                .Returns(calculationViewModel);

            ICalculationProviderResultsSearchService calculationProviderResultsSearchService = CreateResultsSearchService();
            calculationProviderResultsSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(calculationProviderResultSearchResultViewModel);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient.GetSpecificationSummaries(Arg.Any<IEnumerable<string>>())
                .Returns(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));

            SpecificationSummary specificationSummary = new SpecificationSummary()
            {
                Id = specificationId,
            };

            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            CalculationProviderResultsPageModel pageModel = CreatePageModel(
                calculationProviderResultsSearchService,
                calculationsApiClient,
                mapper: mapper,
                datasetsApiClient: datasetsApiClient,
                specsApiClient: specsApiClient);

            //Act
            IActionResult result = await pageModel.OnPostAsync(calculationId, null, "");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .CalculationProviderResults
                .CalculationProviderResults
                .Any()
                .Should()
                .BeFalse();
        }

        private static CalculationProviderResultsPageModel CreatePageModel(
            ICalculationProviderResultsSearchService resultsSearchService = null,
            ICalculationsApiClient calculationsApiClient = null,
            ISpecsApiClient specsApiClient = null,
            IMapper mapper = null,
            IDatasetsApiClient datasetsApiClient = null,
            ILogger logger = null,
            IJobsApiClient jobsApiClient = null)
        {
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            featureToggle.IsExceptionMessagesEnabled().Returns(true);
            return new CalculationProviderResultsPageModel(
                resultsSearchService ?? CreateResultsSearchService(),
                calculationsApiClient ?? CreateCalculationsApiClient(),
                specsApiClient ?? CreateSpecsApiClient(),
                mapper ?? CreateMapper(),
                datasetsApiClient ?? CreateDatasetsApiClient(),
                logger ?? Createlogger(),
                jobsApiClient ?? CreateJobsApiClient(),
                featureToggle);
        }

        private static ICalculationsApiClient CreateCalculationsApiClient()
        {
            return Substitute.For<ICalculationsApiClient>();
        }

        private static ICalculationProviderResultsSearchService CreateResultsSearchService()
        {
            return Substitute.For<ICalculationProviderResultsSearchService>();
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        private static IDatasetsApiClient CreateDatasetsApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private static ILogger Createlogger()
        {
            return Substitute.For<ILogger>();
        }

        private static IJobsApiClient CreateJobsApiClient()
        {
            return Substitute.For<IJobsApiClient>();
        }
    }
}
