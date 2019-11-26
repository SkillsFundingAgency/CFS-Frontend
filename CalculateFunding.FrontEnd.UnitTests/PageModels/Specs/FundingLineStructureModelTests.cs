using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.TemplateMetadata.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.Services;
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
using SpecificationSummary = CalculateFunding.Common.ApiClient.Specifications.Models.SpecificationSummary;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Specs
{
    [TestClass]
    public class FundingLineStructureModelTests
    {
        private const string specificationId = "spec123";

        [TestMethod]
        public async Task FundingLineStructureModel_OnGet_WhenSpecificationResponseIsNull_ThenInternalServerErrorReturned()
        {
            // Arrange
            ISpecificationsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            specsApiClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns((ApiResponse<SpecificationSummary>)null);

            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSpecificationRelationshipViewModel>()));

            ILogger logger = CreateLogger();

            FundingLineStructureModel model = CreateFundingLineStructureModel(
                specsApiClient: specsApiClient,
                datasetsApiClient: datasetsApiClient,
                logger: logger);

            // Act
            IActionResult result = await model.OnGet(specificationId, null, null);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Specification Lookup API Failed and returned null");

            logger
                .Received(1)
                .Error(Arg.Is($"Specification API Request came back null for Specification ID = '{specificationId}'"));
        }

        [TestMethod]
        public async Task FundingLineStructureModel_OnGet_WhenDataSchemaResponseIsNull_ThenReturnsInternalServerError()
        {
            // Arrange
            ISpecificationsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            specsApiClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

            datasetsApiClient
                .GetRelationshipsBySpecificationId(specificationId)
                .Returns((ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>)null);

            ILogger logger = CreateLogger();

            FundingLineStructureModel model = CreateFundingLineStructureModel(
                specsApiClient: specsApiClient,
                datasetsApiClient: datasetsApiClient,
                logger: logger);

            // Act
            IActionResult result = await model.OnGet(specificationId, null, null);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Datasets Lookup API Failed and returned null");

            logger
                .Received(1)
                .Error(Arg.Is($"Dataset Schema Response API Request came back null for Specification ID = '{specificationId}'"));
        }

        [TestMethod]
        public async Task FundingLineStructureModel_OnGet_WhenSpecificationResponseIsNotFound_ThenNotFoundReturned()
        {
            // Arrange
            ISpecificationsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            specsApiClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound, null));

            datasetsApiClient
                .GetRelationshipsBySpecificationId(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSpecificationRelationshipViewModel>()));

            FundingLineStructureModel model = CreateFundingLineStructureModel(
                specsApiClient: specsApiClient,
                datasetsApiClient: datasetsApiClient);

            // Act
            IActionResult result = await model.OnGet(specificationId, null, null);

            // Assert
            result
                .Should()
                .BeOfType<NotFoundObjectResult>()
                .Which
                .Value
                .Should()
                .Be("Specification not found");
        }

        [TestMethod]
        public async Task PoliciesPageModel_OnGet_WhenOperationTypeIsSpecificationUpdated_ThenBannerPopulated()
        {
            // Arrange
            ISpecificationsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            ILogger logger = CreateLogger();

            SpecificationSummary specificationSummary = CreateSpecificationSummary();

            specsApiClient.GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            datasetsApiClient
               .GetRelationshipsBySpecificationId(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSpecificationRelationshipViewModel>()));

            IEnumerable<CalculationMetadata> calculationMetadatas = Enumerable.Empty<CalculationMetadata>();

            calculationsApiClient
                .GetCalculationMetadataForSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<CalculationMetadata>>(HttpStatusCode.OK, calculationMetadatas));

            TemplateMapping templateMapping = new TemplateMapping();

            calculationsApiClient
                .GetTemplateMapping(Arg.Is(specificationId), Arg.Any<string>())
                .Returns(new ApiResponse<TemplateMapping>(HttpStatusCode.OK, templateMapping));

            FundingLineStructureModel model = CreateFundingLineStructureModel(
               specsApiClient: specsApiClient,
               datasetsApiClient: datasetsApiClient,
               calculationsApiClient: calculationsApiClient,
               logger: logger);

            // Act
            IActionResult result = await model.OnGet(specificationId, PoliciesPageBannerOperationType.SpecificationUpdated, specificationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            model
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
        public async Task PoliciesPageModel_OnGet_WhenTeplateDataFetch_ThenPopulatesTemplateData()
        {
            // Arrange
            ISpecificationsApiClient specsApiClient = CreateSpecsApiClient();
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();
            ICalculationsApiClient calculationsApiClient = CreateCalculationsApiClient();
            ILogger logger = CreateLogger();

            SpecificationSummary specificationSummary = CreateSpecificationSummary();

            TemplateMetadataContents templateMetadataContents = new TemplateMetadataContents();

            IDictionary<string, TemplateMetadataContents> templateMetadataContentsCollection = new Dictionary<string, TemplateMetadataContents>();
            templateMetadataContentsCollection.Add("a", templateMetadataContents);

            specsApiClient.GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            datasetsApiClient
               .GetRelationshipsBySpecificationId(specificationId)
               .Returns(new ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>(HttpStatusCode.OK, Enumerable.Empty<DatasetSpecificationRelationshipViewModel>()));

            ITemplateMetadataContentsAssemblerService templateMetadataContentsAssemblerService = CreateTemplateMetadataContentsAssemblerService();

            templateMetadataContentsAssemblerService
                .Assemble(Arg.Any<Common.ApiClient.Specifications.Models.SpecificationSummary>())
                .Returns(templateMetadataContentsCollection);

            IEnumerable<CalculationMetadata> calculationMetadatas = Enumerable.Empty<CalculationMetadata>();

            calculationsApiClient
                .GetCalculationMetadataForSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<CalculationMetadata>>(HttpStatusCode.OK, calculationMetadatas));

            TemplateMapping templateMapping = new TemplateMapping();

            calculationsApiClient
                .GetTemplateMapping(Arg.Is(specificationId), Arg.Any<string>())
                .Returns(new ApiResponse<TemplateMapping>(HttpStatusCode.OK, templateMapping));

            FundingLineStructureModel model = CreateFundingLineStructureModel(
               specsApiClient: specsApiClient,
               datasetsApiClient: datasetsApiClient,
               calculationsApiClient: calculationsApiClient,
               templateMetadataContentsAssemblerService: templateMetadataContentsAssemblerService,
               logger: logger);

            // Act
            IActionResult result = await model.OnGet(specificationId, PoliciesPageBannerOperationType.SpecificationUpdated, specificationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            model
                .TemplateData
                .Should()
                .BeEquivalentTo(templateMetadataContentsCollection);

            await calculationsApiClient
                .Received(specificationSummary.FundingStreams.Count())
                .GetTemplateMapping(specificationId, Arg.Any<string>());

            foreach (var fundingStream in specificationSummary.FundingStreams)
            {
                await calculationsApiClient
                    .Received(1)
                    .GetTemplateMapping(specificationId, fundingStream.Id);

                model
                    .TemplateMappings
                    .Should()
                    .Contain(fundingStream.Id, templateMapping);
            }
        }

        private FundingLineStructureModel CreateFundingLineStructureModel(
           ISpecificationsApiClient specsApiClient = null,
           IDatasetsApiClient datasetsApiClient = null,
           ILogger logger = null,
           IAuthorizationHelper authorizationHelper = null,
           ITemplateMetadataContentsAssemblerService templateMetadataContentsAssemblerService = null,
           ICalculationsApiClient calculationsApiClient = null)
        {
            return new FundingLineStructureModel(
                specsApiClient ?? CreateSpecsApiClient(),
                datasetsApiClient ?? CreateDatasetsApiClient(),
                logger ?? CreateLogger(),
                MappingHelper.CreateFrontEndMapper(),
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanApproveSpecification),
                templateMetadataContentsAssemblerService ?? CreateTemplateMetadataContentsAssemblerService(),
                calculationsApiClient ?? CreateCalculationsApiClient()
                );
        }

        private static ISpecificationsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecificationsApiClient>();
        }

        private static IDatasetsApiClient CreateDatasetsApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

        private static ITemplateMetadataContentsAssemblerService CreateTemplateMetadataContentsAssemblerService()
        {
            return Substitute.For<ITemplateMetadataContentsAssemblerService>();
        }

        private static ICalculationsApiClient CreateCalculationsApiClient()
        {
            return Substitute.For<ICalculationsApiClient>();
        }

        private static SpecificationSummary CreateSpecificationSummary()
        {
            SpecificationSummary specificationSummary = new SpecificationSummary
            {
                Id = specificationId,
                Name = "Test Specification",
                FundingPeriod = new Common.Models.Reference("fp1", "funding Period Name"),
                ApprovalStatus = PublishStatus.Draft,
                FundingStreams = new[] { new Common.Models.Reference("fs1", "Funding Stream Name"), new Common.Models.Reference("fs2", "Funding Stream 2 Name") }
            };

            return specificationSummary;
        }
    }
}
