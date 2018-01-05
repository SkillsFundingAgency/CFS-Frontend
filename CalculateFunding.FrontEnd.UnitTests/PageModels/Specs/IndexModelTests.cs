using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Pages.Specs;
using CalculateFunding.Frontend.ApiClient.Models;
using System.Linq;
using CalculateFunding.FrontEnd.TestData;
using NSubstitute;
using CalculateFunding.Frontend.ApiClient;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using FluentAssertions;

namespace CalculateFunding.FrontEnd.PageModels.Specs
{
    [TestClass]
    public class IndexModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_GivenGetSpecificationsReturnsNoResults_ReturnsPageResult()
        {
            //Arrange
            IEnumerable<Specification> Specifications = Enumerable.Empty<Specification>();

            ApiResponse<List<Specification>> specsResponse = new ApiResponse<List<Specification>>(HttpStatusCode.OK, Specifications.ToList());

            IEnumerable<Reference> AcademicYears = ReferenceTestData.AcademicYears();

            ApiResponse<Reference[]> yearsResponse = new ApiResponse<Reference[]>(HttpStatusCode.OK, AcademicYears.ToArray());

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecifications(Arg.Is(AcademicYears.First().Id))
                .Returns(specsResponse);

            apiClient
                .GetAcademicYears()
                .Returns(yearsResponse);

            IndexModel indexModel = new IndexModel(apiClient);

            //Act
            IActionResult result = await indexModel.OnGetAsync();

            //Assert
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
            //Arrange
            IEnumerable<Specification> Specifications = Enumerable.Empty<Specification>();

            ApiResponse<List<Specification>> specsResponse = new ApiResponse<List<Specification>>(HttpStatusCode.OK, Specifications.ToList());

            IEnumerable<Reference> AcademicYears = ReferenceTestData.AcademicYears();

            ApiResponse<Reference[]> yearsResponse = new ApiResponse<Reference[]>(HttpStatusCode.OK, AcademicYears.ToArray());

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecifications(Arg.Is(AcademicYears.First().Id))
                .Returns(specsResponse);

            apiClient
                .GetAcademicYears()
                .Returns(yearsResponse);

            IndexModel indexModel = new IndexModel(apiClient);

            //Act
            IActionResult result = await indexModel.OnGetAsync(Arg.Is(AcademicYears.First().Id));

            //Assert
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
            //Arrange
            IEnumerable<Specification> Specifications = Enumerable.Empty<Specification>();

            ApiResponse<List<Specification>> specsResponse = new ApiResponse<List<Specification>>(HttpStatusCode.OK, Specifications.ToList());

            IEnumerable<Reference> AcademicYears = ReferenceTestData.AcademicYears();

            ApiResponse<Reference[]> yearsResponse = new ApiResponse<Reference[]>(HttpStatusCode.OK, AcademicYears.ToArray());

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecifications(Arg.Is(AcademicYears.First().Id))
                .Returns(specsResponse);

            apiClient
                .GetAcademicYears()
                .Returns(yearsResponse);

            IndexModel indexModel = new IndexModel(apiClient);

            //Act
            IActionResult result = await indexModel.OnGetAsync("an-id");

            //Assert
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
            //Arrange
            IEnumerable<Specification> Specifications = SpecificationTestData.Data();

            ApiResponse<List<Specification>> specsResponse = new ApiResponse<List<Specification>>(HttpStatusCode.OK, Specifications.ToList());

            IEnumerable<Reference> AcademicYears = ReferenceTestData.AcademicYears();

            ApiResponse<Reference[]> yearsResponse = new ApiResponse<Reference[]>(HttpStatusCode.OK, AcademicYears.ToArray());

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecifications(Arg.Is(AcademicYears.First().Id))
                .Returns(specsResponse);

            apiClient
                .GetAcademicYears()
                .Returns(yearsResponse);

            IndexModel indexModel = new IndexModel(apiClient);

            //Act
            IActionResult result = await indexModel.OnGetAsync();

            //Assert
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

        static ISpecsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        static IndexModel CreateIndexModel(ISpecsApiClient apiClient = null)
        {
            return new IndexModel(apiClient ?? CreateApiClient());
        }
    }
}
