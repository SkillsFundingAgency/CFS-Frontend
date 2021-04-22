using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.ViewModels.ObsoleteItems;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ObsoleteItemsControllerTests
    {
        private Mock<ICalculationsApiClient> _calculations;
        private Mock<IPoliciesApiClient> _policies;
        private Mock<ISpecificationsApiClient> _specifications;
        private ObsoleteItemsController _controller;

        [TestInitialize]
        public void SetUp()
        {
            _calculations = new Mock<ICalculationsApiClient>();
            _policies = new Mock<IPoliciesApiClient>();
            _specifications = new Mock<ISpecificationsApiClient>();

            _controller = new ObsoleteItemsController(
                _calculations.Object,
                _policies.Object,
                _specifications.Object);
        }

        [TestMethod]
        public async Task QueriesCalculationsAndObsoleteItemsToBuildResponseBySpecificationId()
        {
            string fundingStreamId = NewRandomString();
            string fundingPeriodId = NewRandomString();
            
            string specificationId = NewRandomString();
            string templateId = NewRandomString();

            string calculationIdOne = NewRandomString();
            string calculationIdTwo = NewRandomString();
            string calculationIdThree = NewRandomString();
            string calculationIdFour = NewRandomString();
            string calculationIdFive = NewRandomString();

            ObsoleteItem[] obsoleteItems = new[]
            {
                NewObsoleteItem(specificationId, calculationIdOne),
                NewObsoleteItem(specificationId, calculationIdOne, calculationIdTwo),
                NewObsoleteItem(specificationId, calculationIdThree, calculationIdFour),
                NewObsoleteItem(specificationId, calculationIdThree, calculationIdFive, calculationIdOne),
            };

            string calculationNameOne = NewRandomString();
            string calculationNameTwo = NewRandomString();
            string calculationNameThree = NewRandomString();
            string calculationNameFour = NewRandomString();
            string calculationNameFive = NewRandomString();

            Calculation[] calculations = new[]
            {
                NewCalculation(calculationIdOne, calculationNameOne, CalculationType.Additional),
                NewCalculation(calculationIdTwo, calculationNameTwo, CalculationType.Template),
                NewCalculation(calculationIdThree, calculationNameThree, CalculationType.Template),
                NewCalculation(calculationIdFour, calculationNameFour, CalculationType.Template),
                NewCalculation(calculationIdFive, calculationNameFive, CalculationType.Additional),
            };

            SpecificationSummary specificationSummary = NewSpecificationSummary(fundingStreamId,
                fundingPeriodId,
                templateId);

            GivenTheCalculations(specificationId, calculations);
            AndTheObsoleteItems(specificationId, obsoleteItems);
            AndTheSpecificationSummary(specificationId, specificationSummary);
            AndTheTemplateMetadataContents(fundingStreamId, fundingPeriodId, templateId, new TemplateMetadataDistinctContents());

            OkObjectResult result = await _controller.GetObsoleteItemsForSpecification(specificationId) as OkObjectResult;

            IEnumerable<ObsoleteItemViewModel> viewModels = result?.Value as IEnumerable<ObsoleteItemViewModel>;

            ObsoleteItemViewModel[] expectedViewModels = AsViewModels(obsoleteItems, calculations.ToDictionary(_ => _.Id));

            viewModels
                .Should()
                .BeEquivalentTo(expectedViewModels,
                    opt => opt.Excluding(_ => _.Title)
                        .Excluding(_ => _.AdditionalCalculations)
                        .Excluding(_ => _.TemplateCalculations));
        }

        private ObsoleteItemViewModel[] AsViewModels(IEnumerable<ObsoleteItem> obsoleteItems,
            IDictionary<string, Calculation> calculations)
            => obsoleteItems.Select(_ => new ObsoleteItemViewModel
            {
                Id = _.Id,
                CodeReference = _.CodeReference,
                ItemType = _.ItemType,
                SpecificationId = _.SpecificationId,
                EnumValueName = _.EnumValueName,
                FundingLineId = _.FundingLineId,
                FundingLineName = _.FundingLineName,
                FundingStreamId = _.FundingStreamId,
                TemplateCalculationId = _.TemplateCalculationId,
                TemplateCalculations = AsCalculationSummaries(_.CalculationIds, calculations),
            }).ToArray();

        private IEnumerable<CalculationSummaryViewModel> AsCalculationSummaries(IEnumerable<string> calculationIds,
            IDictionary<string, Calculation> calculationNames)
            => calculationIds.Select(_ => new CalculationSummaryViewModel
            {
                Id = _,
                Name = calculationNames.TryGetValue(_, out Calculation calculation) ? calculation.Name : null,
            });

        private void GivenTheCalculations(string specificationId,
            Calculation[] calculations)
            => _calculations.Setup(_ => _.GetCalculationsForSpecification(specificationId))
                .ReturnsAsync(new ApiResponse<IEnumerable<Calculation>>(HttpStatusCode.OK, calculations));

        private void AndTheObsoleteItems(string specificationId,
            ObsoleteItem[] obsoleteItems)
            => _calculations.Setup(_ => _.GetObsoleteItemsForSpecification(specificationId))
                .ReturnsAsync(new ApiResponse<IEnumerable<ObsoleteItem>>(HttpStatusCode.OK, obsoleteItems));

        private void AndTheSpecificationSummary(string specificationId,
            SpecificationSummary specificationSummary)
            => _specifications.Setup(_ => _.GetSpecificationSummaryById(specificationId))
                .ReturnsAsync(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specificationSummary));

        private void AndTheTemplateMetadataContents(string fundingStreamId,
            string fundingPeriodId,
            string templateId,
            TemplateMetadataDistinctContents metadataDistinctContents)
            => _policies.Setup(_ => _.GetDistinctTemplateMetadataContents(fundingStreamId,
                    fundingPeriodId,
                    templateId))
                .ReturnsAsync(new ApiResponse<TemplateMetadataDistinctContents>(HttpStatusCode.OK, metadataDistinctContents));

        private Calculation NewCalculation(string id,
            string name,
            CalculationType calculationType)
            => new Calculation
            {
                Id = id,
                Name = name,
                CalculationType = calculationType,
            };

        private Reference NewReference(string id = null)
            => new Reference
            {
                Id = id ?? NewRandomString()
            };

        private SpecificationSummary NewSpecificationSummary(string fundingStreamId,
            string fundingPeriodId,
            string templateId)
        => new SpecificationSummary
        {
            FundingStreams = new []
            {
                NewReference(fundingStreamId)
            },
            FundingPeriod = NewReference(fundingPeriodId),
            TemplateIds = new Dictionary<string, string>
            {
                {fundingStreamId, templateId}
            }
        };
        
        private ObsoleteItem NewObsoleteItem(
            string specificationId,
            params string[] calculationIds) => new ObsoleteItem
            {
                Id = NewRandomString(),
                CodeReference = NewRandomString(),
                ItemType = ObsoleteItemType.FundingLine,
                EnumValueName = NewRandomString(),
                TemplateCalculationId = NewRandomUint(),
                SpecificationId = specificationId,
                FundingLineId = NewRandomUint(),
                FundingStreamId = NewRandomString(),
                CalculationIds = calculationIds
            };

        private static uint NewRandomUint() => (uint)new Random().Next(int.MaxValue);

        private string NewRandomString() => Guid.NewGuid().ToString();
    }
}