// <copyright file="ListDatasetSchemasModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using CalculateFunding.Common.ApiClient.DataSets;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Pages.Datasets;
using CalculateFunding.Frontend.ViewModels.Datasets;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.PageModels.Datasets
{


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

            List<DatasetSpecificationRelationshipViewModel> datasetSchemasAssigned = new List<DatasetSpecificationRelationshipViewModel>()
            {
                new DatasetSpecificationRelationshipViewModel()
                {
	                Id = "ds1",
	                Name = "Dataset Schema 1",
	                IsProviderData = false,
	                Definition = new DatasetDefinitionViewModel
	                {
		                Id = "1234",
		                Name = "Definition 1234",
	                },
	                RelationshipDescription = "Datasets Schema 1 Description",
                },
                new DatasetSpecificationRelationshipViewModel()
                {
	                Id = "ds2",
	                Name = "Dataset Schema Two",
	                IsProviderData = false,
	                Definition = new DatasetDefinitionViewModel
	                {
		                Id = "2345",
		                Name = "Definition 2345",
	                },
	                RelationshipDescription = "Datasets Schema Two Description",
                },
                new DatasetSpecificationRelationshipViewModel()
                {
	                Id = "ds3",
	                Name = "Dataset Schema 3",
	                IsProviderData = false,
	                Definition = new DatasetDefinitionViewModel
	                {
		                Id = "5555",
		                Name = "Definition Grouped",
	                },
                },
                new DatasetSpecificationRelationshipViewModel()
                {
	                Id = "ds4",
	                Name = "Grouped with same schema",
	                IsProviderData = false,
	                Definition = new DatasetDefinitionViewModel
	                {
		                Id = "5555",
		                Name = "Definition Grouped",
	                },
                },
                new DatasetSpecificationRelationshipViewModel()
                {
	                Id = "providerDs",
	                Name = "Provider Dataset",
	                IsProviderData = true,
	                Definition = new DatasetDefinitionViewModel
	                {
		                Id = "5678",
		                Name = "Provider Dataset Definition",
	                },
                },
            };

            datasetClient
                .GetRelationshipsBySpecificationId(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssigned.AsEnumerable()));

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
                    Id = datasetSchemasAssigned[0].Definition.Id,
                    Name = datasetSchemasAssigned[0].Definition.Name,
                    Datasets = new List<AssignedDatasetViewModel>()
                    {
                         new AssignedDatasetViewModel()
                         {
                            Id = datasetSchemasAssigned[0].Id,
                            Name= datasetSchemasAssigned[0].Name,
                            Description = datasetSchemasAssigned[0].RelationshipDescription,
                            IsSetAsProviderData = false
                         }
                    },
                },

                new AssignedDataDefinitionToSpecificationViewModel()
                {
                    Id = datasetSchemasAssigned[1].Definition.Id,
                    Name = datasetSchemasAssigned[1].Definition.Name,
                    Datasets = new List<AssignedDatasetViewModel>()
                    {
                         new AssignedDatasetViewModel()
                         {
                            Id = datasetSchemasAssigned[1].Id,
                            Name= datasetSchemasAssigned[1].Name,
                            Description = datasetSchemasAssigned[1].RelationshipDescription,
                            IsSetAsProviderData = false,
                         }
                    },
                },
                new AssignedDataDefinitionToSpecificationViewModel()
                {
                    Id = datasetSchemasAssigned[2].Definition.Id,
                    Name = datasetSchemasAssigned[2].Definition.Name,
                    Datasets = new List<AssignedDatasetViewModel>()
                {
                     new AssignedDatasetViewModel()
                     {
                        Id = datasetSchemasAssigned[2].Id,
                        Name= datasetSchemasAssigned[2].Name,
                        Description = datasetSchemasAssigned[2].RelationshipDescription,
                        IsSetAsProviderData = false
                     },
                     new AssignedDatasetViewModel()
                     {
                        Id = datasetSchemasAssigned[3].Id,
                        Name= datasetSchemasAssigned[3].Name,
                        Description = datasetSchemasAssigned[3].RelationshipDescription,
                        IsSetAsProviderData = false
                     }
                },
                },

                new AssignedDataDefinitionToSpecificationViewModel()
                {
                    Id = datasetSchemasAssigned[4].Definition.Id,
                    Name = datasetSchemasAssigned[4].Definition.Name,
                    Datasets = new List<AssignedDatasetViewModel>()
                {
                     new AssignedDatasetViewModel()
                     {
                        Id = datasetSchemasAssigned[4].Id,
                        Name= datasetSchemasAssigned[4].Name,
                        Description = datasetSchemasAssigned[4].RelationshipDescription,
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

            List<DatasetSpecificationRelationshipViewModel> datasetSchemasAssigned = new List<DatasetSpecificationRelationshipViewModel>()
            {
	            new DatasetSpecificationRelationshipViewModel()
	            {
		            Id = "ds15",
		            Name = "Dataset Schema 15",
		            IsProviderData = true,
		            Definition = new DatasetDefinitionViewModel
		            {
			            Id = "12345",
			            Name = "Definition 12345",
		            },
		            RelationshipDescription = "Datasets Schema 1 Description",
	            },
	            new DatasetSpecificationRelationshipViewModel()
	            {
		            Id = "ds16",
		            Name = "Dataset Schema 16",
		            IsProviderData = false,
		            Definition = new DatasetDefinitionViewModel
		            {
			            Id = "12346",
			            Name = "Definition 12346",
		            },
		            RelationshipDescription = "Datasets Schema 1 Description6",
	            },
            };

            datasetClient
                .GetRelationshipsBySpecificationId(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssigned.AsEnumerable()));

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

            List<DatasetSpecificationRelationshipViewModel> datasetSchemasAssigned = new List<DatasetSpecificationRelationshipViewModel>()
            {
	            new DatasetSpecificationRelationshipViewModel()
	            {
		            Id = "ds15",
		            Name = "Dataset Schema 15",
		            IsProviderData = false,
		            Definition = new DatasetDefinitionViewModel
		            {
			            Id = "12345",
			            Name = "Definition 12345",
		            },
		            RelationshipDescription = "Datasets Schema 1 Description",
	            },
            };

            datasetClient
                .GetRelationshipsBySpecificationId(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, datasetSchemasAssigned.AsEnumerable()));

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
            .GetRelationshipsBySpecificationId(expectedSpecificationId)
            .Returns(new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.NotFound, null));

            // Act
            IActionResult result = await listDatasetSchemasPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }
    }
}
