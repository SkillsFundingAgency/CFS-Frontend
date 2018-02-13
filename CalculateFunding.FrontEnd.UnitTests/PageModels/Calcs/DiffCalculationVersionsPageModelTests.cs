// <copyright file="DiffCalculationVersionsPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Calcs;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class DiffCalculationVersionsPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenCalculationVersionsDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();
            string calculationId = "1";
            Calculation expectedCalculation = null;

            IEnumerable<int> versions = Enumerable.Empty<int>();
            calcsClient
              .GetCalculationById(Arg.Any<string>())
              .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.NotFound, expectedCalculation));

            DiffCalculationModel diffCalcModel = new DiffCalculationModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await diffCalcModel.OnGet(versions, calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationIdDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            Calculation expectedCalculation = null;

            IEnumerable<int> versions = new List<int> { 1, 2 };

            string calculationId = null;

            calcsClient
              .GetCalculationById(Arg.Any<string>())
              .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.NotFound, expectedCalculation));

            DiffCalculationModel diffCalcModel = new DiffCalculationModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await diffCalcModel.OnGet(versions, calculationId);

            // Assert
            result.Should().NotBeNull();

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]

        public async Task OnGet_WhenSpecCalculationDoesntExistThenErrorReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            Calculation expectedCalculation = new Calculation()
            {
                CalculationSpecification = new Reference("1", "Calc spec"),
                Id = "2",
                Name = "Specs Calculation",
                PeriodName = "2018/19",
                SpecificationId = "3",
                Status = "Draft",
                LastModifiedBy = new Reference("1", "Matt Vallily"),
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product  Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
                Version = 4
            };

            IEnumerable<int> versions = new List<int> { 1, 2 };
            string calculationId = "1";

            Clients.SpecsClient.Models.Calculation specCalculation = new Clients.SpecsClient.Models.Calculation()
            {
                Id = "1",
                Name = "Test spec",
                Description = "Test description",
                AllocationLine = new Reference("1", "Test Allocation")
            };

            calcsClient
            .GetCalculationById(calculationId)
            .Returns(new ApiResponse<Clients.CalcsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, expectedCalculation));

            specsClient
             .GetCalculationById(calculationId, "3")
             .Returns(new ApiResponse<Clients.SpecsClient.Models.Calculation>(System.Net.HttpStatusCode.NotFound, specCalculation));

            DiffCalculationModel diffCalcModel = new DiffCalculationModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await diffCalcModel.OnGet(versions, calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();

            NotFoundObjectResult typeResult = result as NotFoundObjectResult;
            typeResult.Value.Should().Be("Calculation was not found in Specs Service");
        }

        [TestMethod]
        public async Task OnGet_WhenNotAllCalculationVersionsDoesntExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            Calculation expectedCalculation = new Calculation()
            {
                CalculationSpecification = new Reference("1", "Calc spec"),
                Id = "2",
                Name = "Specs Calculation",
                PeriodName = "2018/19",
                SpecificationId = "3",
                Status = "Draft",
                LastModifiedBy = new Reference("1", "Matt Vallily"),
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product  Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
                Version = 4
            };

            IEnumerable<int> versions = new List<int> { 1 };  // Not passing two versionIDs in the versions array
            string calculationId = "1";

            Clients.SpecsClient.Models.Calculation specCalculation = new Clients.SpecsClient.Models.Calculation()
            {
                Id = "1",
                Name = "Test spec",
                Description = "Test description",
                AllocationLine = new Reference("1", "Test Allocation")
            };

            calcsClient
            .GetCalculationById(calculationId)
            .Returns(new ApiResponse<Clients.CalcsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, expectedCalculation));

            specsClient
             .GetCalculationById(calculationId, "3")
             .Returns(new ApiResponse<CalculateFunding.Frontend.Clients.SpecsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, specCalculation));
            DiffCalculationModel diffCalcModel = new DiffCalculationModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await diffCalcModel.OnGet(versions, calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>();

            BadRequestObjectResult typeResult = result as BadRequestObjectResult;
            typeResult.Value.Should().Be("Two versions not requested");
        }

        [TestMethod]
        public async Task OnGet_WhencalculationVersionsListReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            Calculation expectedCalculation = new Calculation()
            {
                CalculationSpecification = new Reference("1", "Calc spec"),
                Id = "2",
                Name = "Specs Calculation",
                PeriodName = "2018/19",
                SpecificationId = "1",
                Status = "Draft",
                LastModifiedBy = new Reference("1", "Matt Vallily"),
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product  Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
                Version = 4
            };

            IEnumerable<int> versions = new List<int> { 1, 2 };
            string calculationId = "1";

            Clients.SpecsClient.Models.Calculation specCalculation = new Clients.SpecsClient.Models.Calculation()
            {
                Id = "1",
                Name = "Test spec",
                Description = "Test description",
                AllocationLine = new Reference("1", "Test Allocation")
            };

            // build two versions for feeding the left and right panel
            CalculationVersion calver1 = new CalculationVersion()
            {
                DecimalPlaces = 2,
                Version = "1",
                Date = new DateTime(2018, 1, 1, 10, 23, 34),
                Author = new Reference("1", "Clifford"),
                Status = "Draft",
                SourceCode = "Test"
            };

            CalculationVersion calver2 = new CalculationVersion()
            {
                DecimalPlaces = 2,
                Version = "2",
                Date = new DateTime(2018, 1, 1, 10, 23, 34),
                Author = new Reference("2", "Clifford"),
                Status = "Draft",
                SourceCode = "Test"
            };

            IEnumerable<CalculationVersion> calcVerArray = new List<CalculationVersion> { calver1, calver2 };

            calcVerArray.AsEnumerable();
            calcsClient
            .GetCalculationById(calculationId)
            .Returns(new ApiResponse<Clients.CalcsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, expectedCalculation));

            specsClient
             .GetCalculationById("1", calculationId)
             .Returns(new ApiResponse<CalculateFunding.Frontend.Clients.SpecsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, specCalculation));  // CalculateFunding.Frontend.Clients.SpecsClient.Models

            calcsClient
             .GetMultipleVersionsByCalculationId(versions, calculationId)
             .Returns(new ApiResponse<IEnumerable<CalculationVersion>>(System.Net.HttpStatusCode.OK, calcVerArray));

            DiffCalculationModel diffCalcPageModel = new DiffCalculationModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await diffCalcPageModel.OnGet(versions, calculationId);

            // Assert
            result.Should().NotBeNull();

            diffCalcPageModel.RightCalculationDiffModel.Version.Should().Be(calver2.Version);
            diffCalcPageModel.LeftCalcualationDiffModel.Version.Should().Be(calver1.Version);
        }
    }
}
