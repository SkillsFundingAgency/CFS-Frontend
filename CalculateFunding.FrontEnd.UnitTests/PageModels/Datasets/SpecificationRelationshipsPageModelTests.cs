// <copyright file="SpecificationRelationshipsPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Datasets;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.PageModels.Datasets
{
    [TestClass]
    public class SpecificationRelationshipsPageModelTests
    {
        [TestMethod]
        public void SpecificationRelationshipsPageModel_GivenNullOrEmptySpecificationId_ThrowsArgumentNullException()
        {
            // Arrange
            SpecificationRelationshipsPageModel pageModel = CreatePageModel();

            string specificationId = string.Empty;

            // Act
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            // Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task SpecificationRelationshipsPageModel_GivenSpecResponseReturnsBadRequest_ReturnsStatusCode400()
        {
            // Arrange
            string specificationId = Guid.NewGuid().ToString();

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.BadRequest);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(specificationResponse);

            ILogger logger = CreateLogger();

            SpecificationRelationshipsPageModel pageModel = CreatePageModel(specsApiClient, logger: logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            // Assert
            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(400);

            logger
                .Received(1)
                .Error("Failed to fetch specification with status code BadRequest");
        }

        [TestMethod]
        public async Task SpecificationRelationshipsPageModel_GivenDatasetRelationshipsResponseReturnsBadRequest_ReturnsStatusCode500()
        {
            // Arrange
            string specificationId = Guid.NewGuid().ToString();

            SpecificationSummary specification = new SpecificationSummary
            {
                Id = specificationId
            };

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(specificationResponse);

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>> relationshipsResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>>(HttpStatusCode.BadRequest);

            IDatasetsApiClient datasetsApiClient = CreateDatasetApiClient();
            datasetsApiClient
                .GetDatasetSpecificationRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(relationshipsResponse);

            ILogger logger = CreateLogger();

            SpecificationRelationshipsPageModel pageModel = CreatePageModel(specsApiClient, datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            // Assert
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
                .Error($"Failed to fetch specification relationships for specification id: {specificationId}");

            logger
                .Received(1)
                .Error($"A null view model was returned");
        }

        [TestMethod]
        public async Task SpecificationRelationshipsPageModel_GivenDatasetRelationshipsResponseReturnsOKButNullContent_ReturnsStatusCode500()
        {
            // Arrange
            string specificationId = Guid.NewGuid().ToString();

            SpecificationSummary specification = new SpecificationSummary
            {
                Id = specificationId
            };

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(specificationResponse);

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>> relationshipsResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>>(HttpStatusCode.OK);

            IDatasetsApiClient datasetsApiClient = CreateDatasetApiClient();
            datasetsApiClient
                .GetDatasetSpecificationRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(relationshipsResponse);

            ILogger logger = CreateLogger();

            SpecificationRelationshipsPageModel pageModel = CreatePageModel(specsApiClient, datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            // Assert
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
                .Error($"Failed to fetch specification relationships for specification id: {specificationId}");

            logger
                .Received(1)
                .Error($"A null view model was returned");
        }

        [TestMethod]
        public async Task SpecificationRelationshipsPageModel_GivenDatasetRelationshipsResponseReturnsOKWithContent_ReturnsPage()
        {
            // Arrange
            string specificationId = Guid.NewGuid().ToString();

            SpecificationSummary specification = new SpecificationSummary
            {
                Id = specificationId
            };

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            specsApiClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(specificationResponse);

            IEnumerable<DatasetSpecificationRelationshipModel> relationships = new[]
            {
                new DatasetSpecificationRelationshipModel
                {
                    DatasetId = "any-ds-id",
                    DatasetName = "any ds name",
                    RelationshipDescription = "any relationship description",
                    Definition = new SpecificationDataDefinitionRelationshipModel
                    {
                        Id = "def-id",
                        Name = "def name",
                        Description = "def desc"
                    },
                    Version = 1,
                    Id = "rel-id",
                    Name = "rel name"
                }
            };

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>> relationshipsResponse = new ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>>(HttpStatusCode.OK, relationships);

            IDatasetsApiClient datasetsApiClient = CreateDatasetApiClient();
            datasetsApiClient
                .GetDatasetSpecificationRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(relationshipsResponse);

            ILogger logger = CreateLogger();

            SpecificationRelationshipsPageModel pageModel = CreatePageModel(specsApiClient, datasetsApiClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .ShowSuccessMessage
                .Should()
                .BeFalse();

            pageModel
                .ViewModel
                .Items
                .Count()
                .Should()
                .Be(1);

            pageModel
                .ViewModel
                .Items
                .First()
                .DatasetId
                .Should()
                .Be("any-ds-id");

            pageModel
                .ViewModel
                .Items
                .First()
                .DatasetName
                .Should()
                .Be("any ds name");

            pageModel
                .ViewModel
                .Items
                .First()
                .RelationshipDescription
                .Should()
                .Be("any relationship description");

            pageModel
                 .ViewModel
                 .Items
                 .First()
                 .DatasetVersion
                 .Should()
                 .Be(1);

            pageModel
                .ViewModel
                .Items
                .First()
                .RelationshipId
                .Should()
                .Be("rel-id");
        }

        private static SpecificationRelationshipsPageModel CreatePageModel(
            ISpecsApiClient specsApiClient = null, 
            IDatasetsApiClient datasetsApiClient = null, 
            ILogger logger = null,
            IMapper mapper = null)
        {
            return new SpecificationRelationshipsPageModel(
                specsApiClient ?? CreateSpecsApiClient(), 
                datasetsApiClient ?? CreateDatasetApiClient(),
                logger ?? CreateLogger(),
                mapper ?? MappingHelper.CreateFrontEndMapper());
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IDatasetsApiClient CreateDatasetApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }
    }
}
