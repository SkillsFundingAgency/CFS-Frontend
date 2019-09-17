using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.TemplateMetadata.Models;
using CalculateFunding.Frontend.Services;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class TemplateMetadataContentsAssemblerServiceTests
    {
        [TestMethod]
        public async Task Assemble_GivenSpecificationTemplateIdsDoesNotContainFundingStreamsAssigned_ReturnsEmptyCollection()
        {
            //Arrange
            SpecificationSummary specificationSummary = CreateSpecificationSummary();
            specificationSummary.TemplateIds = new Dictionary<string, string>();

            ILogger logger = CreateLogger();

            TemplateMetadataContentsAssemblerService templateMetadataContentsAssemblerService = CreateService(logger: logger);

            //Act
            var templateMetadataContents = await templateMetadataContentsAssemblerService.Assemble(specificationSummary);

            //Assert
            templateMetadataContents
                .Should()
                .BeEmpty();

            logger
                .Received(2)
                .Error(Arg.Any<string>());
        }

        [TestMethod]
        public async Task Assemble_GivenSpecificationWithTwoFundingStreamsButTemplateContentsNotFoundForOneFundingStream_ReturnsCollectionWithOneItem()
        {
            //Arrange
            TemplateMetadataContents templateMetadataContents = new TemplateMetadataContents();

            SpecificationSummary specificationSummary = CreateSpecificationSummary();

            IPoliciesApiClient policiesApiClient = CreatePoliciesClient();
            policiesApiClient
                .GetFundingTemplateContents(Arg.Is("fs-1"), Arg.Is("1.0"))
                .Returns(new ApiResponse<TemplateMetadataContents>(HttpStatusCode.OK, templateMetadataContents));
            policiesApiClient
               .GetFundingTemplateContents(Arg.Is("fs-2"), Arg.Is("1.0"))
               .Returns((ApiResponse<TemplateMetadataContents>)null);

            TemplateMetadataContentsAssemblerService templateMetadataContentsAssemblerService = CreateService(policiesApiClient: policiesApiClient);

            //Act
            var templateMetadataContentsCollection = await templateMetadataContentsAssemblerService.Assemble(specificationSummary);

            //Assert
            templateMetadataContentsCollection
                .Should()
                .HaveCount(1);

            templateMetadataContentsCollection
                .First().Value
                .Should()
                .Be(templateMetadataContents);
        }

        [TestMethod]
        public async Task Assemble_GivenSpecificationWithTwoFundingStreamsAndTemplatesFound_ReturnsCollectionWithTwoItems()
        {
            //Arrange
            TemplateMetadataContents templateMetadataContentsFs1 = new TemplateMetadataContents();
            TemplateMetadataContents templateMetadataContentsFs2 = new TemplateMetadataContents();

            SpecificationSummary specificationSummary = CreateSpecificationSummary();

            IPoliciesApiClient policiesApiClient = CreatePoliciesClient();
            policiesApiClient
                .GetFundingTemplateContents(Arg.Is("fs-1"), Arg.Is("1.0"))
                .Returns(new ApiResponse<TemplateMetadataContents>(HttpStatusCode.OK, templateMetadataContentsFs1));
            policiesApiClient
               .GetFundingTemplateContents(Arg.Is("fs-2"), Arg.Is("1.0"))
               .Returns(new ApiResponse<TemplateMetadataContents>(HttpStatusCode.OK, templateMetadataContentsFs2));

            TemplateMetadataContentsAssemblerService templateMetadataContentsAssemblerService = CreateService(policiesApiClient: policiesApiClient);

            //Act
            var templateMetadataContentsCollection = await templateMetadataContentsAssemblerService.Assemble(specificationSummary);

            //Assert
            templateMetadataContentsCollection
                .Should()
                .HaveCount(2);
        }

        private static TemplateMetadataContentsAssemblerService CreateService(
                IPoliciesApiClient policiesApiClient = null,
                ILogger logger = null)
        {
            return new TemplateMetadataContentsAssemblerService(
                    policiesApiClient ?? CreatePoliciesClient(),
                    logger ?? CreateLogger());
        }

        private static IPoliciesApiClient CreatePoliciesClient()
        {
            return Substitute.For<IPoliciesApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

        private SpecificationSummary CreateSpecificationSummary()
        {
            return new SpecificationSummary
            {
                FundingStreams = new[]
                {
                    new Reference("fs-1", "Funding Stream 1"),
                    new Reference("fs-2", "Funding Stream 2"),
                },
                TemplateIds = new Dictionary<string, string>
                {
                    { "fs-1", "1.0" },
                    { "fs-2", "1.0" }
                }
            };
        }
    }
}
