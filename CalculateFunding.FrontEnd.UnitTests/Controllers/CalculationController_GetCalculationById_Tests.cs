using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels;
using CalculateFunding.Frontend.ViewModels.Calculations;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class CalculationController_GetCalculationById_Tests
    {
        private const string AdditionalCalculationId = "ABC123";
        private const string TemplateCalculationId = "T123";
        private const string SpecificationId = "spec";
        private const string FundingStreamId = "fundingStreamId";
        private const string FundingPeriodId = "fundingPeriodId";
        private const uint TemplateId = 1;
        private const string TemplateVersion = "1.0";
        private const Common.TemplateMetadata.Enums.CalculationType TemplateCalculationType = Common.TemplateMetadata.Enums.CalculationType.Number;

        private CalculationController _sut;
        private Mock<ICalculationsApiClient> _mockCalcClient;
        private IMapper _mapper;
        private Mock<IAuthorizationHelper> _mockAuthorizationHelper;
        private Mock<IResultsApiClient> _mockResultsApiClient;
        private Mock<ISpecificationsApiClient> _mockSpecificationsApiClient;
        private Mock<IPoliciesApiClient> _mockPoliciesApiClient;

        [TestInitialize]
        public void Initialize()
        {
            MapperConfiguration config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            _mapper = config.CreateMapper();
            _mockCalcClient = new Mock<ICalculationsApiClient>();
            _mockAuthorizationHelper = new Mock<IAuthorizationHelper>();
            _mockResultsApiClient = new Mock<IResultsApiClient>();
            _mockSpecificationsApiClient = new Mock<ISpecificationsApiClient>();
            _mockPoliciesApiClient = new Mock<IPoliciesApiClient>();

            Calculation additionalCalculation = Builder<Calculation>.CreateNew().With(c => c.CalculationType = CalculationType.Additional).Build();
            Calculation templateCalculation = Builder<Calculation>.CreateNew()
                .With(c => c.CalculationType = CalculationType.Template)
                .With(c => c.SpecificationId = SpecificationId)
                .With(c => c.FundingStreamId = FundingStreamId)
                .Build();

            _mockCalcClient.Setup(x => x.GetCalculationById(AdditionalCalculationId)).ReturnsAsync(
                    new ApiResponse<Calculation>(HttpStatusCode.OK, additionalCalculation));

            _mockCalcClient.Setup(x => x.GetCalculationById(TemplateCalculationId)).ReturnsAsync(
                    new ApiResponse<Calculation>(HttpStatusCode.OK, templateCalculation));

            _sut = new CalculationController(_mockCalcClient.Object, _mapper, _mockAuthorizationHelper.Object,
                _mockResultsApiClient.Object, _mockSpecificationsApiClient.Object, _mockPoliciesApiClient.Object);
        }

        [TestMethod]
        public async Task When_RequestValidAdditionalCalculation_Should_Return_Calculation()
        {
            IActionResult actual = await _sut.GetCalculationById(AdditionalCalculationId);

            actual.Should().BeOfType<OkObjectResult>();


            CalculationByIdViewModel viewModel = (actual as OkObjectResult).Value as CalculationByIdViewModel;
            viewModel.TemplateCalculationId.Should().BeNull();
            viewModel.TemplateCalculationType.Should().BeNull();
        }

        [TestMethod]
        public async Task When_RequestValidTemplateCalculation_Should_Return_Calculation()
        {
            GivenValidTemplateCalculation();

            IActionResult actual = await _sut.GetCalculationById(TemplateCalculationId);

            actual.Should().BeOfType<OkObjectResult>();

            CalculationByIdViewModel viewModel = (actual as OkObjectResult).Value as CalculationByIdViewModel;
            viewModel.TemplateCalculationId.Should().Be(TemplateId);
            viewModel.TemplateCalculationType.Should().Be(TemplateCalculationType);
        }

        [TestMethod]
        public async Task When_GetCalculationById_Returns_BadRequest_Return_BadRequest()
        {
            _mockCalcClient.Setup(x => x.GetCalculationById(AdditionalCalculationId)).ReturnsAsync(
                    new ApiResponse<Calculation>(HttpStatusCode.BadRequest));

            IActionResult actual = await _sut.GetCalculationById(AdditionalCalculationId);

            actual.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task When_GetTemplateMapping_Returns_BadRequest_Return_BadRequest()
        {
            GivenValidTemplateCalculation();
            _mockCalcClient.Setup(x => x.GetTemplateMapping(SpecificationId, FundingStreamId)).ReturnsAsync(
                new ApiResponse<TemplateMapping>(HttpStatusCode.BadRequest));

            IActionResult actual = await _sut.GetCalculationById(TemplateCalculationId);

            actual.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task When_GetSpecificationSummaryById_Returns_BadRequest_Return_BadRequest()
        {
            GivenValidTemplateCalculation();
            _mockSpecificationsApiClient.Setup(x => x.GetSpecificationSummaryById(SpecificationId)).ReturnsAsync(
                new ApiResponse<SpecificationSummary>(HttpStatusCode.BadRequest));

            IActionResult actual = await _sut.GetCalculationById(TemplateCalculationId);

            actual.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task When_GetDistinctTemplateMetadataCalculationsContents_Returns_BadRequest_Return_BadRequest()
        {
            GivenValidTemplateCalculation();
            _mockPoliciesApiClient.Setup(x => x.GetDistinctTemplateMetadataCalculationsContents(FundingStreamId, FundingPeriodId, TemplateVersion)).ReturnsAsync(
                new ApiResponse<TemplateMetadataDistinctCalculationsContents>(HttpStatusCode.BadRequest));

            IActionResult actual = await _sut.GetCalculationById(TemplateCalculationId);

            actual.Should().BeOfType<BadRequestResult>();
        }

        private void GivenValidTemplateCalculation()
        {
            List<TemplateMappingItem> templateMappingItems = new List<TemplateMappingItem>
            {
                new TemplateMappingItem
                {
                    CalculationId = TemplateCalculationId,
                    TemplateId = TemplateId,
                    Name = "Anything",
                    EntityType = TemplateMappingEntityType.Calculation
                }
            };

            TemplateMapping templateMapping = Builder<TemplateMapping>.CreateNew()
                .With(t => t.TemplateMappingItems = templateMappingItems)
                .Build();

            _mockCalcClient.Setup(x => x.GetTemplateMapping(SpecificationId, FundingStreamId)).ReturnsAsync(
                new ApiResponse<TemplateMapping>(HttpStatusCode.OK, templateMapping));

            FundingPeriod fundingPeriod = new FundingPeriod
            {
                Id = FundingPeriodId
            };

            Dictionary<string, string> templateIds = new Dictionary<string, string>
            {
                { FundingStreamId, TemplateVersion }
            };

            SpecificationSummary specification = Builder<SpecificationSummary>.CreateNew()
                .With(s => s.Id = SpecificationId)
                .With(s => s.FundingPeriod = fundingPeriod)
                .With(s => s.TemplateIds = templateIds)
                .Build();

            _mockSpecificationsApiClient.Setup(x => x.GetSpecificationSummaryById(SpecificationId)).ReturnsAsync(
                new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

            List<TemplateMetadataCalculation> calculations = new List<TemplateMetadataCalculation>
            {
                new TemplateMetadataCalculation
                {
                    TemplateCalculationId = TemplateId,
                    Type = TemplateCalculationType
                }
            };

            TemplateMetadataDistinctCalculationsContents templateContents = Builder<TemplateMetadataDistinctCalculationsContents>.CreateNew()
                .With(t => t.Calculations = calculations)
                .Build();

            _mockPoliciesApiClient.Setup(x => x.GetDistinctTemplateMetadataCalculationsContents(FundingStreamId, FundingPeriodId, TemplateVersion)).ReturnsAsync(
                new ApiResponse<TemplateMetadataDistinctCalculationsContents>(HttpStatusCode.OK, templateContents));
        }
        
    }
}
