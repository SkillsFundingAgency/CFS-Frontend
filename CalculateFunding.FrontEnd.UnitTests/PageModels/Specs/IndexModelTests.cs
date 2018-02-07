// <copyright file="IndexModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Specs
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Specs;
    using CalculateFunding.Frontend.TestData;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class IndexModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsReturnsNoResults_ReturnsPageResult()
        {
            // Arrange
            IEnumerable<Specification> specifications = Enumerable.Empty<Specification>();

            ApiResponse<List<Specification>> specsResponse = new ApiResponse<List<Specification>>(HttpStatusCode.OK, specifications.ToList());

            IEnumerable<Reference> academicYears = ReferenceTestData.AcademicYears();

            ApiResponse<IEnumerable<Reference>> yearsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, academicYears.ToArray());

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecifications(Arg.Is(academicYears.First().Id))
                .Returns(specsResponse);

            apiClient
                .GetAcademicYears()
                .Returns(yearsResponse);

            IndexModel indexModel = new IndexModel(apiClient);

            // Act
            IActionResult result = await indexModel.OnGetAsync();

            // Assert
            result
                .Should()
                .NotBeNull();

            indexModel
                .Years
                .Count
                .Should()
                .Be(3);

            indexModel
               .Specifications
               .Count
               .Should()
               .Be(0);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsReturnsNoResultsAndParameterSupplied_ReturnsPageResult()
        {
            // Arrange
            IEnumerable<Specification> specifications = Enumerable.Empty<Specification>();

            ApiResponse<List<Specification>> specsResponse = new ApiResponse<List<Specification>>(HttpStatusCode.OK, specifications.ToList());

            IEnumerable<Reference> academicYears = ReferenceTestData.AcademicYears();

            ApiResponse<IEnumerable<Reference>> yearsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, academicYears.ToArray());

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecifications(Arg.Is(academicYears.First().Id))
                .Returns(specsResponse);

            apiClient
                .GetAcademicYears()
                .Returns(yearsResponse);

            IndexModel indexModel = new IndexModel(apiClient);

            // Act
            IActionResult result = await indexModel.OnGetAsync(Arg.Is(academicYears.First().Id));

            // Assert
            result
                .Should()
                .NotBeNull();

            indexModel
                .Years
                .Count
                .Should()
                .Be(3);

            indexModel
               .Specifications
               .Count
               .Should()
               .Be(0);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenInvalidParameterSupplied_ReturnsPageResult()
        {
            // Arrange
            IEnumerable<Specification> specifications = Enumerable.Empty<Specification>();

            ApiResponse<List<Specification>> specsResponse = new ApiResponse<List<Specification>>(HttpStatusCode.OK, specifications.ToList());

            IEnumerable<Reference> academicYears = ReferenceTestData.AcademicYears();

            ApiResponse<IEnumerable<Reference>> yearsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, academicYears.ToArray());

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecifications(Arg.Is(academicYears.First().Id))
                .Returns(specsResponse);

            apiClient
                .GetAcademicYears()
                .Returns(yearsResponse);

            IndexModel indexModel = new IndexModel(apiClient);

            // Act
            IActionResult result = await indexModel.OnGetAsync("an-id");

            // Assert
            result
                .Should()
                .NotBeNull();

            indexModel
                .Years
                .Count
                .Should()
                .Be(3);

            indexModel
               .Specifications
               .Count
               .Should()
               .Be(0);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsReturnsResults_ReturnsPageResult()
        {
            // Arrange
            IEnumerable<Specification> specifications = SpecificationTestData.Data();

            ApiResponse<List<Specification>> specsResponse = new ApiResponse<List<Specification>>(HttpStatusCode.OK, specifications.ToList());

            IEnumerable<Reference> academicYears = ReferenceTestData.AcademicYears();

            ApiResponse<IEnumerable<Reference>> yearsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, academicYears.ToArray());

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecifications(Arg.Is(academicYears.First().Id))
                .Returns(specsResponse);

            apiClient
                .GetAcademicYears()
                .Returns(yearsResponse);

            IndexModel indexModel = new IndexModel(apiClient);

            // Act
            IActionResult result = await indexModel.OnGetAsync();

            // Assert
            result
                .Should()
                .NotBeNull();

            indexModel
                .Years
                .Count
                .Should()
                .Be(3);

            indexModel
               .Specifications
               .Count
               .Should()
               .Be(3);
        }

        private static ISpecsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IndexModel CreateIndexModel(ISpecsApiClient apiClient = null)
        {
            return new IndexModel(apiClient ?? CreateApiClient());
        }
    }
}
