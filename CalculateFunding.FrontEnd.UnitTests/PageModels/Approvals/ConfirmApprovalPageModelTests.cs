using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Approvals;
using CalculateFunding.Frontend.ViewModels.Approvals;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Approvals
{
    [TestClass]
    public class ConfirmApprovalPageModelTests
    {
        [TestMethod]
        public void OnGet_WhenGet_ThenErrorMessageSet()
        {
            // Arrange
            IResultsApiClient resultsClient = Substitute.For<IResultsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ConfirmApprovalModel pageModel = new ConfirmApprovalModel(resultsClient, specsClient, mapper);

            // Act
            IActionResult result = pageModel.OnGet();

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.ErrorMessage.Should().NotBeNullOrEmpty("an error should be present");
            pageModel.ConfirmationDetails.Should().BeNull("no confirmation details can be built");
            pageModel.UpdateStatusModelJson.Should().BeNullOrEmpty("no update json can be generated");
        }

        [TestMethod]
        public async Task OnPost_WhenNoSpecificationId_ThenErrorMessageSet()
        {
            // Arrange
            IResultsApiClient resultsClient = Substitute.For<IResultsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ConfirmApprovalModel pageModel = new ConfirmApprovalModel(resultsClient, specsClient, mapper);

            // Act
            IActionResult result = await pageModel.OnPostAsync();

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.ErrorMessage.Should().NotBeNullOrEmpty().And.Contain("Specification ID");

        }

        [TestMethod]
        public async Task OnPost_WhenAllocationLinesIsNull_ThenErrorMessageSet()
        {
            // Arrange
            IResultsApiClient resultsClient = Substitute.For<IResultsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ConfirmApprovalModel pageModel = new ConfirmApprovalModel(resultsClient, specsClient, mapper)
            {
                SpecificationId = "something",
                AllocationLines = null
            };

            // Act
            IActionResult result = await pageModel.OnPostAsync();

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.ErrorMessage.Should().NotBeNullOrEmpty().And.Contain("Providers or Allocations");
        }

        [TestMethod]
        public async Task OnPost_WhenNoAllocationLines_ThenErrorMessageSet()
        {
            // Arrange
            IResultsApiClient resultsClient = Substitute.For<IResultsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ConfirmApprovalModel pageModel = new ConfirmApprovalModel(resultsClient, specsClient, mapper)
            {
                SpecificationId = "something",
                AllocationLines = new List<PublishedAllocationLineResultStatusUpdateProviderViewModel>()
            };

            // Act
            IActionResult result = await pageModel.OnPostAsync();

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.ErrorMessage.Should().NotBeNullOrEmpty().And.Contain("Providers or Allocations");
        }

        [TestMethod]
        public async Task OnPost_WhenBackendError_ThenErrorMessageSet()
        {
            // Arrange
            IResultsApiClient resultsClient = Substitute.For<IResultsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ConfirmApprovalModel pageModel = new ConfirmApprovalModel(resultsClient, specsClient, mapper)
            {
                SpecificationId = "something",
                AllocationLines = new List<PublishedAllocationLineResultStatusUpdateProviderViewModel>()
                {
                    new PublishedAllocationLineResultStatusUpdateProviderViewModel{ AllocationLineId = "1", ProviderId = "2" }
                }
            };

            resultsClient.GetProviderResultsForPublishOrApproval(Arg.Is(pageModel.SpecificationId), Arg.Any<PublishedAllocationLineResultStatusUpdateModel>())
                .Returns(Task.FromResult(new ValidatedApiResponse<ConfirmPublishApprove>(System.Net.HttpStatusCode.NotFound)));

            // Act
            IActionResult result = await pageModel.OnPostAsync();

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.ErrorMessage.Should().NotBeNullOrEmpty().And.Contain("error occured retrieving the confirmation details");
        }

        [TestMethod]
        public async Task OnPost_WhenSpecificationIdAndAllocationLinesGiven_ThenConfirmationDetailsSet()
        {
            // Arrange
            IResultsApiClient resultsClient = Substitute.For<IResultsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ConfirmApprovalModel pageModel = new ConfirmApprovalModel(resultsClient, specsClient, mapper)
            {
                SpecificationId = "something",
                AllocationLines = new List<PublishedAllocationLineResultStatusUpdateProviderViewModel>()
                {
                    new PublishedAllocationLineResultStatusUpdateProviderViewModel{ AllocationLineId = "1", ProviderId = "2" }
                }
            };
            ConfirmPublishApprove publishedResults = CreateConfirmationSummary();
            resultsClient.GetProviderResultsForPublishOrApproval(Arg.Is(pageModel.SpecificationId), Arg.Any<PublishedAllocationLineResultStatusUpdateModel>())
                .Returns(Task.FromResult(new ValidatedApiResponse<ConfirmPublishApprove>(System.Net.HttpStatusCode.OK, publishedResults)));

            specsClient.GetSpecification(Arg.Is(pageModel.SpecificationId))
                .Returns(Task.FromResult(new ApiResponse<Specification>(System.Net.HttpStatusCode.OK, new Specification { Name = "Test Spec" })));

            // Act
            IActionResult result = await pageModel.OnPostAsync();

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.ErrorMessage.Should().BeNullOrEmpty("no error should be encountered");
            pageModel.ConfirmationDetails.Should().NotBeNull("confirmation details should be set");
            pageModel.ConfirmationDetails.FundingPeriod.Should().NotBeNullOrEmpty("FundingPeriod");
            pageModel.ConfirmationDetails.FundingStreams.Should().NotBeNullOrEmpty("FundingStreams");
            pageModel.ConfirmationDetails.LocalAuthorities.Should().NotBeNullOrEmpty("LocalAuthorities");
            pageModel.ConfirmationDetails.NumberOfProviders.Should().BeGreaterThan(0, "NumberOfProviders");
            pageModel.ConfirmationDetails.ProviderTypes.Should().NotBeNullOrEmpty("ProviderTypes");
            pageModel.ConfirmationDetails.SpecificationName.Should().NotBeNullOrEmpty("SpecificationName");
            pageModel.ConfirmationDetails.TotalFundingApproved.Should().BeGreaterThan(0.0M, "TotalFundingApproved");
        }

        [TestMethod]
        public async Task OnPost_WhenSpecificationIdAndAllocationLinesGiven_ThenUpdateModelJsonSet()
        {
            // Arrange
            IResultsApiClient resultsClient = Substitute.For<IResultsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ConfirmApprovalModel pageModel = new ConfirmApprovalModel(resultsClient, specsClient, mapper)
            {
                SpecificationId = "something",
                AllocationLines = new List<PublishedAllocationLineResultStatusUpdateProviderViewModel>()
                {
                    new PublishedAllocationLineResultStatusUpdateProviderViewModel{ AllocationLineId = "1", ProviderId = "2" }
                }
            };

            ConfirmPublishApprove publishedResults = CreateConfirmationSummary();
            resultsClient.GetProviderResultsForPublishOrApproval(Arg.Is(pageModel.SpecificationId), Arg.Any<PublishedAllocationLineResultStatusUpdateModel>())
                .Returns(Task.FromResult(new ValidatedApiResponse<ConfirmPublishApprove>(System.Net.HttpStatusCode.OK, publishedResults)));

            specsClient.GetSpecification(Arg.Is(pageModel.SpecificationId))
                .Returns(Task.FromResult(new ApiResponse<Specification>(System.Net.HttpStatusCode.OK, new Specification { Name = "Test Spec" })));

            // Act
            IActionResult result = await pageModel.OnPostAsync();

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.ErrorMessage.Should().BeNullOrEmpty("no error should be encountered");
            pageModel.UpdateStatusModelJson.Should().NotBeNullOrEmpty("update status model should be set");
        }

        private static ConfirmPublishApprove CreateConfirmationSummary()
        {
            return new ConfirmPublishApprove
            {
                FundingPeriod = "fperiod",
                FundingStreams = new List<FundingStreamSummary>
                  {
                      new FundingStreamSummary
                      {
                          AllocationLines = new List<AllocationLineSummary>
                          {
                              new AllocationLineSummary{ Name = "Alloc 1", Value = 12}
                          }
                      }
                  },
                LocalAuthorities = new List<string> { "LA1" },
                NumberOfProviders = 1,
                ProviderTypes = new List<string> { "PT1" },
                TotalFundingApproved = 12
            };
        }
    }
}
