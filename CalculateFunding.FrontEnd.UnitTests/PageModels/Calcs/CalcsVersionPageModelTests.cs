using AutoMapper;
using CalculateFunding.Frontend.Clients;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Calcs;
using Castle.Core.Logging;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    [TestClass]
    class CalcsVersionPageModelTests
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

            ComparePageModel pageModel = new ComparePageModel(specsClient, calcsClient, mapper);
            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        //public async Task OnGet_WhenSpecCalculationDoesNotExistThenNotFoundReturned()
        //{
        //    // Arrange
        //    ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
        //    ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
        //    IMapper mapper = MappingHelper.CreateFrontEndMapper();

        //    ILogger logger = Substitute.For<ILogger>();

        //    string calculationId = "£$%";

        //    calcsClient.GetCalculationById(calculationId).Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, new Calculation()
        //    {
        //        Id = calculationId,
        //        CalculationSpecification = new Frontend.Clients.Models.Reference("1", "Test Calculation Specification"),
        //        SpecificationId = "54",
        //    }));


        //    ComparePageModel pageModel = new ComparePageModel(specsClient, calcsClient, mapper);
        //    // Act
        //    IActionResult result = await pageModel.OnGet(calculationId);

        //    // Assert
        //    result.Should().NotBeNull();
        //    result.Should().BeOfType<NotFoundObjectResult>();
        //}



        public async Task OnGet_WhenCalculationExistsThenCalculationReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ILogger logger = Substitute.For<ILogger>();

            string calculationId = "3";

            Calculation calcsVersionCalculation = new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Frontend.Clients.Models.Reference(calculationId, "Test Calculation Specification"),
                SpecificationId = "54",
                SourceCode = "Public Function GetProductResult(rid As String) As Decimal 'change to As String if text product     Dim result As Decimal = 0 'change to As String if text product     Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     result = P03_Rate * P04_learners     Return result End Function",
            };

            //Frontend.Clients.SpecsClient.Models.Calculation specsCalculation = new Frontend.Clients.SpecsClient.Models.Calculation()
            //{
            //    Id = calculationId,
            //    Name = "Specs Calculation",
            //    Description = "Spec Description",
            //};

            //calcsClient
            //    .GetCalculationById(calculationId)
            //    .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            //specsClient
            //    .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
            //    .Returns(new ApiResponse<Frontend.Clients.SpecsClient.Models.Calculation>(System.Net.HttpStatusCode.OK, specsCalculation));


            ComparePageModel pageModel = new ComparePageModel(specsClient, calcsClient, mapper);
            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsVersionCalculation.Name);
            pageModel.Calculation.PeriodName.Should().Be(calcsVersionCalculation.PeriodName);
            pageModel.Calculation.LastModified.Should().Be(calcsVersionCalculation.LastModified);
            pageModel.Calculation.Version.Should().Be(calcsVersionCalculation.Version);

        }





    }
}
