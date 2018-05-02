using AutoMapper;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
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
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Serilog;

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

            ApiResponse<Clients.CalcsClient.Models.Calculation> calculation = new ApiResponse<Clients.CalcsClient.Models.Calculation>(HttpStatusCode.NotFound);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
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

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
            {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
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

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
            {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.BadRequest);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
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

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
            {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
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

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
            {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = null;

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
        public async Task OnGetAsync_GivenCalculationFoundWithSearchResults_ReturnsPage()
        {
            //Arrange
            const string calculationId = "calc-id";
            const string specificationId = "spec-id";

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
           {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
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

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
           {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = false
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
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

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
           {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
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

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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

            ApiResponse<Clients.CalcsClient.Models.Calculation> calculation = new ApiResponse<Clients.CalcsClient.Models.Calculation>(HttpStatusCode.NotFound);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
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

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
            {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
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

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
            {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.BadRequest);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
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

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
            {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
                .Returns(datasetSchemaResponse);

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
           {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
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

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId,
                Specification = new SpecificationSummary
                {
                    Id = specificationId
                }
            };

            IEnumerable<DatasetSchemasAssigned> datasetSchemasAssignedList = new[]
           {
                new DatasetSchemasAssigned
                {
                    IsSetAsProviderData = true
                }
            };

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssignedList);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(Arg.Is(specificationId))
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

            CalculationProviderResultsPageModel pageModel = CreatePageModel(calculationProviderResultsSearchService, calculationsApiClient, mapper, datasetsApiClient);

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

        static CalculationProviderResultsPageModel CreatePageModel(
            ICalculationProviderResultsSearchService resultsSearchService = null,
            ICalculationsApiClient calculationsApiClient = null,
            IMapper mapper = null,
            IDatasetsApiClient datasetsApiClient = null,
            ILogger logger = null)
        {
            return new CalculationProviderResultsPageModel(
                resultsSearchService ?? CreateResultsSearchService(),
                calculationsApiClient ?? CreateCalculationsApiClient(),
                mapper ?? CreateMapper(),
                datasetsApiClient ?? CreateDatasetsApiClient(),
                logger ?? Createlogger());
        }

        static ICalculationsApiClient CreateCalculationsApiClient()
        {
            return Substitute.For<ICalculationsApiClient>();
        }

        static ICalculationProviderResultsSearchService CreateResultsSearchService()
        {
            return Substitute.For<ICalculationProviderResultsSearchService>();
        }

        static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        static IDatasetsApiClient CreateDatasetsApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        static ILogger Createlogger()
        {
            return Substitute.For<ILogger>();
        }
    }
}
