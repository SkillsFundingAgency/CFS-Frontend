// <copyright file="EditCalculationPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Calcs;
    using Castle.Core.Logging;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class EditCalculationPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenCalculationDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = "5";

            EditCalculationPageModel pageModel = new EditCalculationPageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task OnGet_WhenSpecCalculationDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = "5";

            calcsClient.GetCalculationById(calculationId).Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Reference("1", "Test Calculation Specification"),
                SpecificationId = "54",
            }));

            EditCalculationPageModel pageModel = new EditCalculationPageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsThenCalculationReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Reference(calculationId, "Test Calculation Specification"),
                SpecificationId = "54",
                SourceCode = "Test Source Code"
            };

            Frontend.Clients.SpecsClient.Models.Calculation specsCalculation = new Frontend.Clients.SpecsClient.Models.Calculation()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<Frontend.Clients.SpecsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, specsCalculation));

            EditCalculationPageModel pageModel = new EditCalculationPageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.SourceCode);
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsButCalculationTypeIsZero_ThenCalculationDisplayTypeIsEmpty()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Reference(calculationId, "Test Calculation Specification"),
                SpecificationId = "54",
                SourceCode = "Test Source Code",
                CalculationType = Clients.SpecsClient.Models.CalculationSpecificationType.Number
            };

            Frontend.Clients.SpecsClient.Models.Calculation specsCalculation = new Frontend.Clients.SpecsClient.Models.Calculation()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<Frontend.Clients.SpecsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, specsCalculation));

            EditCalculationPageModel pageModel = new EditCalculationPageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.SourceCode);
            pageModel.Calculation.CalculationType.Should().Be(Clients.SpecsClient.Models.CalculationSpecificationType.Number);
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistdCalculationTypeIsFunding_ThenCalculationDisplayTypeIsFunding()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Reference(calculationId, "Test Calculation Specification"),
                SpecificationId = "54",
                SourceCode = "Test Source Code",
                CalculationType = Clients.SpecsClient.Models.CalculationSpecificationType.Funding
            };

            Frontend.Clients.SpecsClient.Models.Calculation specsCalculation = new Frontend.Clients.SpecsClient.Models.Calculation()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<Frontend.Clients.SpecsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, specsCalculation));

            EditCalculationPageModel pageModel = new EditCalculationPageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.SourceCode);
            pageModel.Calculation.CalculationType.Should().Be(Clients.SpecsClient.Models.CalculationSpecificationType.Funding);
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationIdNotProvidedThenBadResultReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = null;

            EditCalculationPageModel pageModel = new EditCalculationPageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>();

            BadRequestObjectResult typedResult = result as BadRequestObjectResult;
            typedResult.Value.Should().Be("The provided calculation ID was null or empty string");
        }
    }
}
