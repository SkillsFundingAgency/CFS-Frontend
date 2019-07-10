// <copyright file="DatasetsRelationshipsPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>
namespace CalculateFunding.Frontend.PageModels.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.Pages.Datasets;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

    [TestClass]
    public class DatasetsRelationshipsPageModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_GivenNullSearchResultsReturns_ReturnsStatusCode500()
        {
            // Arrange
            IEnumerable<PolicyModels.Period> fundingPeriods = new[]
            {
                new PolicyModels.Period { Id = "1819", Name = "1018/19" }
            };

            ApiResponse<IEnumerable<PolicyModels.Period>> apiResponse = new ApiResponse<IEnumerable<PolicyModels.Period>>(HttpStatusCode.OK, fundingPeriods);

            IPoliciesApiClient policiesApiClient = CreateApiClient();
            policiesApiClient
                .GetFundingPeriods()
                .Returns(apiResponse);

            IDatasetRelationshipsSearchService searchService = CreateSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((SpecificationDatasourceRelationshipSearchResultViewModel)null);

            DatasetRelationshipsPageModel pageModel = CreatePageModel(policiesApiClient, searchService);

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
            IEnumerable<PolicyModels.Period> fundingPeriods = new[]
            {
                new PolicyModels.Period { Id = "1819", Name = "1018/19" }
            };

            ApiResponse<IEnumerable<PolicyModels.Period>> apiResponse = new ApiResponse<IEnumerable<PolicyModels.Period>>(HttpStatusCode.OK, fundingPeriods);

            IPoliciesApiClient policiesApiClient = CreateApiClient();
            policiesApiClient
                .GetFundingPeriods()
                .Returns(apiResponse);

            SpecificationDatasourceRelationshipSearchResultViewModel model = new SpecificationDatasourceRelationshipSearchResultViewModel();

            IDatasetRelationshipsSearchService searchService = CreateSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(model);

            DatasetRelationshipsPageModel pageModel = CreatePageModel(policiesApiClient, searchService);

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

        private static DatasetRelationshipsPageModel CreatePageModel(IPoliciesApiClient apiClient, IDatasetRelationshipsSearchService searchService)
        {
            return new DatasetRelationshipsPageModel(apiClient ?? CreateApiClient(), searchService ?? CreateSearchService());
        }

        private static IPoliciesApiClient CreateApiClient()
        {
            return Substitute.For<IPoliciesApiClient>();
        }

        private static IDatasetRelationshipsSearchService CreateSearchService()
        {
            return Substitute.For<IDatasetRelationshipsSearchService>();
        }
    }
}
