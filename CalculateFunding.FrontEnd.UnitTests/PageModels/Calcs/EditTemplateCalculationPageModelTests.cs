using System;
using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Pages.Calcs;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels.Calculations;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Calcs
{
    [TestClass]
    public class EditTemplateCalculationPageModelTests
    {
        [TestMethod]
        public async Task GetCalculation_ApiResponseIsNull_ThrowsNotFound()
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            string calculationId = "12345";

            //Act
            Func<Task> test = async () => await pageModel.GetCalculation(calculationId);

            test
                .Should().Throw<Exception>()
                .Which
                .Message.Should().Be("Check the calculation name you entered");

            await calcClient
                .Received(1)
                .GetCalculationById(calculationId);
        }

        [TestMethod]
        [DataRow(HttpStatusCode.BadRequest)]
        [DataRow(HttpStatusCode.NotFound)]
        [DataRow(HttpStatusCode.InternalServerError)]
        public async Task GetCalculation_ApiResponseNotOK_ThrowsNotFound(HttpStatusCode statusCode)
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            string calculationId = "12345";

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            calcClient
                .GetCalculationById(calculationId)
                .Returns(Task.FromResult(new ApiResponse<Calculation>(statusCode, null)));

            //Act
            Func<Task> test = async () => await pageModel.GetCalculation(calculationId);

            //Assert
            test
                .Should().Throw<Exception>()
                .Which
                .Message.Should().Be("Check the calculation name you entered");

            await calcClient
                .Received(1)
                .GetCalculationById(calculationId);
        }

        [TestMethod]
        public async Task GetCalculation_ApiResponseOK_PopulatesPageModel()
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            string calculationId = "12345";
            string specificationId = "67890";
            CalculationVersion currentCalculationVersion = new CalculationVersion();
            CalculationViewModel calculationViewModel = new CalculationViewModel();
            CalculationEditViewModel calculationEditViewModel = new CalculationEditViewModel();

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            Calculation calculation = new Calculation
            {
                SpecificationId = specificationId,
                Current = currentCalculationVersion
            };

            calcClient
                .GetCalculationById(calculationId)
                .Returns(Task.FromResult(new ApiResponse<Calculation>(HttpStatusCode.OK, calculation)));

            mapper
                .Map<CalculationViewModel>(calculation)
                .Returns(calculationViewModel);
            mapper
                .Map<CalculationEditViewModel>(calculation)
                .Returns(calculationEditViewModel);

            //Act
            await pageModel.GetCalculation(calculationId);

            //Assert
            pageModel.SpecificationId
                .Should()
                .Be(specificationId);

            pageModel.Calculation
                .Should()
                .Be(calculationViewModel);

            pageModel.EditModel
                .Should()
                .Be(calculationEditViewModel);

            await calcClient
                .Received(1)
                .GetCalculationById(calculationId);
        }

        [TestMethod]
        public async Task EnableEditCalculationPage_ShouldNotBeEnabled_DoesNothing()
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            string calculationId = "1234";

            //Act
            await pageModel.EnableEditCalculationPage(false, calculationId);

            //Assert
            await resultsApiClient
                .Received(0)
                .HasCalculationResults(Arg.Any<string>());

            pageModel.CalculationHasResults = false;
        }

        [TestMethod]
        [DataRow(true)]
        [DataRow(false)]
        public async Task EnableEditCalculationPage_ShouldBeEnabled_PopulatesCorrectly(bool hasResults)
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            string calculationId = "2345";

            pageModel.Calculation = new CalculationViewModel { Id = calculationId };

            resultsApiClient
                .HasCalculationResults(calculationId)
                .Returns(new ApiResponse<bool>(HttpStatusCode.OK, hasResults));

            //Act
            bool result = await pageModel.EnableEditCalculationPage(true, calculationId);

            //Assert
            result
                .Should()
                .Be(hasResults);

            await resultsApiClient
                .Received(1)
                .HasCalculationResults(calculationId);
        }

        [TestMethod]
        public async Task EnableEditCalculationPage_NullCalculationResponse_ReturnsFalse()
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            string calculationId = "2345";

            pageModel.Calculation = new CalculationViewModel { Id = calculationId };

            resultsApiClient
                .HasCalculationResults(calculationId)
                .Returns((ApiResponse<bool>)null);

            //Act
            bool result = await pageModel.EnableEditCalculationPage(true, calculationId);

            //Assert
            result
                .Should()
                .Be(false);

            await resultsApiClient
                .Received(1)
                .HasCalculationResults(calculationId);
        }


        [TestMethod]
        [DataRow(HttpStatusCode.BadRequest)]
        [DataRow(HttpStatusCode.NotFound)]
        public async Task EnableEditCalculationPage_NotOkCalculationResponse_ReturnsFalse(HttpStatusCode statusCode)
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            string calculationId = "2345";

            pageModel.Calculation = new CalculationViewModel { Id = calculationId };

            resultsApiClient
                .HasCalculationResults(calculationId)
                .Returns(new ApiResponse<bool>(statusCode, true));

            //Act
            bool result = await pageModel.EnableEditCalculationPage(true, calculationId);

            //Assert
            result
                .Should()
                .Be(false);

            await resultsApiClient
                .Received(1)
                .HasCalculationResults(calculationId);
        }

#if NCRUNCH
        [Ignore]
#endif
        [TestMethod]
        [DynamicData(nameof(HandleSpecificationSummaryNotOkTestCases), DynamicDataSourceType.Method)]
        public async Task HandleSpecificationSummary_ApiResponseNotOK_ThrowsException(ApiResponse<SpecificationSummary> specificationResponse)
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            specsClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(specificationResponse);

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            string specificationId = "12345";

            //Act
            Func<Task> test = async () => await pageModel.HandleSpecificationSummary(specificationId);

            //Assert
            test
	            .Should()
	            .Throw<Exception>()
	            .WithMessage($"Bad response received from specification API: {specificationResponse?.StatusCode.ToString() ?? "No response"}");

            await specsClient
                .Received(1)
                .GetSpecificationSummaryById(specificationId);
        }

        private static IEnumerable<object[]> HandleSpecificationSummaryNotOkTestCases()
        {
            yield return new object[] { null };
            yield return new object[] { new ApiResponse<SpecificationSummary>(HttpStatusCode.BadRequest, null) };
            yield return new object[] { new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound, null) };
        }

        [TestMethod]
        public async Task HandleSpecificationSummary_ApiResponseOK_PopulatesCorrectly()
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            string specificationName = "Spec name";
            string fundingStreamName = "Bob";
            string fundingStreamId = "5678";
            string fundingPeriodName = "Alice";
            string templateVersion = "1";
            string calculationName = "calculationName";

            SpecificationSummary specificationSummary = new SpecificationSummary
            {
                Name = specificationName,
                FundingStreams = new[] { new Reference(fundingStreamId, fundingStreamName) },
                FundingPeriod = new Reference("a", fundingPeriodName),
                TemplateIds = new Dictionary<string, string>
                {
                    {fundingStreamId, templateVersion}
                }
            };

            specsClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            string fundingLineName = "2";
            uint templateId = 1;

            Common.TemplateMetadata.Models.TemplateMetadataContents templateMetadataContents = new Common.TemplateMetadata.Models.TemplateMetadataContents
            {
                RootFundingLines = new List<Common.TemplateMetadata.Models.FundingLine>
                {
                    new Common.TemplateMetadata.Models.FundingLine
                    {
                        Name = fundingLineName,
                        Calculations = new List<Common.TemplateMetadata.Models.Calculation>
                        {
                            new Common.TemplateMetadata.Models.Calculation
                            {
                                TemplateCalculationId = templateId
                            }
                        }
                    }
                }
            };

            policiesApiClient
                .GetFundingTemplateContents(fundingStreamId, templateVersion)
                .Returns(new ApiResponse<Common.TemplateMetadata.Models.TemplateMetadataContents>(HttpStatusCode.OK, templateMetadataContents));

            string specificationId = "12345";

            TemplateMapping templateMapping = new TemplateMapping
            {
                FundingStreamId = fundingStreamId,
                SpecificationId = specificationId,
                TemplateMappingItems = new List<TemplateMappingItem>
                {
                    new TemplateMappingItem
                    {
                        TemplateId = templateId
                    }
                }
            };

            calcClient
                .GetTemplateMapping(specificationId, fundingStreamId)
                .Returns(new ApiResponse<TemplateMapping>(HttpStatusCode.OK, templateMapping));

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);


            pageModel.Calculation = new CalculationViewModel { Name = calculationName };

            //Act
            await pageModel.HandleSpecificationSummary(specificationId);

            //Assert
            pageModel.SpecificationName
                .Should()
                .Be(specificationName);

            pageModel.FundingStreamName
                .Should()
                .Be(fundingStreamName);

            pageModel.FundingStreamId
                .Should()
                .Be(fundingStreamId);

            pageModel.FundingPeriodName
                .Should()
                .Be(fundingPeriodName);

            await specsClient
                .Received(1)
                .GetSpecificationSummaryById(specificationId);

            await policiesApiClient
                .Received(1)
                .GetFundingTemplateContents(fundingStreamId, templateVersion);

            await calcClient
                .Received(1)
                .GetTemplateMapping(specificationId, fundingStreamId);
        }

#if NCRUNCH
        [Ignore]
#endif
        [TestMethod]
        [DynamicData(nameof(HandleGetFundingTemplateContentsNotOkTestCases), DynamicDataSourceType.Method)]
        public async Task HandleGetFundingTemplateContents_ApiResponseNotOK_ThrowsException(ApiResponse<Common.TemplateMetadata.Models.TemplateMetadataContents> getFundingTemplateContentsResponse)
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            string fundingStreamId = "fundingStreamId";

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK,
                new SpecificationSummary
                {
                    Name = "name",
                    FundingStreams = new Reference[]
                    {
                                    new Reference(fundingStreamId, "fundingStreamName"),
                                    new Reference("b", "c")
                    },
                    FundingPeriod = new Reference("a", "fundingPeriodName"),
                    TemplateIds = new Dictionary<string, string>
                    {
                        { fundingStreamId, "templateVersion" }
                    }
                });

            specsClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(specificationResponse);

            policiesApiClient
                .GetFundingTemplateContents(Arg.Any<string>(), Arg.Any<string>())
                .Returns(getFundingTemplateContentsResponse);

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            string specificationId = "12345";

            //Act
            Func<Task> test = async () => await pageModel.HandleSpecificationSummary(specificationId);

            //Assert
            test
                .Should()
                .Throw<Exception>()
                .WithMessage($"Bad response received from policies API: {getFundingTemplateContentsResponse?.StatusCode.ToString() ?? "No response"}");

            await specsClient
                .Received(1)
                .GetSpecificationSummaryById(specificationId);
        }

        private static IEnumerable<object[]> HandleGetFundingTemplateContentsNotOkTestCases()
        {
            yield return new object[] { null };
            yield return new object[] { new ApiResponse<Common.TemplateMetadata.Models.TemplateMetadataContents>(HttpStatusCode.BadRequest, null) };
            yield return new object[] { new ApiResponse<Common.TemplateMetadata.Models.TemplateMetadataContents>(HttpStatusCode.NotFound, null) };
        }

#if NCRUNCH
        [Ignore]
#endif
        [TestMethod]
        [DynamicData(nameof(HandleGetTemplateMappingNotOkTestCases), DynamicDataSourceType.Method)]
        public async Task HandleGetTemplateMapping_ApiResponseNotOK_ThrowsException(ApiResponse<TemplateMapping> getTemplateMappingResponse)
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            string fundingStreamId = "fundingStreamId";
            string templateVersion = "templateVersion";

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK,
                new SpecificationSummary
                {
                    Name = "name",
                    FundingStreams = new Reference[]
                    {
                                    new Reference(fundingStreamId, "fundingStreamName"),
                                    new Reference("b", "c")
                    },
                    FundingPeriod = new Reference("a", "fundingPeriodName"),
                    TemplateIds = new Dictionary<string, string>
                    {
                        { fundingStreamId, templateVersion }
                    }
                });

            specsClient
                .GetSpecificationSummaryById(Arg.Any<string>())
                .Returns(specificationResponse);

            Common.TemplateMetadata.Models.TemplateMetadataContents templateMetadataContents = new Common.TemplateMetadata.Models.TemplateMetadataContents
            {
                RootFundingLines = new List<Common.TemplateMetadata.Models.FundingLine>
                {
                    new Common.TemplateMetadata.Models.FundingLine
                    {
                        Name = "name",
                        Calculations = new List<Common.TemplateMetadata.Models.Calculation>
                        {
                            new Common.TemplateMetadata.Models.Calculation
                            {
                                Name = "name"
                            }
                        }
                    }
                }
            };

            policiesApiClient
                .GetFundingTemplateContents(fundingStreamId, templateVersion)
                .Returns(new ApiResponse<Common.TemplateMetadata.Models.TemplateMetadataContents>(HttpStatusCode.OK, templateMetadataContents));

            calcClient
                .GetTemplateMapping(Arg.Any<string>(), Arg.Any<string>())
                .Returns(getTemplateMappingResponse);

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            string specificationId = "12345";

            //Act
            Func<Task> test = async () => await pageModel.HandleSpecificationSummary(specificationId);

            //Assert
            test
                .Should()
                .Throw<Exception>()
                .WithMessage($"Bad response received from calcs API: {getTemplateMappingResponse?.StatusCode.ToString() ?? "No response"}");

            await specsClient
                .Received(1)
                .GetSpecificationSummaryById(specificationId);

            await policiesApiClient
                .Received(1)
                .GetFundingTemplateContents(fundingStreamId, templateVersion);
        }

        private static IEnumerable<object[]> HandleGetTemplateMappingNotOkTestCases()
        {
            yield return new object[] { null };
            yield return new object[] { new ApiResponse<TemplateMapping>(HttpStatusCode.BadRequest, null) };
            yield return new object[] { new ApiResponse<TemplateMapping>(HttpStatusCode.NotFound, null) };
        }

        [TestMethod]
        [DataRow(null)]
        [DataRow("")]
        [DataRow("   ")]
        [DataRow("\r\n")]
        public async Task OnGet_InvalidCalculationId_ReturnsBadRequest(string calculationId)
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            //Act
            IActionResult result = await pageModel.OnGet(calculationId);

            //Assert
            result
                .Should().BeOfType<BadRequestObjectResult>();

            ((BadRequestObjectResult)result).Value.ToString()
                .Should().Be("Enter a unique name");
        }

        [TestMethod]
        public async Task OnGet_GetCalculationThrowsNotFound_ReturnsNotFound()
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            string calculationId = "4567";

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            //Act
            IActionResult result = await pageModel.OnGet(calculationId);

            //Assert
            result
                .Should().BeOfType<NotFoundObjectResult>();

            ((NotFoundObjectResult)result).Value.ToString()
                .Should().Be("Check the calculation name you entered");

            await calcClient
                .Received(1)
                .GetCalculationById(calculationId);
        }

        [TestMethod]
        [DataRow(true, true, true)]
        [DataRow(false, false, true)]
        [DataRow(true, false, true)]
        [DataRow(false, true, true)]
        [DataRow(true, true, false)]
        [DataRow(false, false, false)]
        [DataRow(true, false, false)]
        [DataRow(false, true, false)]
        public async Task OnGet_ValidRequest_ReturnsCorrectly(bool newEditCalculationPageEnabled,
            bool userHasPermission,
            bool hasCalculationResponse)
        {
            //Arrange
            ISpecificationsApiClient specsClient = Substitute.For<ISpecificationsApiClient>();
            ICalculationsApiClient calcClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = Substitute.For<IMapper>();
            IFeatureToggle features = Substitute.For<IFeatureToggle>();
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();
            IPoliciesApiClient policiesApiClient = Substitute.For<IPoliciesApiClient>();

            string calculationId = "4567";
            string specificationId = "123";
            string calculationName = "calculationName";
            CalculationVersion calculationVersion = new CalculationVersion();

            Calculation calculation = new Calculation
            {
                Id = calculationId,
                SpecificationId = specificationId,
                Current = calculationVersion,
            };

            CalculationViewModel calculationViewModel = new CalculationViewModel
            {
                Id = calculationId + specificationId,
                Name = calculationName
            };

            calcClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calculation));

            features
                .IsNewEditCalculationPageEnabled()
                .Returns(newEditCalculationPageEnabled);

            authHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), SpecificationActionTypes.CanEditCalculations)
                .Returns(userHasPermission);

            resultsApiClient
                .HasCalculationResults(calculationId + specificationId)
                .Returns(new ApiResponse<bool>(HttpStatusCode.OK, hasCalculationResponse));

            mapper
                .Map<CalculationViewModel>(Arg.Any<Calculation>())
                .Returns(calculationViewModel);

            string fundingStreamId = "1";
            string templateVersion = "1";

            SpecificationSummary specificationSummary = new SpecificationSummary
            {
                Name = "A",
                FundingStreams = new[] { new Reference(fundingStreamId, "Kochanski") },
                FundingPeriod = new Reference(),
                TemplateIds = new Dictionary<string, string>
                {
                    {fundingStreamId, templateVersion}
                }
            };

            specsClient
                .GetSpecificationSummaryById(specificationId)
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            string fundingLineName = "2";
            uint templateId = 1;

            Common.TemplateMetadata.Models.TemplateMetadataContents templateMetadataContents = new Common.TemplateMetadata.Models.TemplateMetadataContents
            {
                RootFundingLines = new List<Common.TemplateMetadata.Models.FundingLine>
                {
                    new Common.TemplateMetadata.Models.FundingLine
                    {
                        Name = fundingLineName,
                        Calculations = new List<Common.TemplateMetadata.Models.Calculation>
                        {
                            new Common.TemplateMetadata.Models.Calculation
                            {
                                TemplateCalculationId = templateId
                            }
                        }
                    }
                }
            };

            policiesApiClient
                .GetFundingTemplateContents(fundingStreamId, templateVersion)
                .Returns(new ApiResponse<Common.TemplateMetadata.Models.TemplateMetadataContents>(HttpStatusCode.OK, templateMetadataContents));

            TemplateMapping templateMapping = new TemplateMapping
            {
                FundingStreamId = fundingStreamId,
                SpecificationId = specificationId,
                TemplateMappingItems = new List<TemplateMappingItem>
                {
                    new TemplateMappingItem
                    {
                        TemplateId = templateId,
                        CalculationId = calculationId + specificationId
                    }
                }
            };

            calcClient
                .GetTemplateMapping(specificationId, fundingStreamId)
                .Returns(new ApiResponse<TemplateMapping>(HttpStatusCode.OK, templateMapping));

            EditTemplateCalculationPageModel pageModel = new EditTemplateCalculationPageModel(specsClient,
                calcClient,
                mapper,
                features,
                authHelper,
                resultsApiClient,
                policiesApiClient);

            pageModel.PageContext = TestAuthHelper.CreatePageContext();

            //Act
            IActionResult result = await pageModel.OnGet(calculationId);

            //Assert
            result
                .Should().BeOfType<PageResult>();

            await calcClient
                .Received(1)
                .GetCalculationById(calculationId);

            features
                .Received(1)
                .IsNewEditCalculationPageEnabled();

            await authHelper
                .Received(1)
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), SpecificationActionTypes.CanEditCalculations);

            if (newEditCalculationPageEnabled)
            {
                await resultsApiClient
                    .Received(1)
                    .HasCalculationResults(calculationId + specificationId);
            }
            else
            {
                await resultsApiClient
                    .DidNotReceive()
                    .HasCalculationResults(Arg.Any<string>());
            }

            mapper
                .Received(1)
                .Map<CalculationViewModel>(calculation);

            mapper
                .Received(1)
                .Map<CalculationEditViewModel>(calculation);

            pageModel.DoesUserHavePermissionToApproveOrEdit
                .Should()
                .Be(userHasPermission.ToString().ToLowerInvariant());

            pageModel.ViewData["GreyBackground"]
                .Should()
                .Be(newEditCalculationPageEnabled.ToString());

            await calcClient
                .Received(1)
                .GetTemplateMapping(specificationId, fundingStreamId);
        }
    }
}
