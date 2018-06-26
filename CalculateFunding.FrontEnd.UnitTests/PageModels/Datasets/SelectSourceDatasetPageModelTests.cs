using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using CalculateFunding.Frontend.Pages.Datasets;
using System;
using System.Threading.Tasks;
using FluentAssertions;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Linq;

namespace CalculateFunding.Frontend.PageModels.Datasets
{
    [TestClass]
    public class SelectSourceDatasetPageModelTests
    {
        const string relationshipId = "59f84a1f-f843-4472-a38a-d7bb5040d1bb";
        const string specificationId = "66f84a1f-f843-4472-a38a-d7bb5040d2cd";
        const string datasetId = "99f84a1f-f843-4472-a38a-d7bb5040d211";

        [TestMethod]
        public void OnGetAsync_GivenNullOrEmptyRelationshipId_ThrowsArgumentNullException()
        {
            // Arrange
            SelectSourceDatasetPageModel pageModel = CreatePageModel();

            // Act
            Func<Task> test = async () => await pageModel.OnGetAsync(null);

            // Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenRelationshipIdButGettingSourceModelReturnedInternalServerError_Returns500()
        {
            // Arrange
            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.InternalServerError);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(relationshipId);

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);

            logger
                .Received(1)
                .Error(Arg.Is($"Failed to fetch data sources with status code InternalServerError"));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenRelationshipIdAndGettingSourceModelReturnsOkButNullContent_Returns500()
        {
            // Arrange
            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(relationshipId);

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);

            logger
                .Received(1)
                .Error(Arg.Is($"Failed to fetch data sources with status code OK"));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenRelationshipIdAndGetsModelWithoutDatasets_Returns200()
        {
            // Arrange
            SelectDataSourceModel sourceModel = new SelectDataSourceModel();

            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(relationshipId);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenRelationshipIdAndGetsModelWithDatasets_Returns200()
        {
            // Arrange
            SelectDataSourceModel sourceModel = new SelectDataSourceModel();
            sourceModel.Datasets = new[]
            {
                new DatasetVersionsModel
                {
                    Id = "ds-id",
                    Name = "ds name",
                    Versions = new[] { 1 }
                }
            };

            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(relationshipId);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .ViewModel
                .Datasets
                .Count()
                .Should()
                .Be(1);
        }

        [TestMethod]
        public void OnPostAsync_GivenNullOrEmptyDatasetIdAndNullOrEmptyRelationshipId_ThrowsArgumentNullException()
        {
            // Arrange
            SelectSourceDatasetPageModel pageModel = CreatePageModel();
            
            // Act
            Func<Task> test = async () => await pageModel.OnPostAsync(null, "", null);

            // Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenDatasetVersionIsNullAndGettingRelationshipReturnsInternalServerError_Returns500()
        {
            // Arrange
            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.InternalServerError);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, null);

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);

            logger
                .Received(1)
                .Error(Arg.Is($"Failed to fetch data sources with status code InternalServerError"));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenDatasetVersionIUsNullAndRelationshipIdAndGetsModelWithoutDatasets_Returns200()
        {
            // Arrange
            SelectDataSourceModel sourceModel = new SelectDataSourceModel();

            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, null);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenDatasetVersionIsInvalid_Returns500()
        {
            // Arrange
            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, datasetId);

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);

            logger
                .Received(1)
                .Error(Arg.Is($"Dataset version: {datasetId} is invalid"));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenDataetVersionIUsNullAndRelationshipIdAndGetsModelWithoutDatasets_Returns200()
        {
            // Arrange
            SelectDataSourceModel sourceModel = new SelectDataSourceModel();

            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, null);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenValidDatsetVersionButSavingIsUnsuccessful_Returns500()
        {
            // Arrange
            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            datasetsApiClient
                .AssignDataSourceVersionToRelationship(Arg.Any<AssignDatasetVersion>())
                .Returns(HttpStatusCode.InternalServerError);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, $"{datasetId}_2" );

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);

            logger
                .Received(1)
                .Error(Arg.Is($"Failed to assign dataset version with status code: InternalServerError"));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenValidDatsetVersionAndSavingIsUnsuccessful_ReturnsRedirect()
        {
            // Arrange
            ApiResponse<SelectDataSourceModel> sourcesResponse = new ApiResponse<SelectDataSourceModel>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDatasourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            datasetsApiClient
                .AssignDataSourceVersionToRelationship(Arg.Any<AssignDatasetVersion>())
                .Returns(HttpStatusCode.NoContent);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, $"{datasetId}_2");

            //Assert
            result
                .Should()
                .BeOfType<RedirectResult>();

            RedirectResult redirectResult = result as RedirectResult;

            redirectResult
                .Url
                .Should()
                .Be($"/datasets/specificationrelationships?specificationId={specificationId}&wasSuccess=true");
        }

        private static SelectSourceDatasetPageModel CreatePageModel(IDatasetsApiClient datasetClient = null, 
            ILogger logger = null)
        {
            SelectSourceDatasetPageModel pageModel = new SelectSourceDatasetPageModel(datasetClient ?? CreateDatasetsApiClient(), logger ?? CreateLogger());

            pageModel.PageContext = new PageContext();

            return pageModel;
        }

        private static IDatasetsApiClient CreateDatasetsApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }
    }
}
