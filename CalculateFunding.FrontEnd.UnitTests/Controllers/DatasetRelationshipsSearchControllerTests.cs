// <copyright file="DatasetRelationshipsSearchControllerTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>
namespace CalculateFunding.Frontend.Controllers
{
    using System;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class DatasetRelationshipsSearchControllerTests
    {
        [TestMethod]
        public void SearchDatasetRelationships_GivenNullRequestObject_ThrowsArgumentNullException()
        {
            // Arrange
            DatasetRelationshipsSearchController controller = CreateController();

            SearchRequestViewModel requestModel = null;

            // Act
            Func<Task> test = async () => await controller.SearchDatasetRelationships(requestModel);

            // Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task SearchDatasetRelationships_GivenNullResultsReturnedFromSearch_ReturnsStatusCode500()
        {
            // Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            IDatasetRelationshipsSearchService searchService = CreateSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns((SpecificationDatasourceRelationshipSearchResultViewModel)null);

            DatasetRelationshipsSearchController controller = CreateController(searchService);

            // Act
            IActionResult actionResult = await controller.SearchDatasetRelationships(requestModel);

            // Asserts
            actionResult
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = actionResult as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task SearchDatasetRelationships_GivenResultsReturnedFromSearch_ReturnsOK()
        {
            // Arrange
            SearchRequestViewModel requestModel = new SearchRequestViewModel();

            SpecificationDatasourceRelationshipSearchResultViewModel results = new SpecificationDatasourceRelationshipSearchResultViewModel();

            IDatasetRelationshipsSearchService searchService = CreateSearchService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(results);

            DatasetRelationshipsSearchController controller = CreateController(searchService);

            // Act
            IActionResult actionResult = await controller.SearchDatasetRelationships(requestModel);

            // Asserts
            actionResult
                .Should()
                .BeOfType<OkObjectResult>();
        }

        private static DatasetRelationshipsSearchController CreateController(IDatasetRelationshipsSearchService searchService = null)
        {
            return new DatasetRelationshipsSearchController(searchService ?? CreateSearchService());
        }

        private static IDatasetRelationshipsSearchService CreateSearchService()
        {
            return Substitute.For<IDatasetRelationshipsSearchService>();
        }
    }
}
