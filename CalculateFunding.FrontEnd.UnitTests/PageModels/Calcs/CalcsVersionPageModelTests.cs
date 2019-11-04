// <copyright file="CalcsVersionPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Pages.Calcs;
using CalculateFunding.Frontend.ViewModels.Calculations;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    [TestClass]
    public class CalcsVersionPageModelTests
    {
        string _sourceCode =
            @"Public Function GetProductResult(rid As String) As Decimal
	'change to As String if text product    
	Dim result As Decimal = 0 

	'change to As String if text product
	Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers

	Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate

	result = P03_Rate * P04_learners    

	Return result
End Function";

        [TestMethod]
        public async Task OnGet_WhenCalculationDoesNotExist_ThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            Calculation expectedCalculation = null;
            calcsClient
                .GetCalculationById(Arg.Any<string>())
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.NotFound, expectedCalculation));

            string calculationId = "1";

            ComparePageModel comparePageModel = new ComparePageModel(calcsClient, mapper);

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
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationID = "1";

            calcsClient
                .GetAllVersionsByCalculationId(calculationID)
                .Returns((ApiResponse<IEnumerable<CalculationVersion>>)null);

            ComparePageModel compPageModel = new ComparePageModel(calcsClient, mapper);

            // Act
            IActionResult result = await compPageModel.OnGet(calculationID);

            // Assert
            result.Should().BeOfType<InternalServerErrorResult>();

            ((InternalServerErrorResult)result).Value.Should().Be("Check the calculation name you entered");
        }

        [TestMethod]
        [DataRow(null)]
        [DataRow("")]
        [DataRow("   ")]
        [DataRow("\t")]
        [DataRow("\r\r")]
        public async Task OnGet_WhenCalculationIdIsNullGetAllVersionsbyCalculationIdReturns_ThenServerErrorResponseIsReturned(string calculationId)
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ComparePageModel compPageModel = new ComparePageModel(calcsClient, mapper);

            // Act
            IActionResult result = await compPageModel.OnGet(calculationId);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        [DataRow(0)]
        [DataRow(HttpStatusCode.NotFound)]
        public async Task OnGet_WhenSpecificationDoesntExist_ThenErrorReturned(HttpStatusCode responseStatusCode)
        {
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            string calculationId = "1";
            string expectedCalculationId = "2";

            Calculation expectedCalculation = new Calculation() { Id = expectedCalculationId };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, expectedCalculation));

            calcsClient
                .GetCalculationById(expectedCalculationId)
                .Returns(responseStatusCode == 0
                    ? null
                    : new ApiResponse<Calculation>(responseStatusCode));

            ComparePageModel compPageModel = new ComparePageModel(calcsClient, mapper);

            // Act
            IActionResult result = await compPageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result
                .Should().BeOfType<NotFoundObjectResult>();

            ((NotFoundObjectResult)result).Value
                .Should().Be("Check the specification you entered - one or more of the specifications you entered aren't working");

            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExists_ThenCalculationReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "1";
            string expectedCalculationId = "2";
            string specificationId = "Strawberry";

            Calculation expectedCalculation = new Calculation
            {
                Id = expectedCalculationId,
                SpecificationId = specificationId
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, expectedCalculation));

            Calculation specCalculation = new Calculation()
            {
                Id = expectedCalculationId,
                Name = "Test spec",
                Description = "Test description",
                AllocationLine = new Reference("1", "Test Allocation")
            };

            calcsClient
                .GetCalculationById(expectedCalculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, specCalculation));

            Reference author = new Reference("1", "Matt Vallily");

            IEnumerable<CalculationVersion> calculationVersion = new List<CalculationVersion>()
            {
                new CalculationVersion()
                {
                    Version = 1,
                    Date = new DateTime(2018, 1, 1, 12, 34, 45, 03),
                    Author = author,
                    SourceCode = _sourceCode,
                },
                new CalculationVersion()
                {
                    PublishStatus = PublishStatus.Draft,
                    Version = 2,
                    Date = new DateTime(2018, 1, 2, 12, 34, 45, 03),
                    Author = author,
                    SourceCode = _sourceCode,
                },
                new CalculationVersion()
                {
                    PublishStatus = PublishStatus.Draft,
                    Version = 3,
                    Date = new DateTime(2018, 1, 3, 12, 34, 45, 03),
                    Author = author,
                    SourceCode = _sourceCode,
                }
            };

            calcsClient
               .GetAllVersionsByCalculationId(calculationId)
               .Returns(new ApiResponse<IEnumerable<CalculationVersion>>(HttpStatusCode.OK, calculationVersion));

            ComparePageModel comparePageModel = new ComparePageModel(calcsClient, mapper);

            // Act
            IActionResult result = await comparePageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();

            CalculationViewModel calculation = comparePageModel.Calculation;

            calculation.Should().NotBeNull();

            calculation.Description.Should().Be(specCalculation.Description);

            calculation.Name.Should().Be(expectedCalculation.Name);

            comparePageModel.Calculations.Should().HaveCount(calculationVersion.Count());
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationHasManyVersions_ThenReturnsVersionsInDescendingOrder()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            //ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = "1";
            string specificationId = "Strawberry";
            int versions = 10;

            Calculation expectedCalculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, expectedCalculation));

            CalculationCurrentVersion specCalculation = new CalculationCurrentVersion()
            {
                Id = "1",
                Name = "Test spec",
                Description = "Test description",
                AllocationLine = new Reference("1", "Test Allocation")
            };

            //specsClient
            //   .GetCalculationById(expectedCalculation.SpecificationId, calculationId)
            //   .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, specCalculation));

            List<CalculationVersion> calculationVersions = new List<CalculationVersion>();

            DateTime startCalcTime = DateTime.UtcNow.AddDays(-1);

            for (int i = 1; i <= versions; i++)
            {
                calculationVersions.Add(new CalculationVersion()
                {
                    PublishStatus = PublishStatus.Draft,
                    Version = i,
                    Date = startCalcTime.AddHours(i),
                    Author = new Reference("1", "Matt Vallily"),
                    SourceCode = _sourceCode,
                });
            }

            calcsClient
               .GetAllVersionsByCalculationId(calculationId)
               .Returns(new ApiResponse<IEnumerable<CalculationVersion>>(HttpStatusCode.OK, calculationVersions));

            ComparePageModel comparePageModel = new ComparePageModel(calcsClient, mapper);

            // Act
            IActionResult result = await comparePageModel.OnGet(calculationId);

            // Assert
            result
                .Should().NotBeNull();

            comparePageModel.Calculations
                .Should().HaveCount(versions);

            comparePageModel.Calculations.Select(c => c.Versions.FirstOrDefault())
                .Should().BeInDescendingOrder();
        }
    }
}
