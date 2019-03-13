// <copyright file="CalcsVersionPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.Models;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Calcs;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class CalcsVersionPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenCalculationDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            Calculation expectedCalculation = null;
            calcsClient
                .GetCalculationById(Arg.Any<string>())
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.NotFound, expectedCalculation));

            string calculationId = "1";

            ComparePageModel comparePageModel = new ComparePageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await comparePageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task OnGet_WhenGetAllVersionsbyCalculationIdReturnsNull_ThenServerErrorResponseIsReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationID = "1";

            calcsClient
                .GetAllVersionsByCalculationId(calculationID)
                .Returns((ApiResponse<IEnumerable<CalculationVersion>>)null);

            ComparePageModel compPageModel = new ComparePageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await compPageModel.OnGet(calculationID);

            // Assert
            result.Should().BeOfType<StatusCodeResult>();
            StatusCodeResult typedResult = result as StatusCodeResult;
            typedResult.StatusCode.Should().Be(500);
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationIDIsNullGetAllVersionsbyCalculationIdReturns_ThenServerErrorResponseIsReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            string calculationID = null;

            calcsClient
                .GetAllVersionsByCalculationId(calculationID)
                    .Returns((ApiResponse<IEnumerable<CalculationVersion>>)null);

            ComparePageModel compPageModel = new ComparePageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await compPageModel.OnGet(calculationID);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task OnGet_WhenSpecificationDoesntExistThenErrorReturned()
        {
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            ILogger logger = Substitute.For<ILogger>();
            string calculationId = "1";
            Calculation expectedCalculation = new Calculation()
            {
                Id = "2",
                Name = "Specs Calculation",
                FundingPeriodName = "2018/19",
                SpecificationId = "3",
                PublishStatus = PublishStatus.Draft,
                LastModifiedBy = new Reference("1", "Matt Vallily"),
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product     Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
                Version = 4
            };

            calcsClient
                .GetCalculationById("2")
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, expectedCalculation));

            Clients.SpecsClient.Models.CalculationCurrentVersion specCalculation = new Clients.SpecsClient.Models.CalculationCurrentVersion()
            {
                Id = "1",
                Name = "Test spec",
                Description = "Test description",
                AllocationLine = new Reference("1", "Test Allocation")
            };

            specsClient
            .GetCalculationById(calculationId, "3")
            .Returns(new ApiResponse<CalculateFunding.Frontend.Clients.SpecsClient.Models.CalculationCurrentVersion>(System.Net.HttpStatusCode.NotFound, specCalculation));

            ComparePageModel compPageModel = new ComparePageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await compPageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<StatusCodeResult>();
            Assert.IsInstanceOfType(result, typeof(StatusCodeResult));
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsThenCalculationReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = "1";

            Calculation expectedCalculation = new Calculation()
            {
                Id = "1",
                Name = "Specs Calculation",
                FundingPeriodName = "2018/19",
                SpecificationId = "3",
                PublishStatus = PublishStatus.Draft,
                LastModifiedBy = new Reference("1", "Matt Vallily"),
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product     Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
                Version = 4,
                CalculationSpecification = new Reference("1", "Test Spec")
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, expectedCalculation));

            Clients.SpecsClient.Models.CalculationCurrentVersion specCalculation = new Clients.SpecsClient.Models.CalculationCurrentVersion()
            {
                Id = "1",
                Name = "Test spec",
                Description = "Test description",
                AllocationLine = new Reference("1", "Test Allocation")
            };

            specsClient
           .GetCalculationById(expectedCalculation.SpecificationId, calculationId)
           .Returns(new ApiResponse<Clients.SpecsClient.Models.CalculationCurrentVersion>(System.Net.HttpStatusCode.OK, specCalculation));

            CalculationVersion calcsVersion1 = new CalculationVersion()
            {
                Status = "Draft",
                Version = "1",
                DecimalPlaces = 4,
                Date = new DateTime(2018, 1, 1, 12, 34, 45, 03),
                Author = new Reference("1", "Matt Vallily"),
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product     Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
            };

            CalculationVersion calcsVersion2 = new CalculationVersion()
            {
                Status = "Draft",
                Version = "2",
                DecimalPlaces = 4,
                Date = new DateTime(2018, 1, 2, 12, 34, 45, 03),
                Author = new Reference("1", "Matt Vallily"),
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product     Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
            };

            CalculationVersion calcsVersion3 = new CalculationVersion()
            {
                Status = "Draft",
                Version = "3",
                DecimalPlaces = 4,
                Date = new DateTime(2018, 1, 3, 12, 34, 45, 03),
                Author = new Reference("1", "Matt Vallily"),
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product     Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
            };

            IEnumerable<CalculationVersion> calculationVersion = new List<CalculationVersion>()
            {
                calcsVersion1,
                calcsVersion2,
                calcsVersion3
            };

            calcsClient
               .GetAllVersionsByCalculationId(calculationId)
               .Returns(new ApiResponse<IEnumerable<CalculationVersion>>(System.Net.HttpStatusCode.OK, calculationVersion));

            ComparePageModel comparePageModel = new ComparePageModel(specsClient, calcsClient, mapper);

            // Act
            IActionResult result = await comparePageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();

            comparePageModel.Calculation.Should().NotBeNull();

            comparePageModel.Calculation.Description.Should().Be(specCalculation.Description);

            comparePageModel.Calculation.Name.Should().Be(expectedCalculation.Name);

            comparePageModel.Calculations.Select(f => f.Version).Should().BeInDescendingOrder();

            comparePageModel.Calculations.Should().HaveCount(3);

            ViewModels.Calculations.CalculationVersionViewModel firstCalculation = comparePageModel.Calculations.First();

            firstCalculation.Version.Should().Be(calcsVersion3.Version);
        }
    }
}
