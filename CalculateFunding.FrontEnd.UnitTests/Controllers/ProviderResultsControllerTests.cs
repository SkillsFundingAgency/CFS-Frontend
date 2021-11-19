using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.ProviderResults;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ProviderResultsControllerTests
    {
        private ProviderResultsController _providerResultsController;

        private Mock<ISpecificationsApiClient> _specificationApiClient;
        private Mock<IResultsApiClient> _resultsApiClient;
        private Mock<IPoliciesApiClient> _policiesApiClient;
        private Mock<ICalculationsApiClient> _calculationsApiClient;
        private Mock<IPublishingApiClient> _pubishingApiClient;
        private Mock<IAuthorizationHelper> _authorizationHelper;

        private string _providerId;
        private string _specificationId;
        private string _specificationName;
        private string _fundingStreamId;
        private string _fundingStreamName;
        private string _fundingPeriodId;
        private string _templateVersion;
        private string _fundingLineCode;
        private string _fundingLineName;
        private string _calculationId;
        private uint _templateId;

        [TestInitialize]
        public void SetUp()
        {
            _specificationApiClient = new Mock<ISpecificationsApiClient>();
            _resultsApiClient = new Mock<IResultsApiClient>();
            _policiesApiClient = new Mock<IPoliciesApiClient>();
            _calculationsApiClient = new Mock<ICalculationsApiClient>();
            _pubishingApiClient = new Mock<IPublishingApiClient>();
            _authorizationHelper = new Mock<IAuthorizationHelper>();

            _providerResultsController = new ProviderResultsController(_specificationApiClient.Object,
                                                                       _resultsApiClient.Object,
                                                                       _policiesApiClient.Object,
                                                                       _calculationsApiClient.Object,
                                                                       _pubishingApiClient.Object,
                                                                       _authorizationHelper.Object);

            _providerId = "providerId";
            _specificationId = "specificationId";
            _specificationName = "specName";
            _fundingStreamId = "fundingStreamId";
            _fundingStreamName = "fundingStreamName";
            _fundingPeriodId = "fundingPeriodId";
            _fundingLineCode = "fundingLineCode";
            _fundingLineName = "funding line 321";
            _calculationId = "calc123";
            _templateVersion = "templateVersion";
            _templateId = 123;

        }

        [TestMethod]
        public void GetFundingStructure_GuardsAgainstNoProviderIdBeingSupplied()
        {
            Func<Task<IActionResult>> invocation = () => WhenFundingStructureIsRequested(null, _specificationId);

            invocation
                .Should()
                .Throw<ArgumentNullException>()
                .Which
                .ParamName
                .Should()
                .Be("providerId");
        }

        [TestMethod]
        public void GetFundingStructure_GuardsAgainstNoSpecificationIdBeingSupplied()
        {
            Func<Task<IActionResult>> invocation = () => WhenFundingStructureIsRequested(_providerId, null);

            invocation
                .Should()
                .Throw<ArgumentNullException>()
                .Which
                .ParamName
                .Should()
                .Be("specificationId");
        }

        [TestMethod]
        public async Task ReturnsInternalServerErrorWhenGetSpecificationSummaryByIdReturnsInternalServerError()
        {
            GivenSpecificationSummary(HttpStatusCode.InternalServerError, new SpecificationSummary());

            IActionResult actualResult = await WhenFundingStructureIsRequested(_providerId, _specificationId);

            actualResult.Should().BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task ReturnsInternalServerErrorWhenGetDistinctTemplateMetadataContentsReturnsInternalServerError()
        {
            GivenTemplateMetadataDistinctContents(HttpStatusCode.InternalServerError, new TemplateMetadataDistinctContents());

            IActionResult actualResult = await WhenFundingStructureIsRequested(_providerId, _specificationId);

            actualResult.Should().BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task ReturnsInternalServerErrorWhenGetTemplateMappingReturnsInternalServerError()
        {
            GivenProviderResultResponse(HttpStatusCode.InternalServerError, new ProviderResultResponse());

            IActionResult actualResult = await WhenFundingStructureIsRequested(_providerId, _specificationId);

            actualResult.Should().BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task ReturnsInternalServerErrorWhenGetCalculationMetadataForSpecificationReturnsInternalServerError()
        {
            GivenCalculationMetadata(HttpStatusCode.InternalServerError, new List<CalculationMetadata>());

            IActionResult actualResult = await WhenFundingStructureIsRequested(_providerId, _specificationId);

            actualResult.Should().BeOfType<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task GetFundingStructureResultsForProviderAndSpecification_DelegatesToApisAndReturnsResult()
        {
            ProviderResultForSpecification expectedProviderResultForSpecification = new ProviderResultForSpecification
            {
                SpecificationId = _specificationId,
                SpecificationName = _specificationName,
                FundingStreamId = _fundingStreamId,
                FundingStreamName = _fundingStreamName,
                CalculationResults = new Dictionary<uint, TemplateCalculationResult>
                {
                    {
                        _templateId, new TemplateCalculationResult
                        {
                            CalculationId = _calculationId,
                            Name = "calc123",
                            TemplateCalculationId = _templateId,
                            Status = PublishStatus.Approved,
                            ValueFormat = Common.TemplateMetadata.Enums.CalculationValueFormat.Currency,
                            TemplateCalculationType = Common.TemplateMetadata.Enums.CalculationType.Cash,
                            Value = 1,
                            ExceptionMessage = "calculation exception message"
                        }
                    }
                },
                FundingLineResults = new Dictionary<uint, ViewModels.ProviderResults.FundingLineResult>
                {
                    {
                        321, new ViewModels.ProviderResults.FundingLineResult
                        {
                            TemplateLineId = 321,
                            FundingLineCode = _fundingLineCode,
                            Name = _fundingLineName,
                            Value = 2,
                            ExceptionMessage = "funding line exception message"
                        }
                    }
                }
            };

            GivenCalculationMetadata(HttpStatusCode.OK, new List<CalculationMetadata>
            {
                new CalculationMetadata {
                    CalculationId = _calculationId,
                    PublishStatus = PublishStatus.Approved
                }
            });

            GivenProviderResultResponse(HttpStatusCode.OK, new ProviderResultResponse
            {
                CalculationResults = new List<CalculationResultResponse>
                {
                    new CalculationResultResponse
                    {
                        Calculation = new Common.Models.Reference
                        {
                            Id = _calculationId,
                            Name = "calc123"
                        },
                        Value = 1,
                        CalculationType = Common.ApiClient.Results.Models.CalculationType.Template,
                        CalculationValueType = Common.ApiClient.Results.Models.CalculationValueType.Currency,
                        ExceptionMessage = "calculation exception message"
                    }
                },
                FundingLineResults = new List<Common.ApiClient.Results.Models.FundingLineResult>
                {
                    new Common.ApiClient.Results.Models.FundingLineResult
                    {
                        FundingLine = new Common.Models.Reference
                        {
                            Id = "321",
                            Name = _fundingLineName
                        },
                        Value = 2,
                        ExceptionMessage = "funding line exception message"
                    }
                }
            });

            GivenTemplateMapping(HttpStatusCode.OK, new TemplateMapping
            {
                TemplateMappingItems = new List<TemplateMappingItem>
                {
                    new TemplateMappingItem
                    {
                        CalculationId = _calculationId,
                        TemplateId = _templateId,
                        EntityType = TemplateMappingEntityType.Calculation
                    }
                }
            });

            GivenTemplateMetadataDistinctContents(HttpStatusCode.OK, new TemplateMetadataDistinctContents
            {
                Calculations = new List<TemplateMetadataCalculation>
                {
                    new TemplateMetadataCalculation
                    {
                        TemplateCalculationId = _templateId,
                        Type = Common.TemplateMetadata.Enums.CalculationType.Cash,
                        Name = "calc123",
                        ValueFormat = Common.TemplateMetadata.Enums.CalculationValueFormat.Currency
                    }
                },
                FundingLines = new List<TemplateMetadataFundingLine>
                {
                    new TemplateMetadataFundingLine
                    {
                        TemplateLineId = 321,
                        Name = _fundingLineName,
                        FundingLineCode = _fundingLineCode
                    }
                }
            });

            GivenSpecificationSummary(HttpStatusCode.OK, new SpecificationSummary
            {
                Name = _specificationName,
                FundingStreams = new List<Reference>
                {
                    new Reference
                    {
                        Id = _fundingStreamId,
                        Name = _fundingStreamName
                    }
                },
                FundingPeriod = new Reference
                {
                    Id = _fundingPeriodId,
                    Name = "fundingPeriodName"
                },
                TemplateIds = new Dictionary<string, string>
                {
                    { _fundingStreamId, _templateVersion }
                }
            });

            OkObjectResult result = await WhenFundingStructureIsRequested(_providerId, _specificationId) as OkObjectResult;

            result?
                .Value
                .Should()
                .BeEquivalentTo(expectedProviderResultForSpecification);
        }

        private void GivenCalculationMetadata(
                                   HttpStatusCode httpStatusCode,
                                   IEnumerable<CalculationMetadata> calculationMetadata = null)
        {
            _calculationsApiClient
                .Setup(_ => _.GetCalculationMetadataForSpecification(_specificationId))
                .ReturnsAsync(new ApiResponse<IEnumerable<CalculationMetadata>>(httpStatusCode, calculationMetadata));
        }

        private void GivenTemplateMapping(
                                    HttpStatusCode httpStatusCode,
                                    TemplateMapping templateMapping = null)
        {
            _calculationsApiClient
                .Setup(_ => _.GetTemplateMapping(_specificationId, _fundingStreamId))
                .ReturnsAsync(new ApiResponse<TemplateMapping>(httpStatusCode, templateMapping));
        }

        private void GivenProviderResultResponse(
                           HttpStatusCode httpStatusCode,
                           ProviderResultResponse providerResultResponse = null)
        {
            _resultsApiClient
                .Setup(_ => _.GetProviderResults(_providerId,
                       _specificationId))
                .ReturnsAsync(new ApiResponse<ProviderResultResponse>(httpStatusCode, providerResultResponse));
        }

        private void GivenTemplateMetadataDistinctContents(
                   HttpStatusCode httpStatusCode,
                   TemplateMetadataDistinctContents templateMetadataDistinctContents = null)
        {
            _policiesApiClient
                .Setup(_ => _.GetDistinctTemplateMetadataContents(_fundingStreamId,
                       _fundingPeriodId,
                        _templateVersion))
                .ReturnsAsync(new ApiResponse<TemplateMetadataDistinctContents>(httpStatusCode, templateMetadataDistinctContents));
        }

        private void GivenSpecificationSummary(
                           HttpStatusCode httpStatusCode,
                           SpecificationSummary specificationSummary = null)
        {
            _specificationApiClient
                .Setup(_ => _.GetSpecificationSummaryById(
                    _specificationId))
                .ReturnsAsync(new ApiResponse<SpecificationSummary>(httpStatusCode, specificationSummary));
        }

        private async Task<IActionResult> WhenFundingStructureIsRequested(string providerId, string specificationId)
            => await _providerResultsController.GetFundingStructureResultsForProviderAndSpecification(providerId, specificationId);
    }
}