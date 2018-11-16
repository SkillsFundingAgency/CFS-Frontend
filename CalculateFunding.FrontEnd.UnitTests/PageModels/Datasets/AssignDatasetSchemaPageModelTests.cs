// <copyright file="AssignDatasetSchemaPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Datasets
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Datasets;
    using CalculateFunding.Frontend.UnitTests.Helpers;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class AssignDatasetSchemaPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenSpecificationIdDoesNotExistThenBadRequestReturned()
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

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            // Act
            IActionResult result = await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>().Which.Value.Should().Be("Select a specification");
        }

        [TestMethod]
        public async Task OnGet_WhenSpecificationExistsThenSpecificationReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            SpecificationSummary expectedSpecification = new SpecificationSummary
            {
                FundingPeriod = new Reference("2018", "17-18"),

                FundingStreams = new List<Reference>() { new Reference("2018", "18-19"), },

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            specsClient
            .GetSpecificationSummary(expectedSpecificationId)
            .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            DatasetDefinition d1 = new DatasetDefinition()
            {
                Id = "1",
                Name = "APT Final Baselines",
                Description = "Local Authority return of provider baselines",
            };

            DatasetDefinition d2 = new DatasetDefinition()
            {
                Id = "2",
                Name = "School Provider Dataset",
                Description = "List of providers",
            };

            IEnumerable<DatasetDefinition> dataDefn = new List<DatasetDefinition> { d1, d2 };

            datasetClient
                .GetDataDefinitions()
                .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, dataDefn));

            // Act
            IActionResult result = await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();

            datasetSchemaPageModel.SpecificationDescription.Should().Be(expectedSpecification.Description);
            datasetSchemaPageModel.SpecificationId.Should().Be(expectedSpecification.Id);
            datasetSchemaPageModel.SpecificationName.Should().Be(expectedSpecification.Name);
            datasetSchemaPageModel.FundingPeriodId.Should().Be(expectedSpecification.FundingPeriod.Id);
            datasetSchemaPageModel.FundingPeriodName.Should().Be(expectedSpecification.FundingPeriod.Name);

            List<SelectListItem> datasetDefinition = new List<SelectListItem>(datasetSchemaPageModel.Datasets);

            datasetDefinition[0].Value.Should().Be(d1.Id);
            datasetDefinition[0].Text.Should().Be(d1.Name);
            datasetDefinition[1].Value.Should().Be(d2.Id);
            datasetDefinition[1].Text.Should().Be(d2.Name);
        }

        [TestMethod]
        public async Task OnGet_WhenSpecificationStatusCodeIsNotFoundThenNotFoundObjectResultReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            Specification expectedSpecification = null;

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            specsClient
            .GetSpecification(expectedSpecificationId)
            .Returns(new ApiResponse<Specification>(HttpStatusCode.NotFound, expectedSpecification));

            DatasetDefinition d1 = new DatasetDefinition()
            {
                Id = "1",
                Name = "APT Final Baselines",
                Description = "Local Authority return of provider baselines",
            };

            DatasetDefinition d2 = new DatasetDefinition()
            {
                Id = "2",
                Name = "School Provider Dataset",
                Description = "List of providers",
            };

            IEnumerable<DatasetDefinition> dataDefn = new List<DatasetDefinition> { d1, d2 };

            datasetClient
                .GetDataDefinitions()
                .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, dataDefn));

            // Act
            IActionResult result = await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
            NotFoundObjectResult typeResult = result as NotFoundObjectResult;
            typeResult.Value.Should().Be("Unable to get specification response. Specification Id value = 1");
            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public void OnGet_WhenSpecificationContentIsNullThenInvalidOperationExpectionIsReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            SpecificationSummary expectedSpecification = null;

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            specsClient
            .GetSpecificationSummary(expectedSpecificationId)
            .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            DatasetDefinition d1 = new DatasetDefinition()
            {
                Id = "1",
                Name = "APT Final Baselines",
                Description = "Local Authority return of provider baselines",
            };

            DatasetDefinition d2 = new DatasetDefinition()
            {
                Id = "2",
                Name = "School Provider Dataset",
                Description = "List of providers",
            };

            IEnumerable<DatasetDefinition> dataDefn = new List<DatasetDefinition> { d1, d2 };

            datasetClient
                .GetDataDefinitions()
                .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, dataDefn));

            // Act
            Func<Task> test = async () => await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            test.Should().ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task OnGet_WhenDatasetResponseIsNullThenNotObjectFoundResultIsReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            SpecificationSummary expectedSpecification = new SpecificationSummary
            {
                FundingPeriod = new Reference("2018", "17-18"),

                FundingStreams = new List<Reference>() { new Reference("2018", "18-19"), },

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            specsClient
            .GetSpecificationSummary(expectedSpecificationId)
            .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IEnumerable<DatasetDefinition> dataDefn = null;

            datasetClient
                .GetDataDefinitions()
                .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.NotFound, dataDefn));

            // Act
            IActionResult result = await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();

            result.Should().BeOfType<NotFoundObjectResult>();

            NotFoundObjectResult typeResult = result as NotFoundObjectResult;

            typeResult.Value.Should().Be("Check the data schema - one or more the data definitions aren't working");
        }

        [TestMethod]
        public void OnGet_WhenDatasetDefinitionIsNullThenInvalidOperationExpectionIsReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            SpecificationSummary expectedSpecification = new SpecificationSummary
            {
                FundingPeriod = new Reference("2018", "17-18"),

                FundingStreams = new List<Reference>() { new Reference("2018", "18-19"), },

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

           // InvalidOperationException expectedException = null;
            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            specsClient
            .GetSpecificationSummary(expectedSpecificationId)
            .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IEnumerable<DatasetDefinition> dataDefn = null;

            datasetClient
                .GetDataDefinitions()
                .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, dataDefn));

            // Act
            Func<Task> test = async () => await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            test.Should().ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task OnGet_WhenDatasetDefinitionExistsThenDatasetsReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            SpecificationSummary expectedSpecification = new SpecificationSummary
            {
                FundingPeriod = new Reference("2018", "17-18"),

                FundingStreams = new List<Reference>() { new Reference("2018", "18-19"), },

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            specsClient
                .GetSpecificationSummary(expectedSpecificationId)
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            DatasetDefinition d1 = new DatasetDefinition()
            {
                Id = "1",
                Name = "APT Final Baselines",
                Description = "Local Authority return of provider baselines",
            };

            DatasetDefinition d2 = new DatasetDefinition()
            {
                Id = "2",
                Name = "School Provider Dataset",
                Description = "List of providers",
            };

            IEnumerable<DatasetDefinition> dataDefn = new List<DatasetDefinition> { d1, d2 };

            datasetClient
                .GetDataDefinitions()
                .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, dataDefn));

            // Act
            IActionResult result = await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().NotBeNull();
            datasetSchemaPageModel.Datasets.Should().HaveCount(2);

            List<SelectListItem> datasetDefinition = new List<SelectListItem>(datasetSchemaPageModel.Datasets);

            datasetDefinition[0].Value.Should().Be(d1.Id);
            datasetDefinition[0].Text.Should().Be(d1.Name);
            datasetDefinition[1].Value.Should().Be(d2.Id);
            datasetDefinition[1].Text.Should().Be(d2.Name);
        }

        [TestMethod]
        public async Task OnGet_WhenUserDoesNotHaveEditSpecificationPermission_ThenReturn403()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            string expectedSpecificationId = "spec123";

            SpecificationSummary expectedSpecification = new SpecificationSummary();

            specsClient
                .GetSpecificationSummary(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: specsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        private static AssignDatasetSchemaPageModel CreatePageModel(ISpecsApiClient specsClient = null, IDatasetsApiClient datasetsClient = null, IMapper mapper = null, IAuthorizationHelper authorizationHelper = null)
        {
            AssignDatasetSchemaPageModel pageModel = new AssignDatasetSchemaPageModel(
                specsClient ?? CreateApiClient(),
                datasetsClient ?? CreateDatasetsApiClient(),
                mapper ?? CreateMapper(), 
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(Common.Identity.Authorization.Models.SpecificationActionTypes.CanEditSpecification));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();

            return pageModel;
        }

        private static ISpecsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IDatasetsApiClient CreateDatasetsApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }
    }
}
