using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Specs;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.PageModels.Specs
{
    [TestClass]
    public class PoliciesPageModelTests
    {
        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenPoliciesAreRequestedForASpecification_ThenResultIsReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";

            Specification specification = new Specification()
            {
                Id = specificationId,
                Name = "Test Specification",
                FundingPeriod = new Reference("1617", "2016/2017"),
                Description = "Test Description",
                FundingStreams = new List<FundingStream>() { new FundingStream("fs1", "Funding Stream Name"), },
                Calculations = new List<Calculation>()
                {
                    new Calculation()
                    {
                        Id ="calc1",
                        Name = "Calculation 1",
                        Description = "Calculation with allocation line",
                        AllocationLine = new Reference("al1", "Allocation Line 1"),
                    },
                    new Calculation()
                    {
                        Id ="calc2",
                        Name = "Calculation Two",
                        Description = "Calculation without allocation line",
                        AllocationLine = null
                    },
                }
            };

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            datasetsApiClient
               .GetAssignedDatasetSchemasForSpecification(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, null, null);

            // Assert
            result.Should().BeOfType<PageResult>();

            SpecificationViewModel expectedResult = new SpecificationViewModel()
            {
                Id = specificationId,
                Name = "Test Specification",
                FundingPeriod = new ReferenceViewModel("1617", "2016/2017"),
                Description = "Test Description",
                FundingStreams = new List<ReferenceViewModel>() { new ReferenceViewModel("fs1", "Funding Stream Name"), },
               
                Calculations = new List<CalculationViewModel>()
                {
                    new CalculationViewModel()
                    {
                        Id ="calc1",
                        Name = "Calculation 1",
                        Description = "Calculation with allocation line",
                        AllocationLine = new ReferenceViewModel("al1", "Allocation Line 1"),
                    },
                    new CalculationViewModel()
                    {
                        Id ="calc2",
                        Name = "Calculation Two",
                        Description = "Calculation without allocation line",
                        AllocationLine = null
                    },
                }
            };

            policiesModel.Specification.Should().BeEquivalentTo(expectedResult, o => o.RespectingRuntimeTypes().WithAutoConversion().WithTracing());
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenSpecificationNotFound_ThenNotFoundReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.NotFound, null));

            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, null, null);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>()
                .Which.Value.Should().Be("Specification not found");
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenDatasetsApiFailed_ThenErrorShouldBeReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification()));

            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.NotFound, null));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, null, null);

            // Assert
            result.Should().BeOfType<ObjectResult>()
                .Which.Value.Should().Be("Datasets Schema API Failed");

            result.Should().BeOfType<ObjectResult>()
                .Which.StatusCode.Should().Be(500);
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenSpecificationsApiFailed_ThenErrorShouldBeReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.InternalServerError, null));

            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, null, null);

            // Assert
            result.Should().BeOfType<ObjectResult>()
                .Which.Value.Should().Be("Specification Lookup API Failed");

            result.Should().BeOfType<ObjectResult>()
                .Which.StatusCode.Should().Be(500);
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenSpecificationsApiFailedReturningNull_ThenErrorShouldBeReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            ILogger logger = CreateLogger();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient, logger);

            string specificationId = "spec123";

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns((ApiResponse<Specification>)null);

            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(specificationId)
                .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, null, null);

            // Assert
            result.Should().BeOfType<ObjectResult>()
                .Which.Value.Should().Be("Specification Lookup API Failed and returned null");

            result.Should().BeOfType<ObjectResult>()
                .Which.StatusCode.Should().Be(500);

            logger
                .Received(1)
                .Warning("Specification API Request came back null for Specification ID = '{specificationId}'", specificationId);
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenDatasetsApiFailedReturningNull_ThenErrorShouldBeReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            ILogger logger = CreateLogger();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient, logger);

            string specificationId = "spec123";

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification()));

            datasetsApiClient
                .GetAssignedDatasetSchemasForSpecification(specificationId)
                .Returns((ApiResponse<IEnumerable<DatasetSchemasAssigned>>)null);

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, null, null);

            // Assert
            result.Should().BeOfType<ObjectResult>()
                .Which.Value.Should().Be("Datasets Lookup API Failed and returned null");

            result.Should().BeOfType<ObjectResult>()
                .Which.StatusCode.Should().Be(500);

            logger
                .Received(1)
                .Warning("Dataset Schema Response API Request came back null for Specification ID = '{specificationId}'", specificationId);
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenOperationTypeIsSpecificationUpdated_ThenBannerPopulated()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";
            Specification specification = CreateSpecificationForBannerChecks(specificationId);

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            datasetsApiClient
               .GetAssignedDatasetSchemasForSpecification(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, PoliciesPageBannerOperationType.SpecificationUpdated, specificationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            policiesModel
                   .PageBanner
                   .Should()
                   .BeEquivalentTo(new PageBannerOperation()
                   {
                       EntityName = "Test Specification",
                       EntityType = "Specification",
                       OperationAction = "updated",
                       OperationId = null,
                       ActionText = "Edit",
                       ActionUrl = $"/specs/editspecification/{specificationId}&returnPage=ManagePolicies",
                   });
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenOperationTypeIsCalculationCreated_ThenBannerPopulated()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";
            Specification specification = CreateSpecificationForBannerChecks(specificationId);

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            datasetsApiClient
               .GetAssignedDatasetSchemasForSpecification(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, PoliciesPageBannerOperationType.CalculationCreated, "calc1");

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            policiesModel
                .PageBanner
                .Should()
                .BeEquivalentTo(new PageBannerOperation()
                {
                    EntityName = "Calculation 1",
                    EntityType = "Calculation specification",
                    OperationAction = "created",
                    OperationId = null,
                    ActionText = "Edit",
                    ActionUrl = $"/specs/EditCalculation/calc1?specificationId={specificationId}",
                });
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenOperationTypeIsCalculationUpdated_ThenBannerPopulated()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";
            Specification specification = CreateSpecificationForBannerChecks(specificationId);

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            datasetsApiClient
               .GetAssignedDatasetSchemasForSpecification(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, PoliciesPageBannerOperationType.CalculationUpdated, "calc1");

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            policiesModel
                .PageBanner
                .Should()
                .BeEquivalentTo(new PageBannerOperation()
                {
                    EntityName = "Calculation 1",
                    EntityType = "Calculation specification",
                    OperationAction = "updated",
                    OperationId = null,
                    ActionText = "Edit",
                    ActionUrl = $"/specs/EditCalculation/calc1?specificationId={specificationId}",
                });
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenOperationTypeIsSpecifiedButNoOperationId_ThenPrecondionFailedReturned()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";
            Specification specification = CreateSpecificationForBannerChecks(specificationId);

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            datasetsApiClient
               .GetAssignedDatasetSchemasForSpecification(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, PoliciesPageBannerOperationType.CalculationUpdated, null);

            // Assert
            result
                .Should()
                .BeOfType<PreconditionFailedResult>()
                .Which
                .Value
                .Should()
                .Be("Operation ID not provided");
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenUserHasApproveSpecificationPermission_ThenDoesUserHavePermissionToApproveIsTrue()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient);

            string specificationId = "spec123";

            Specification specification = new Specification()
            {
                Id = specificationId,
                Name = "Test Specification",
                FundingPeriod = new Reference("1617", "2016/2017"),
                Description = "Test Description",
                FundingStreams = new List<FundingStream>() { new FundingStream("fs1", "Funding Stream Name"), }
            };

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            datasetsApiClient
               .GetAssignedDatasetSchemasForSpecification(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, null, null);

            // Assert
            policiesModel.DoesUserHavePermissionToApprove.Should().Be("true");
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenUserDoesNotHaveApproveSpecificationPermission_ThenDoesUserHavePermissionToApproveIsFalse()
        {
            // Arrange
            ISpecsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();

            PoliciesModel policiesModel = GetPoliciesModel(specsApiClient, datasetsApiClient, authorizationHelper: authorizationHelper);

            string specificationId = "spec123";

            Specification specification = new Specification()
            {
                Id = specificationId,
                Name = "Test Specification",
                FundingPeriod = new Reference("1617", "2016/2017"),
                Description = "Test Description",
                FundingStreams = new List<FundingStream>() { new FundingStream("fs1", "Funding Stream Name"), }
            };

            specsApiClient.GetSpecification(Arg.Any<string>())
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            datasetsApiClient
               .GetAssignedDatasetSchemasForSpecification(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSchemasAssigned>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSchemasAssigned>()));

            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanApproveSpecification))
                .Returns(false);

            // Act
            IActionResult result = await policiesModel.OnGet(specificationId, null, null);

            // Assert
            policiesModel.DoesUserHavePermissionToApprove.Should().Be("false");
        }

        private static Specification CreateSpecificationForBannerChecks(string specificationId)
        {
            return new Specification()
            {
                Id = specificationId,
                Name = "Test Specification",
                FundingPeriod = new Reference("1617", "2016/2017"),
                Description = "Test Description",
                FundingStreams = new List<FundingStream>() { new FundingStream("fs1", "Funding Stream Name"), },
                Calculations = new List<Calculation>()
                {
                    new Calculation()
                    {
                        Id ="calc1",
                        Name = "Calculation 1",
                        Description = "Calculation with allocation line",
                        AllocationLine = new Reference("al1", "Allocation Line 1"),
                    },
                    new Calculation()
                    {
                        Id ="calc2",
                        Name = "Calculation Two",
                        Description = "Calculation without allocation line",
                        AllocationLine = null
                    },
                    new Calculation()
                    {
                        Id="subpolicyCalculation1",
                        Name="Sub Policy 2 Calculation 1",
                    }
                }
            };
        }

        private PoliciesModel GetPoliciesModel(
            ISpecsApiClient specsApiClient = null,
            IDatasetsApiClient datasetsApiClient = null,
            ILogger logger = null,
            IAuthorizationHelper authorizationHelper = null)
        {
            return new PoliciesModel(
                specsApiClient ?? CreateSpecsApiClient(),
                datasetsApiClient ?? CreateDatasetsApiClient(),
                logger ?? CreateLogger(),
                MappingHelper.CreateFrontEndMapper(),
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanApproveSpecification));
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
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
