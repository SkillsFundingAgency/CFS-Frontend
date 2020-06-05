﻿using System;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Datasets;
using CalculateFunding.Frontend.UnitTests.Helpers;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

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
        public async Task OnGetAsync_GivenRelationshipIdButGettingSourceModelReturnedInternalServerError_Returns404()
        {
            // Arrange
            SelectDatasourceModel model = new SelectDatasourceModel { SpecificationId = "abc123" };
            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.InternalServerError, model);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(relationshipId);

            //Assert
            result
                .Should()
                .BeOfType<NotFoundResult>();

            logger
                .Received(1)
                .Error(Arg.Is($"Failed to fetch data sources with status code InternalServerError"));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenRelationshipIdAndGettingSourceModelReturnsOkButNullContent_Returns404()
        {
            // Arrange
            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(relationshipId);

            //Assert
            result
                .Should()
                .BeOfType<NotFoundResult>();

            logger
                .Received(1)
                .Error(Arg.Is($"Failed to fetch data sources with status code OK"));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenRelationshipIdAndGetsModelWithoutDatasets_Returns200()
        {
            // Arrange
            SelectDatasourceModel sourceModel = new SelectDatasourceModel();

            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
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
            SelectDatasourceModel sourceModel = new SelectDatasourceModel {Datasets = new[] {new DatasetVersions {Id = "ds-id", Name = "ds name", Versions = Builder<DatasetVersionModel>.CreateListOfSize(10).Build()}}};

            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
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

	        pageModel
		        .IsAuthorizedToMap
		        .Should().BeTrue();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenUserDoesNotHaveMapDatasetsPermission_ThenReturnPageResultWithAuthorizedToEditFlagSetToFalse()
        {
	        // Arrange
	        SelectDatasourceModel sourceModel = new SelectDatasourceModel();
	        sourceModel.Datasets = new[]
	        {
		        new DatasetVersions
		        {
			        Id = "ds-id",
			        Name = "ds name",
                    Versions = Builder<DatasetVersionModel>.CreateListOfSize(10).Build()
		        }
	        };

	        ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, sourceModel);

	        IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
	        datasetsApiClient
		        .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
		        .Returns(sourcesResponse);

	        ILogger logger = CreateLogger();

	        IAuthorizationHelper mockAuthorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanMapDatasets, false);
	        SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger, authorizationHelper: mockAuthorizationHelper);

	        // Act
	        IActionResult result = await pageModel.OnGetAsync(relationshipId);

	        //Assert
	        result
		        .Should()
		        .BeOfType<PageResult>();

	        pageModel
		        .IsAuthorizedToMap
		        .Should().BeFalse();
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
        public async Task OnPostAsync_GivenDatasetVersionIsNullAndGettingRelationshipReturnsInternalServerError_Returns404()
        {
            // Arrange
            SelectDatasourceModel model = new SelectDatasourceModel { SpecificationId = "abc123" };
            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.InternalServerError, model);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, null);

            //Assert
            result
                .Should()
                .BeOfType<NotFoundResult>();

            logger
                .Received(1)
                .Error(Arg.Is($"Failed to fetch data sources with status code InternalServerError"));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenDatasetVersionIUsNullAndRelationshipIdAndGetsModelWithoutDatasets_Returns200()
        {
            // Arrange
            SelectDatasourceModel sourceModel = new SelectDatasourceModel();

            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, null);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

	        pageModel
		        .IsAuthorizedToMap
		        .Should().BeTrue();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenDatasetVersionIsInvalid_Returns500()
        {
            // Arrange
            SelectDatasourceModel model = new SelectDatasourceModel { SpecificationId = "abc123" };
            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, model);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
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

	        pageModel
		        .IsAuthorizedToMap
		        .Should().BeTrue();

			logger
                .Received(1)
                .Error(Arg.Is($"Dataset version: {datasetId} is invalid"));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenDataetVersionIUsNullAndRelationshipIdAndGetsModelWithoutDatasets_Returns200()
        {
            // Arrange
            SelectDatasourceModel sourceModel = new SelectDatasourceModel();

            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, null);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

			pageModel
				.IsAuthorizedToMap
				.Should().BeTrue();
		}

        [TestMethod]
        public async Task OnPostAsync_GivenValidDatsetVersionButSavingIsUnsuccessful_Returns500()
        {
            // Arrange
            SelectDatasourceModel model = new SelectDatasourceModel { SpecificationId = "abc123" };
            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, model);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            datasetsApiClient
	            .AssignDatasourceVersionToRelationship(Arg.Any<AssignDatasourceModel>())
	            .Returns(HttpStatusCode.InternalServerError);

            ILogger logger = CreateLogger();

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId, $"{datasetId}_2");

            //Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);

	        pageModel
		        .IsAuthorizedToMap
		        .Should().BeTrue();

			logger
                .Received(1)
                .Error(Arg.Is($"Failed to assign dataset version with status code: InternalServerError"));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenValidDatsetVersionAndSavingIsUnsuccessful_ReturnsRedirect()
        {
            // Arrange
            SelectDatasourceModel model = new SelectDatasourceModel { SpecificationId = "abc123" };
            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, model);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            datasetsApiClient
	            .AssignDatasourceVersionToRelationship(Arg.Any<AssignDatasourceModel>())
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

	        pageModel
		        .IsAuthorizedToMap
		        .Should().BeTrue();
		}

        [TestMethod]
        public async Task OnPostAsync_GivenUserDoesNotHaveMapDatasetsPermission_Returns403()
        {
            // Arrange
            SelectDatasourceModel sourceModel = new SelectDatasourceModel();

            ApiResponse<SelectDatasourceModel> sourcesResponse = new ApiResponse<SelectDatasourceModel>(HttpStatusCode.OK, sourceModel);

            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            datasetsApiClient
                .GetDataSourcesByRelationshipId(Arg.Is(relationshipId))
                .Returns(sourcesResponse);

            ILogger logger = CreateLogger();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanMapDatasets))
                .Returns(false);

            SelectSourceDatasetPageModel pageModel = CreatePageModel(datasetsApiClient, logger, authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnPostAsync(relationshipId, specificationId);

            //Assert
            result
                .Should()
                .BeOfType<ForbidResult>();

	        pageModel
		        .IsAuthorizedToMap
		        .Should().BeFalse();
		}

        private static SelectSourceDatasetPageModel CreatePageModel(IDatasetsApiClient datasetClient = null, ILogger logger = null, IAuthorizationHelper authorizationHelper = null)
        {
            SelectSourceDatasetPageModel pageModel = new SelectSourceDatasetPageModel(datasetClient ?? CreateDatasetsApiClient(), logger ?? CreateLogger(), authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanMapDatasets));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();

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
