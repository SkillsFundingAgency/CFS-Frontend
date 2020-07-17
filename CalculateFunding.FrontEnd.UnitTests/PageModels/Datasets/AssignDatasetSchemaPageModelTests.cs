// <copyright file="AssignDatasetSchemaPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using CalculateFunding.Common.ApiClient.DataSets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Pages.Datasets;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels.Datasets;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.PageModels.Datasets
{
    [TestClass]
    public class AssignDatasetSchemaPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenSpecificationIdDoesNotExistThenBadRequestReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();

            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = string.Empty;

            SpecificationSummary expectedSpecification = null;

            specsClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound, expectedSpecification));

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

            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();

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
            .GetSpecificationSummaryById(expectedSpecificationId)
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
                .GetDatasetDefinitions()
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
            datasetSchemaPageModel.IsAuthorizedToEdit.Should().BeTrue();

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

            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            SpecificationSummary expectedSpecification = null;

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            specsClient
            .GetSpecificationSummaryById(expectedSpecificationId)
            .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound, expectedSpecification));

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
                .GetDatasetDefinitions()
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

            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string expectedSpecificationId = "1";

            SpecificationSummary expectedSpecification = null;

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient, datasetClient, mapper);

            specsClient
            .GetSpecificationSummaryById(expectedSpecificationId)
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
                .GetDatasetDefinitions()
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

            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();

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
            .GetSpecificationSummaryById(expectedSpecificationId)
            .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IEnumerable<DatasetDefinition> dataDefn = null;

            datasetClient
                .GetDatasetDefinitions()
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

            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();

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
            .GetSpecificationSummaryById(expectedSpecificationId)
            .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IEnumerable<DatasetDefinition> dataDefn = null;

            datasetClient
                .GetDatasetDefinitions()
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

            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();

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
                .GetSpecificationSummaryById(expectedSpecificationId)
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
                .GetDatasetDefinitions()
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
        public async Task OnGet_WhenUserDoesNotHaveEditSpecificationPermission_ThenReturnPageResultWithAuthorizedToEditFlagSetToFalse()
        {
            // Arrange
            string anyString = "anyString";

            string expectedSpecificationId = "spec123";

            SpecificationSummary expectedSpecification = new SpecificationSummary()
            {
                FundingPeriod = new Reference(anyString, anyString),
                Name = anyString,
                Description = anyString
            };

            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            specsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
                .GetDatasetDefinitions()
                .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, GetDummyDataDefinitions()));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: specsClient, authorizationHelper: authorizationHelper, datasetsClient: mockDatasetsApiClient);

            // Act
            IActionResult result = await datasetSchemaPageModel.OnGet(expectedSpecificationId);

            // Assert
            result
                .Should().BeOfType<PageResult>();

            datasetSchemaPageModel
                .IsAuthorizedToEdit
                .Should().BeFalse();
        }

        [TestMethod]
        public async Task OnPost_WhenValidDetailsAreProvided_ShoulReturnCorrectRedirect()
        {
            // Arrange
            string anyString = "anyString";

            string expectedSpecificationId = "spec123";

            SpecificationSummary expectedSpecification = new SpecificationSummary()
            {
                FundingPeriod = new Reference(anyString, anyString),
                Name = anyString,
                Description = anyString
            };

            ISpecificationsApiClient mockSpecsClient = Substitute.For<ISpecificationsApiClient>();
            mockSpecsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
                .GetDatasetDefinitions()
                .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, GetDummyDataDefinitions()));
            mockDatasetsApiClient
                .CreateRelationship(Arg.Any<CreateDefinitionSpecificationRelationshipModel>())
                .Returns(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK));

            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: mockSpecsClient,
                authorizationHelper: mockAuthorizationHelper, datasetsClient: mockDatasetsApiClient, mapper: MappingHelper.CreateFrontEndMapper());
            datasetSchemaPageModel.AssignDatasetSchemaViewModel = new AssignDatasetSchemaViewModel();

            // Act
            IActionResult result = await datasetSchemaPageModel.OnPostAsync(expectedSpecificationId);

            // Assert
            result
                .Should().BeOfType<RedirectResult>()
                .Subject
                .Url
                .Should().EndWith($"datasets/ListDatasetSchemas/{expectedSpecificationId}");
        }

        [TestMethod]
        public async Task OnPost_WhenModelIsInvalidAndSpecificationNotFound_ShoulReturnNotFoundResult()
        {
            // Arrange
            string anyString = "anyString";

            string expectedSpecificationId = "spec123";

            SpecificationSummary expectedSpecification = new SpecificationSummary()
            {
                FundingPeriod = new Reference(anyString, anyString),
                Name = anyString,
                Description = anyString
            };

            ISpecificationsApiClient mockSpecsClient = Substitute.For<ISpecificationsApiClient>();
            mockSpecsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
	            .GetDatasetDefinitions()
	            .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, GetDummyDataDefinitions()));
            mockDatasetsApiClient
	            .CreateRelationship(Arg.Any<CreateDefinitionSpecificationRelationshipModel>())
	            .Returns(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK));

            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: mockSpecsClient,
                authorizationHelper: mockAuthorizationHelper, datasetsClient: mockDatasetsApiClient, mapper: MappingHelper.CreateFrontEndMapper());
            datasetSchemaPageModel.AssignDatasetSchemaViewModel = new AssignDatasetSchemaViewModel();
            datasetSchemaPageModel.ModelState.AddModelError(anyString, anyString);

            // Act
            IActionResult result = await datasetSchemaPageModel.OnPostAsync(expectedSpecificationId);

            // Assert
            result
                .Should().BeOfType<NotFoundObjectResult>()
                .Which
                .Value
                .Should().Be($"Unable to get specification response. Specification Id value = {expectedSpecificationId}");
        }

        [TestMethod]
        public void OnPost_WhenModelIsInvalidAndSpecificationFoundWithNullResponse_ShouldThrowInvalidOperationException()
        {
            // Arrange
            string anyString = "anyString";

            string expectedSpecificationId = "spec123";

            ISpecificationsApiClient mockSpecsClient = Substitute.For<ISpecificationsApiClient>();
            mockSpecsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
	            .GetDatasetDefinitions()
	            .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, GetDummyDataDefinitions()));
            mockDatasetsApiClient
	            .CreateRelationship(Arg.Any<CreateDefinitionSpecificationRelationshipModel>())
	            .Returns(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK));


            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: mockSpecsClient,
                authorizationHelper: mockAuthorizationHelper, datasetsClient: mockDatasetsApiClient, mapper: MappingHelper.CreateFrontEndMapper());
            datasetSchemaPageModel.AssignDatasetSchemaViewModel = new AssignDatasetSchemaViewModel();
            datasetSchemaPageModel.ModelState.AddModelError(anyString, anyString);

            // Act
            Func<Task<IActionResult>> postAction = async () => await datasetSchemaPageModel.OnPostAsync(expectedSpecificationId);

            // Assert
            postAction
                .Should()
                .Throw<InvalidOperationException>()
                .Which
                .Message
                .Should().Be(
                    $"Unable to retrieve specification model from the response. Specification Id value = {expectedSpecificationId}");
        }

        [TestMethod]
        public async Task OnPost_WhenModelIsInvalidAndDataDefinitionsNotReturnedCorrectly_ShoulReturnNotFoundObjectResult()
        {
            // Arrange
            string anyString = "anyString";

            string expectedSpecificationId = "spec123";

            SpecificationSummary expectedSpecification = new SpecificationSummary()
            {
                FundingPeriod = new Reference(anyString, anyString),
                Name = anyString,
                Description = anyString
            };

            ISpecificationsApiClient mockSpecsClient = Substitute.For<ISpecificationsApiClient>();
            mockSpecsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
	            .GetDatasetDefinitions()
	            .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.NotFound));
            mockDatasetsApiClient
	            .CreateRelationship(Arg.Any<CreateDefinitionSpecificationRelationshipModel>())
	            .Returns(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK));


            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: mockSpecsClient,
                authorizationHelper: mockAuthorizationHelper, datasetsClient: mockDatasetsApiClient, mapper: MappingHelper.CreateFrontEndMapper());
            datasetSchemaPageModel.AssignDatasetSchemaViewModel = new AssignDatasetSchemaViewModel();
            datasetSchemaPageModel.ModelState.AddModelError(anyString, anyString);

            // Act
            IActionResult result = await datasetSchemaPageModel.OnPostAsync(expectedSpecificationId);

            // Assert
            result
                .Should().BeOfType<NotFoundObjectResult>()
                .Which
                .Value
                .Should().Be("Check the data schema - one or more the data definitions aren't working");
        }

        [TestMethod]
        public void OnPost_WhenModelIsInvalidAndDatasetDefinitionListReturnedIsNull_ShoulThrowInvalidOperationException()
        {
            // Arrange
            string anyString = "anyString";

            string expectedSpecificationId = "spec123";

            SpecificationSummary expectedSpecification = new SpecificationSummary()
            {
                FundingPeriod = new Reference(anyString, anyString),
                Name = anyString,
                Description = anyString
            };

            ISpecificationsApiClient mockSpecsClient = Substitute.For<ISpecificationsApiClient>();
            mockSpecsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
	            .GetDatasetDefinitions()
	            .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK));
            mockDatasetsApiClient
	            .CreateRelationship(Arg.Any<CreateDefinitionSpecificationRelationshipModel>())
	            .Returns(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK));

            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: mockSpecsClient,
                authorizationHelper: mockAuthorizationHelper, datasetsClient: mockDatasetsApiClient, mapper: MappingHelper.CreateFrontEndMapper());
            datasetSchemaPageModel.AssignDatasetSchemaViewModel = new AssignDatasetSchemaViewModel();
            datasetSchemaPageModel.ModelState.AddModelError(anyString, anyString);

            // Act
            Func<Task<IActionResult>> postAction = async () => await datasetSchemaPageModel.OnPostAsync(expectedSpecificationId);

            // Assert
            postAction
                .Should()
                .Throw<InvalidOperationException>()
                .Which
                .Message
                .Should().Be(
                    $"Unable to retrieve Dataset definition from the response. Specification Id value = {expectedSpecificationId}");
        }

        [TestMethod]
        public async Task OnPost_WhenModelIsInvalidButSpecResponseAndDatasetDefinitionsResponseIsOk_ShouldReturnPage()
        {
            // Arrange
            const string anyString = "any";
            string expectedSpecificationId = "spec123";
            const string fundingPeriodId = "2018";
            const string fundingPeriodName = "1819";

            const string specificationName = "Pe and sports spec";
            const string specDescription = "test spec";

            SpecificationSummary expectedSpecification = new SpecificationSummary()
            {
                FundingPeriod = new Reference(fundingPeriodId, fundingPeriodName),
                Name = specificationName,
                Description = specDescription
            };

            ISpecificationsApiClient mockSpecsClient = Substitute.For<ISpecificationsApiClient>();
            mockSpecsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
	            .GetDatasetDefinitions()
	            .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, GetDummyDataDefinitions()));
            mockDatasetsApiClient
	            .CreateRelationship(Arg.Any<CreateDefinitionSpecificationRelationshipModel>())
	            .Returns(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK));

            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: mockSpecsClient,
                authorizationHelper: mockAuthorizationHelper, datasetsClient: mockDatasetsApiClient, mapper: MappingHelper.CreateFrontEndMapper());
            datasetSchemaPageModel.AssignDatasetSchemaViewModel = new AssignDatasetSchemaViewModel();
            datasetSchemaPageModel.ModelState.AddModelError(anyString, anyString);

            // Act
            IActionResult result = await datasetSchemaPageModel.OnPostAsync(expectedSpecificationId);

            // Assert
            result
                .Should().BeOfType<PageResult>();

            datasetSchemaPageModel
                .SpecificationName
                .Should().Be(specificationName);

            datasetSchemaPageModel
                .SpecificationDescription
                .Should().Be(specDescription);

            datasetSchemaPageModel
                .FundingPeriodId
                .Should().Be(fundingPeriodId);

            datasetSchemaPageModel
                .FundingPeriodName
                .Should().Be(fundingPeriodName);

            datasetSchemaPageModel
                .Datasets
                .Count()
                .Should().Be(2);

            datasetSchemaPageModel
                .IsAuthorizedToEdit
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task OnPost_WhenModelIsInvalidAndUserIsUnauthorizedToEditSpecification_ShouldReturnForbidResult()
        {
            // Arrange
            const string anyString = "any";
            string expectedSpecificationId = "spec123";
            const string fundingPeriodId = "2018";
            const string fundingPeriodName = "1819";

            const string specificationName = "Pe and sports spec";
            const string specDescription = "test spec";

            SpecificationSummary expectedSpecification = new SpecificationSummary()
            {
                FundingPeriod = new Reference(fundingPeriodId, fundingPeriodName),
                Name = specificationName,
                Description = specDescription
            };

            ISpecificationsApiClient mockSpecsClient = Substitute.For<ISpecificationsApiClient>();
            mockSpecsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
	            .GetDatasetDefinitions()
	            .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, GetDummyDataDefinitions()));
            mockDatasetsApiClient
	            .CreateRelationship(Arg.Any<CreateDefinitionSpecificationRelationshipModel>())
	            .Returns(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK));

            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: mockSpecsClient,
                authorizationHelper: mockAuthorizationHelper, datasetsClient: mockDatasetsApiClient, mapper: MappingHelper.CreateFrontEndMapper());
            datasetSchemaPageModel.AssignDatasetSchemaViewModel = new AssignDatasetSchemaViewModel();
            datasetSchemaPageModel.ModelState.AddModelError(anyString, anyString);

            // Act
            IActionResult result = await datasetSchemaPageModel.OnPostAsync(expectedSpecificationId);

            // Assert
            result
                .Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        public async Task OnPost_WhenModelIsInvalidShouldPopulate_ShoulReturnCorrectRedirect()
        {
            // Arrange
            string anyString = "anyString";

            string expectedSpecificationId = "spec123";

            SpecificationSummary expectedSpecification = new SpecificationSummary()
            {
                FundingPeriod = new Reference(anyString, anyString),
                Name = anyString,
                Description = anyString
            };

            ISpecificationsApiClient mockSpecsClient = Substitute.For<ISpecificationsApiClient>();
            mockSpecsClient
                .GetSpecificationSummaryById(Arg.Is(expectedSpecificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, expectedSpecification));

            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            mockDatasetsApiClient
	            .GetDatasetDefinitions()
	            .Returns(new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, GetDummyDataDefinitions()));
            mockDatasetsApiClient
	            .CreateRelationship(Arg.Any<CreateDefinitionSpecificationRelationshipModel>())
	            .Returns(new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK));

            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);

            AssignDatasetSchemaPageModel datasetSchemaPageModel = CreatePageModel(specsClient: mockSpecsClient,
                authorizationHelper: mockAuthorizationHelper, datasetsClient: mockDatasetsApiClient, mapper: MappingHelper.CreateFrontEndMapper());
            datasetSchemaPageModel.AssignDatasetSchemaViewModel = new AssignDatasetSchemaViewModel();

            // Act
            IActionResult result = await datasetSchemaPageModel.OnPostAsync(expectedSpecificationId);

            // Assert
            result
                .Should().BeOfType<RedirectResult>()
                .Subject
                .Url
                .Should().EndWith($"datasets/ListDatasetSchemas/{expectedSpecificationId}");
        }


        private static IEnumerable<DatasetDefinition> GetDummyDataDefinitions()
        {
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
            return dataDefn;
        }

        private static AssignDatasetSchemaPageModel CreatePageModel(ISpecificationsApiClient specsClient = null, IDatasetsApiClient datasetsClient = null, IMapper mapper = null, IAuthorizationHelper authorizationHelper = null)
        {
            AssignDatasetSchemaPageModel pageModel = new AssignDatasetSchemaPageModel(
                specsClient ?? CreateApiClient(),
                datasetsClient ?? CreateDatasetsApiClient(),
                mapper ?? CreateMapper(),
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(Common.Identity.Authorization.Models.SpecificationActionTypes.CanEditSpecification));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();

            return pageModel;
        }

        private static ISpecificationsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecificationsApiClient>();
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
