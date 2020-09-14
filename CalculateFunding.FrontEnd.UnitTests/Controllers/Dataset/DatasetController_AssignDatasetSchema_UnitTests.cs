using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Controllers;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Serilog;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Datasets;

namespace CalculateFunding.Frontend.UnitTests.Controllers.Dataset
{
    [TestClass]
    public class DatasetController_AssignDatasetSchema_UnitTests
    {
        private DatasetController _sut;
        private Mock<IDatasetsApiClient> _mockDatasetApiClient;
        private Mock<IMapper> _mockMapper;
        private Mock<ILogger> _mockLogger;
        private Mock<ISpecificationsApiClient> _mockSpecificationApiClient;
        private Mock<IAuthorizationHelper> _mockAuthorisationHelper;

        [TestInitialize]
        public void SetUp()
        {
            _mockDatasetApiClient = new Mock<IDatasetsApiClient>();
            _mockSpecificationApiClient = new Mock<ISpecificationsApiClient>();
            _mockAuthorisationHelper = new Mock<IAuthorizationHelper>();
            _mockLogger = new Mock<ILogger>();
            _mockMapper = new Mock<IMapper>();
        }

        [TestMethod]
        public void Should_AssignDatasetSchema_Successfully()
        {
            AssignDatasetSchemaUpdateViewModel data = Builder<AssignDatasetSchemaUpdateViewModel>.CreateNew().Build();
            _mockDatasetApiClient.Setup(x =>
                    x.CreateRelationship(It.IsAny<CreateDefinitionSpecificationRelationshipModel>()))
                .ReturnsAsync(() => new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK,
                    Builder<DefinitionSpecificationRelationship>.CreateNew().Build()));
            _mockDatasetApiClient.Setup(x =>
                x.GetRelationshipBySpecificationIdAndName(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(() =>
                    new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK,
                        Builder<DefinitionSpecificationRelationship>.CreateNew().Build())
                );
            _mockDatasetApiClient.Setup(x =>
                x.GetDatasetDefinitions()).ReturnsAsync(() =>
                new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK,
                    Builder<DatasetDefinition>.CreateListOfSize(10).Build().AsEnumerable())
            );
            _mockSpecificationApiClient.Setup(x => x.GetSpecificationSummaryById(It.IsAny<string>()))
                .ReturnsAsync(() => new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, Builder<SpecificationSummary>.CreateNew().Build())
                    );
            _mockAuthorisationHelper.Setup(x => x.DoesUserHavePermission(It.IsAny<ClaimsPrincipal>(),
                It.IsAny<string>(), It.IsAny<SpecificationActionTypes>())).ReturnsAsync(true);
            ; _sut = new DatasetController(_mockDatasetApiClient.Object, _mockLogger.Object, _mockMapper.Object, _mockSpecificationApiClient.Object, _mockAuthorisationHelper.Object);
            _mockMapper.Setup(x => x.Map<CreateDefinitionSpecificationRelationshipModel>(data))
                .Returns(Builder<CreateDefinitionSpecificationRelationshipModel>.CreateNew().Build());

            var actual = _sut.AssignDatasetSchema(data, "XZY098");

            actual.Should().NotBeNull();
            actual.Result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public void Should_AssignDatasetSchema_NoPermissions_Failure()
        {
            AssignDatasetSchemaUpdateViewModel data = Builder<AssignDatasetSchemaUpdateViewModel>.CreateNew().Build();
            _mockDatasetApiClient.Setup(x =>
                    x.CreateRelationship(It.IsAny<CreateDefinitionSpecificationRelationshipModel>()))
                .ReturnsAsync(() => new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK,
                    Builder<DefinitionSpecificationRelationship>.CreateNew().Build()));
            _mockDatasetApiClient.Setup(x =>
                x.GetRelationshipBySpecificationIdAndName(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(() =>
                    new ApiResponse<DefinitionSpecificationRelationship>(HttpStatusCode.OK,
                        Builder<DefinitionSpecificationRelationship>.CreateNew().Build())
                );
            _mockDatasetApiClient.Setup(x =>
                x.GetDatasetDefinitions()).ReturnsAsync(() =>
                new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK,
                    Builder<DatasetDefinition>.CreateListOfSize(10).Build().AsEnumerable())
            );
            _mockSpecificationApiClient.Setup(x => x.GetSpecificationSummaryById(It.IsAny<string>()))
                .ReturnsAsync(() => new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, Builder<SpecificationSummary>.CreateNew().Build())
                    );
            _mockAuthorisationHelper.Setup(x => x.DoesUserHavePermission(It.IsAny<ClaimsPrincipal>(),
                It.IsAny<string>(), It.IsAny<SpecificationActionTypes>())).ReturnsAsync(false);
            ; _sut = new DatasetController(_mockDatasetApiClient.Object, _mockLogger.Object, _mockMapper.Object, _mockSpecificationApiClient.Object, _mockAuthorisationHelper.Object);
            _mockMapper.Setup(x => x.Map<CreateDefinitionSpecificationRelationshipModel>(data))
                .Returns(Builder<CreateDefinitionSpecificationRelationshipModel>.CreateNew().Build());

            var actual = _sut.AssignDatasetSchema(data, "XZY098");

            actual.Should().NotBeNull();
            actual.Result.Should().BeOfType<ForbidResult>();
        }
    }
}
