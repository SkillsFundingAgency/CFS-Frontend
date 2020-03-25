﻿using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.TemplateMetadata.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Modules;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Calculation = CalculateFunding.Common.TemplateMetadata.Models.Calculation;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class FundingLineStructureControllerTests
    {
        private const string FundingStreamId = "DSG";
        private const string TemplateVersion = "1.0";
        private const string SpecificationId = "680898bd-9ddc-4d11-9913-2a2aa34f213c";
        private const string CalculationId = "aValidCalculationId";

        private readonly ISpecificationsApiClient _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
        private readonly IPoliciesApiClient _policiesApiClient = Substitute.For<IPoliciesApiClient>();
        private readonly ICalculationsApiClient _calculationsApiClient = Substitute.For<ICalculationsApiClient>();

        [TestMethod]
        public async Task GetFundingStructures_ReturnsFlatStructureWithCorrectLevelsAndInCorrectOrder()
        {
            ValidScenarioSetup();
            FundingLineStructureController controller = new FundingLineStructureController(
                _policiesApiClient, _specificationsApiClient, _calculationsApiClient);

            IActionResult apiResponseResult = await controller.GetFundingStructures(FundingStreamId, SpecificationId);

            var expectedFundingStructureItems = GetValidMappedFundingStructureItems();
            apiResponseResult.Should().BeOfType<OkObjectResult>();
            OkObjectResult typedResult = apiResponseResult as OkObjectResult;
            List<FundingStructureItem> fundingStructureItems = typedResult?.Value as List<FundingStructureItem>;
            fundingStructureItems?.Count.Should().Be(3);
            fundingStructureItems.Should().BeEquivalentTo(expectedFundingStructureItems);
        }

        private void ValidScenarioSetup()
        {
            var specificationSummary = new SpecificationSummary
            {
                Id = SpecificationId,
                TemplateIds = new Dictionary<string, string>
                {
                    [FundingStreamId] = TemplateVersion
                }
            };

            var templateMetadataContents = new TemplateMetadataContents
            {
                RootFundingLines = new List<FundingLine>
                {
                    new FundingLine
                    {
	                    Name = "FundingLine-1"
                    },
                    new FundingLine
                    {
                        Name = "FundingLine-2-withFundingLines",
                        FundingLines = new List<FundingLine>
                        {
                            new FundingLine {Name = "FundingLine-2-fl-1"},
                            new FundingLine
                            {
                                Name = "FundingLine-2-fl-2",
                                FundingLines = new List<FundingLine>
                                {
                                    new FundingLine {Name = "FundingLine-2-fl-2-fl-1"}
                                }
                            }
                        }
                    },
                    new FundingLine
                    {
                        Name = "FundingLine-3-withCalculationsAndFundingLines",
                        FundingLines = new List<FundingLine>
                        {
                            new FundingLine {Name = "FundingLine-3-fl-1"}
                        },
                        Calculations = new List<Calculation>
                        {
                            new Calculation {Name = "FundingLine-3-calc-1", TemplateCalculationId = 1},
                            new Calculation
                            {
                                Name = "FundingLine-3-calc-2",
                                TemplateCalculationId = 1,
                                Calculations = new List<Calculation>
                                {
                                    new Calculation {Name = "FundingLine-3-calc-2-calc-1", TemplateCalculationId = 2}
                                }
                            }
                        }
                    }
                }
            };

            _specificationsApiClient.GetSpecificationSummaryById(SpecificationId)
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

            _policiesApiClient.GetFundingTemplateContents(FundingStreamId, TemplateVersion)
                .Returns(new ApiResponse<TemplateMetadataContents>(HttpStatusCode.OK, templateMetadataContents));

            _calculationsApiClient.GetTemplateMapping(SpecificationId, FundingStreamId)
                .Returns(new ApiResponse<TemplateMapping>(HttpStatusCode.OK, new TemplateMapping
                {
                    FundingStreamId = FundingStreamId,
                    SpecificationId = SpecificationId,
                    TemplateMappingItems = new List<TemplateMappingItem>
                    {
                        new TemplateMappingItem
                        {
                            TemplateId = 1,
                            CalculationId = CalculationId
                        },
                        new TemplateMappingItem
                        {
                            TemplateId = 2,
                            CalculationId = "CalculationIdForTemplateCalculationId2"
                        }
                    }
                }));
        }

        private static List<FundingStructureItem> GetValidMappedFundingStructureItems()
        {
	        var result = new List<FundingStructureItem>
	        {
		        new FundingStructureItem(1, "FundingLine-1", null, FundingStructureType.FundingLine),
		        new FundingStructureItem(1, "FundingLine-2-withFundingLines", null, FundingStructureType.FundingLine,
			        new List<FundingStructureItem>
			        {
				        new FundingStructureItem(2, "FundingLine-2-fl-1", null, FundingStructureType.FundingLine),
				        new FundingStructureItem(2, "FundingLine-2-fl-2", null, FundingStructureType.FundingLine,
					        new List<FundingStructureItem>
					        {
						        new FundingStructureItem(3, "FundingLine-2-fl-2-fl-1", null,
							        FundingStructureType.FundingLine)
					        })
			        }),
		        new FundingStructureItem(1, "FundingLine-3-withCalculationsAndFundingLines", null,
			        FundingStructureType.FundingLine,
			        new List<FundingStructureItem>
			        {
				        new FundingStructureItem(
					        2, 
					        "FundingLine-3-calc-1", 
					        CalculationId,
					        FundingStructureType.Calculation),
				        new FundingStructureItem(
					        2, 
					        "FundingLine-3-calc-2", 
					        CalculationId,
					        FundingStructureType.Calculation,
						        new List<FundingStructureItem>
						        {
							        new FundingStructureItem(
								        3, 
								        "FundingLine-3-calc-2-calc-1",
								        "CalculationIdForTemplateCalculationId2", 
								        FundingStructureType.Calculation)
						        }),
				        new FundingStructureItem(
					        2, 
					        "FundingLine-3-fl-1",
					        null, 
					        FundingStructureType.FundingLine)
			        })
	        };

            return result;
        }
    }
}
