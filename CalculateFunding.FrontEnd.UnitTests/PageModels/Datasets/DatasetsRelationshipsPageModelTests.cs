// <copyright file="DatasetsRelationshipsPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>
namespace CalculateFunding.Frontend.PageModels.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.Pages.Datasets;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class DatasetsRelationshipsPageModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_GivenNullSearchResultsReturns_ReturnsStatusCode500()
        {
            // Arrange
            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "1819", Name = "1018/19" }
            };

            ApiResponse<IEnumerable<Reference>> apiResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ISpecsApiClient specsApiClient = CreateApiClient();
            specsApiClient
                .GetFundingPeriods()
                .Returns(apiResponse);

            IDatasetRelationshipsSearchService searchService = CreateSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((SpecificationDatasourceRelationshipSearchResultViewModel)null);

            DatasetRelationshipsPageModel pageModel = CreatePageModel(specsApiClient, searchService);

            // Act
            IActionResult actionResult = await pageModel.OnGetAsync(1, string.Empty, string.Empty);

            // Assert
            actionResult
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = actionResult as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);

            pageModel
                .FundingPeriods
                .Count()
                .Should()
                .Be(1);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenSearchResultsReturnsResults_ReturnsPage()
        {
            // Arrange
            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "1819", Name = "1018/19" }
            };

            ApiResponse<IEnumerable<Reference>> apiResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ISpecsApiClient specsApiClient = CreateApiClient();
            specsApiClient
                .GetFundingPeriods()
                .Returns(apiResponse);

            SpecificationDatasourceRelationshipSearchResultViewModel model = new SpecificationDatasourceRelationshipSearchResultViewModel();

            IDatasetRelationshipsSearchService searchService = CreateSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(model);

            DatasetRelationshipsPageModel pageModel = CreatePageModel(specsApiClient, searchService);

            // Act
            IActionResult actionResult = await pageModel.OnGetAsync(1, string.Empty, string.Empty);

            // Assert
            actionResult
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .FundingPeriods
                .Count()
                .Should()
                .Be(1);
        }

        private static DatasetRelationshipsPageModel CreatePageModel(ISpecsApiClient apiClient, IDatasetRelationshipsSearchService searchService)
        {
            return new DatasetRelationshipsPageModel(apiClient ?? CreateApiClient(), searchService ?? CreateSearchService());
        }

        private static ISpecsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IDatasetRelationshipsSearchService CreateSearchService()
        {
            return Substitute.For<IDatasetRelationshipsSearchService>();
        }
    }
}
