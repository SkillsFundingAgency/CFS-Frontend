// <copyright file="ListDatasetSchemasModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>
namespace CalculateFunding.Frontend.PageModels.Datasets
{
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Datasets;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class ListDatasetSchemasModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenSpecificationIdIsNullThenNotFoundReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = string.Empty;

            Specification expectedSpecification = null;

            specsClient
            .GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.NotFound, expectedSpecification));

            ListDatasetSchemasModel listDatasetSchemasPageModel = new ListDatasetSchemasModel(specsClient, datasetClient, mapper);

            // Act
            IActionResult result = await listDatasetSchemasPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>().Which.Value.Should().Be("The provided specification ID was null or empty string");
        }

        [TestMethod]
        public async Task OnGet_WhenSpecificationNotFoundThenStatusCodeNotFoundReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            Specification expectedSpecification = null;

            specsClient
            .GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.NotFound, expectedSpecification));

            ListDatasetSchemasModel listDatasetSchemasPageModel = new ListDatasetSchemasModel(specsClient, datasetClient, mapper);

            // Act
            IActionResult result = await listDatasetSchemasPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
            NotFoundObjectResult typeResult = result as NotFoundObjectResult;
            typeResult.Value.Should().Be("Specification not found");
        }

        [TestMethod]
        public async Task OnGet_WhenUnableToRetrieveSpecificationThenStatusCode500Returned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            Specification expectedSpecification = null;

            specsClient
            .GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.BadRequest, expectedSpecification));

            ListDatasetSchemasModel listDatasetSchemasPageModel = new ListDatasetSchemasModel(specsClient, datasetClient, mapper);

            // Act
            IActionResult result = await listDatasetSchemasPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<StatusCodeResult>().Which.StatusCode.Should().Be(500);
        }

        [TestMethod]
        public async Task OnGet_WhenDatasetSchemasAssignedNotFoundThenNotFoundReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            Specification expectedSpecification = new Specification
            {
                AcademicYear = new Reference("2018", "17-18"),

                FundingStream = new Reference("2018", "18-19"),

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

            specsClient
            .GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, expectedSpecification));

            ListDatasetSchemasModel listDatasetSchemasPageModel = new ListDatasetSchemasModel(specsClient, datasetClient, mapper);

            datasetClient
            .GetAssignedDatasetSchemasForSpecification(expectedSpecificationId)
            .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.NotFound, null));

            // Act
            IActionResult result = await listDatasetSchemasPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }
    }
}
