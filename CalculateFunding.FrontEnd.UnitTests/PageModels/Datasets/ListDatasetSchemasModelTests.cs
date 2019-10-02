// <copyright file="ListDatasetSchemasModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>
namespace CalculateFunding.Frontend.PageModels.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using Common.ApiClient.Models;
    using Common.Models;
    using Common.ApiClient.Policies.Models;
    using Common.ApiClient.Specifications;
    using Common.ApiClient.Specifications.Models;
    using Clients.DatasetsClient.Models;
    using Helpers;
    using Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Datasets;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class ListDatasetSchemasModelTests
    {
        [TestMethod]
        public async Task ListDatasetSchemasModel_OnGet_WhenDatasetsFound_ThenResultsReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string specificationId = "10";

            Specification specification = new Specification()
            {
                Id = specificationId
            };

            specsClient
            .GetSpecification(specificationId)
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            List<DatasetSchemasAssigned> datasetSchemasAssigned = new List<DatasetSchemasAssigned>()
            {
                new DatasetSchemasAssigned()
                {
                    Id = "ds1",
                    Name = "Dataset Schema 1",
                    IsSetAsProviderData = false,
                    DatasetDefinition = new Reference("1234", "Definition 1234"),
                    Description = "Datasets Schema 1 Description",
                    UsedInDataAggregations = false,
                },
                new DatasetSchemasAssigned()
                {
                    Id = "ds2",
                    Name = "Dataset Schema Two",
                    Description = "Datasets Schema Two Description",
                    IsSetAsProviderData = false,
                    DatasetDefinition = new Reference("2345", "Definition 2345"),
                },
                new DatasetSchemasAssigned()
                {
                    Id = "ds3",
                    Name = "Dataset Schema 3",
                    IsSetAsProviderData = false,
                    DatasetDefinition =  new Reference("5555", "Definition Grouped"),
                } ,
                new DatasetSchemasAssigned()
                {
                    Id = "ds4",
                    Name = "Grouped with same schema",
                    IsSetAsProviderData = false,
                    DatasetDefinition = new Reference("5555", "Definition Grouped"),
                },
                new DatasetSchemasAssigned()
                {
                    Id = "providerDs",
                    Name = "Provider Dataset",
                    IsSetAsProviderData = true,
                    DatasetDefinition = new Reference("5678", "Provider Dataset Definition"),
                }
            };

            datasetClient
                .GetAssignedDatasetSchemasForSpecification(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssigned.AsEnumerable()));

            ListDatasetSchemasModel listDatasetSchemasPageModel = new ListDatasetSchemasModel(specsClient, datasetClient, mapper);

            // Act
            IActionResult result = await listDatasetSchemasPageModel.OnGet(specificationId);

            // Assert
            result.Should().BeOfType<PageResult>()
                .Which.Should().NotBeNull();

            listDatasetSchemasPageModel.Specification.Should().NotBeNull();
            listDatasetSchemasPageModel.DatasetDefinitions.Should().NotBeNull();

            List<AssignedDataDefinitionToSpecificationViewModel> expectedDatasets = new List<AssignedDataDefinitionToSpecificationViewModel>
            {
                new AssignedDataDefinitionToSpecificationViewModel()
                {
                    Id = datasetSchemasAssigned[0].DatasetDefinition.Id,
                    Name = datasetSchemasAssigned[0].DatasetDefinition.Name,
                    Datasets = new List<AssignedDatasetViewModel>()
                    {
                         new AssignedDatasetViewModel()
                         {
                            Id = datasetSchemasAssigned[0].Id,
                            Name= datasetSchemasAssigned[0].Name,
                            Description = datasetSchemasAssigned[0].Description,
                            IsSetAsProviderData = false
                         }
                    },
                },

                new AssignedDataDefinitionToSpecificationViewModel()
                {
                    Id = datasetSchemasAssigned[1].DatasetDefinition.Id,
                    Name = datasetSchemasAssigned[1].DatasetDefinition.Name,
                    Datasets = new List<AssignedDatasetViewModel>()
                    {
                         new AssignedDatasetViewModel()
                         {
                            Id = datasetSchemasAssigned[1].Id,
                            Name= datasetSchemasAssigned[1].Name,
                            Description = datasetSchemasAssigned[1].Description,
                            IsSetAsProviderData = false,
                         }
                    },
                },
                new AssignedDataDefinitionToSpecificationViewModel()
                {
                    Id = datasetSchemasAssigned[2].DatasetDefinition.Id,
                    Name = datasetSchemasAssigned[2].DatasetDefinition.Name,
                    Datasets = new List<AssignedDatasetViewModel>()
                {
                     new AssignedDatasetViewModel()
                     {
                        Id = datasetSchemasAssigned[2].Id,
                        Name= datasetSchemasAssigned[2].Name,
                        Description = datasetSchemasAssigned[2].Description,
                        IsSetAsProviderData = false
                     },
                     new AssignedDatasetViewModel()
                     {
                        Id = datasetSchemasAssigned[3].Id,
                        Name= datasetSchemasAssigned[3].Name,
                        Description = datasetSchemasAssigned[3].Description,
                        IsSetAsProviderData = false
                     }
                },
                },

                new AssignedDataDefinitionToSpecificationViewModel()
                {
                    Id = datasetSchemasAssigned[4].DatasetDefinition.Id,
                    Name = datasetSchemasAssigned[4].DatasetDefinition.Name,
                    Datasets = new List<AssignedDatasetViewModel>()
                {
                     new AssignedDatasetViewModel()
                     {
                        Id = datasetSchemasAssigned[4].Id,
                        Name= datasetSchemasAssigned[4].Name,
                        Description = datasetSchemasAssigned[4].Description,
                        IsSetAsProviderData = true
                     }
                },
                }
            };


            listDatasetSchemasPageModel.DatasetDefinitions.Should()
                .BeEquivalentTo(expectedDatasets);
        }

        [TestMethod]
        public async Task ListDatasetSchemasModel_OnGet_WhenProviderDatasetsIsPresent_ThenHasProviderDatasetsAssignedIsTrue()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string specificationId = "10";

            Specification specification = new Specification()
            {
                Id = specificationId
            };

            specsClient
            .GetSpecification(specificationId)
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            List<DatasetSchemasAssigned> datasetSchemasAssigned = new List<DatasetSchemasAssigned>()
            {
                new DatasetSchemasAssigned()
                {
                    Id = "ds1",
                    Name = "Dataset Schema 1",
                    IsSetAsProviderData = false,
                    DatasetDefinition = new Reference("1234", "Definition 1234"),
                    Description = "Datasets Schema 1 Description",
                    UsedInDataAggregations = false,
                },
                new DatasetSchemasAssigned()
                {
                    Id = "providerDs",
                    Name = "Provider Dataset",
                    IsSetAsProviderData = true,
                    DatasetDefinition = new Reference("5678", "Provider Dataset Definition"),
                }
            };

            datasetClient
                .GetAssignedDatasetSchemasForSpecification(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssigned.AsEnumerable()));

            ListDatasetSchemasModel listDatasetSchemasPageModel = new ListDatasetSchemasModel(specsClient, datasetClient, mapper);

            // Act
            IActionResult result = await listDatasetSchemasPageModel.OnGet(specificationId);

            // Assert
            result.Should().BeOfType<PageResult>()
                .Which.Should().NotBeNull();

            listDatasetSchemasPageModel.DatasetDefinitions.Should().NotBeNull();

            listDatasetSchemasPageModel.HasProviderDatasetsAssigned.Should().BeTrue();
        }

        [TestMethod]
        public async Task ListDatasetSchemasModel_OnGet_WhenProviderDatasetsIsNotPresent_ThenHasProviderDatasetsAssignedIsFalse()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string specificationId = "10";

            Specification specification = new Specification()
            {
                Id = specificationId
            };

            specsClient
            .GetSpecification(specificationId)
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            List<DatasetSchemasAssigned> datasetSchemasAssigned = new List<DatasetSchemasAssigned>()
            {
                new DatasetSchemasAssigned()
                {
                    Id = "ds1",
                    Name = "Dataset Schema 1",
                    IsSetAsProviderData = false,
                    DatasetDefinition = new Reference("1234", "Definition 1234"),
                    Description = "Datasets Schema 1 Description",
                    UsedInDataAggregations = false,
                }
            };

            datasetClient
                .GetAssignedDatasetSchemasForSpecification(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, datasetSchemasAssigned.AsEnumerable()));

            ListDatasetSchemasModel listDatasetSchemasPageModel = new ListDatasetSchemasModel(specsClient, datasetClient, mapper);

            // Act
            IActionResult result = await listDatasetSchemasPageModel.OnGet(specificationId);

            // Assert
            result.Should().BeOfType<PageResult>()
                .Which.Should().NotBeNull();

            listDatasetSchemasPageModel.DatasetDefinitions.Should().NotBeNull();

            listDatasetSchemasPageModel.HasProviderDatasetsAssigned.Should().BeFalse();
        }

        [TestMethod]
        public async Task ListDatasetSchemasModel_OnGet_WhenSpecificationIdIsNullThenNotFoundReturned()
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
            result.Should().BeOfType<BadRequestObjectResult>().Which.Value.Should().Be("Select a specification");
        }

        [TestMethod]
        public async Task ListDatasetSchemasModel_OnGet_WhenSpecificationNotFoundThenStatusCodeNotFoundReturned()
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
        public async Task ListDatasetSchemasModel_OnGet_WhenUnableToRetrieveSpecificationThenStatusCode500Returned()
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
        public async Task ListDatasetSchemasModel_OnGet_WhenDatasetSchemasAssignedNotFoundThenNotFoundReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            Specification expectedSpecification = new Specification
            {
                FundingPeriod = new Reference("2018", "17-18"),

                FundingStreams = new List<FundingStream>() { new FundingStream("2018", "18-19"), },

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
