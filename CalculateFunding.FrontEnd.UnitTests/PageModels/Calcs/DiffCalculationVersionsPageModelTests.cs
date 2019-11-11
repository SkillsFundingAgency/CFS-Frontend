using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Pages.Calcs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    [TestClass]
    public class DiffCalculationVersionsPageModelTests
    {
        private string _sourceCode = @"Public Function GetProductResult(rid As String) As Decimal
	'change to As String if text product
	Dim result As Decimal = 0

	'change to As String if text product     
	Dim P04_Learners As Decimal = products.1819_Additional_Funding.P04_Learner_Numbers     

	Dim P03_Rate As Decimal = products.1819_Additional_Funding.P03_Maths_Top_Up_Rate     

	result = P03_Rate * P04_learners     

	Return result
End Function";

        private ISpecificationsApiClient _specificationsApiClient;

        [TestInitialize]
        public void SetUp()
        {
	        _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
	        _specificationsApiClient.GetSpecificationSummaryById(Arg.Any<string>())
		        .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary
		        {
			        FundingPeriod = new FundingPeriod()
		        }));
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationVersionsDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "1";
            Calculation expectedCalculation = null;

            IEnumerable<int> versions = Enumerable.Empty<int>();
            calcsClient
              .GetCalculationById(Arg.Any<string>())
              .Returns(new ApiResponse<Calculation>(HttpStatusCode.NotFound, expectedCalculation));

            DiffCalculationModel diffCalcModel = new DiffCalculationModel(calcsClient, _specificationsApiClient, mapper);

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
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            Calculation expectedCalculation = null;

            IEnumerable<int> versions = new List<int> { 1, 2 };

            string calculationId = null;

            calcsClient
              .GetCalculationById(Arg.Any<string>())
              .Returns(new ApiResponse<Calculation>(HttpStatusCode.NotFound, expectedCalculation));

            DiffCalculationModel diffCalcModel = new DiffCalculationModel(calcsClient, _specificationsApiClient, mapper);

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

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            Calculation expectedCalculation = new Calculation()
            {
                Id = "2",
                SpecificationId = "3",
                Current = new CalculationVersion
                {
                    PublishStatus = PublishStatus.Draft,
                    Author = new Reference("1", "Matt Vallily"),
                    SourceCode = _sourceCode,
                    Version = 4
                }
            };

            IEnumerable<int> versions = new List<int> { 1, 2 };
            string calculationId = "1";

            calcsClient
            .GetCalculationById(calculationId)
            .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, expectedCalculation));

            DiffCalculationModel diffCalcModel = new DiffCalculationModel(calcsClient, _specificationsApiClient, mapper);

            // Act
            IActionResult result = await diffCalcModel.OnGet(versions, calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();

            NotFoundObjectResult typeResult = result as NotFoundObjectResult;
            typeResult.Value.Should().Be("Check the specification you entered - one or more of the specifications you entered aren't working");
        }

        [TestMethod]
        public async Task OnGet_WhenNotAllCalculationVersionsDoesntExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            Calculation expectedCalculation = new Calculation()
            {
                Id = "2",
                SpecificationId = "3",
                Current = new CalculationVersion
                {
                    PublishStatus = PublishStatus.Draft,
                    Author = new Reference("1", "Matt Vallily"),
                    SourceCode = _sourceCode,
                    Version = 4
                }
            };

            IEnumerable<int> versions = new List<int> { 1 };  // Not passing two versionIDs in the versions array
            string calculationId = "1";

            calcsClient
            .GetCalculationById(calculationId)
            .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, expectedCalculation));

            DiffCalculationModel diffCalcModel = new DiffCalculationModel(calcsClient, _specificationsApiClient, mapper);

            // Act
            IActionResult result = await diffCalcModel.OnGet(versions, calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>();

            BadRequestObjectResult typeResult = result as BadRequestObjectResult;
            typeResult.Value.Should().Be("Two versions not requested");
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationVersionsListReturned()
        {
            // Arrange
            string specificationId = "3";
            string calculationId = "2";

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            Calculation expectedCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId,
                Current = new CalculationVersion
                {
                    PublishStatus = PublishStatus.Draft,
                    Author = new Reference("1", "Matt Vallily"),
                    SourceCode = _sourceCode,
                    Version = 4
                }
            };

            IEnumerable<int> versions = new List<int> { 1, 2 };

            // build two versions for feeding the left and right panel
            CalculationVersion calver1 = new CalculationVersion()
            {
                Version = 1,
                Date = new DateTime(2018, 1, 1, 10, 23, 34),
                Author = new Reference("1", "Clifford"),
                PublishStatus = PublishStatus.Draft,
                SourceCode = "Test"
            };

            CalculationVersion calver2 = new CalculationVersion()
            {
                Version = 2,
                Date = new DateTime(2018, 1, 1, 10, 23, 34),
                Author = new Reference("1", "Clifford"),
                PublishStatus = PublishStatus.Draft,
                SourceCode = "Test"
            };

            IEnumerable<CalculationVersion> calcVerArray = new List<CalculationVersion> { calver1, calver2 };

            calcVerArray.AsEnumerable();
            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, expectedCalculation));

            calcsClient
                .GetMultipleVersionsByCalculationId(versions, calculationId)
                .Returns(new ApiResponse<IEnumerable<CalculationVersion>>(HttpStatusCode.OK, calcVerArray));

            DiffCalculationModel diffCalcPageModel = new DiffCalculationModel(calcsClient, _specificationsApiClient, mapper);

            // Act
            IActionResult result = await diffCalcPageModel.OnGet(versions, calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            diffCalcPageModel.RightCalculationDiffModel.Version.Should().Be(calver2.Version);
            diffCalcPageModel.LeftCalculationDiffModel.Version.Should().Be(calver1.Version);
        }
    }
}
