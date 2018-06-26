// <copyright file="CreateDatasetPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Datasets
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Datasets;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class CreateDatasetPageModelTests
    {
        [TestMethod]
        public void OnGetAsync_WhenGettingDefinitionsIsNotSuccess_ThrowsException()
        {
            // Arrange
            ApiResponse<IEnumerable<DatasetDefinition>> response =
                new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.BadRequest);

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .GetDataDefinitions()
                .Returns(response);

            CreateDatasetPageModel pageModel = CreatePageModel(apiClient);

            // Act
            Func<Task> test = async () => await pageModel.OnGetAsync();

            // Assert
            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task OnGetAsync_WhenGettingDefinitionsIsSuccess_PopulatesSelectList()
        {
            // Arrange
            IEnumerable<DatasetDefinition> definitions = new[]
            {
                new DatasetDefinition
                {
                    Id = "def-id",
                    Name = "def-name"
                }
            };

            ApiResponse<IEnumerable<DatasetDefinition>> response =
                new ApiResponse<IEnumerable<DatasetDefinition>>(HttpStatusCode.OK, definitions);

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .GetDataDefinitions()
                .Returns(response);

            CreateDatasetPageModel pageModel = CreatePageModel(apiClient);

            // Act
            IActionResult result = await pageModel.OnGetAsync();

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .DatasetDefinitions
                .Should()
                .NotBeEmpty();
        }

        private static CreateDatasetPageModel CreatePageModel(IDatasetsApiClient apiClient)
        {
            return new CreateDatasetPageModel(apiClient ?? CreateApiClient());
        }

        private static IDatasetsApiClient CreateApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }
    }
}
