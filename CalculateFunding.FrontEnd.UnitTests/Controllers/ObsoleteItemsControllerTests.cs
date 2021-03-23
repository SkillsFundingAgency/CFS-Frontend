using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
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

        private ObsoleteItemsController _controller;
        
        [TestInitialize]
        public void SetUp()
        {
            _calculations = new Mock<ICalculationsApiClient>();

            _controller = new ObsoleteItemsController(_calculations.Object);
        }

        [TestMethod]
        public async Task QueriesCalculationsAndObsoleteItemsToBuildResponseBySpecificationId()
        {
            string specificationId = NewRandomString();
            
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
                NewCalculation(calculationIdOne, calculationNameOne),
                NewCalculation(calculationIdTwo, calculationNameTwo),
                NewCalculation(calculationIdThree, calculationNameThree),
                NewCalculation(calculationIdFour, calculationNameFour),
                NewCalculation(calculationIdFive, calculationNameFive),
            };
            
            GivenTheCalculations(specificationId, calculations);
            AndTheObsoleteItems(specificationId, obsoleteItems);
            
            OkObjectResult result = await _controller.GetObsoleteItemsForSpecification(specificationId) as OkObjectResult;

            IEnumerable<ObsoleteItemViewModel> viewModels = result?.Value as IEnumerable<ObsoleteItemViewModel>;

            ObsoleteItemViewModel[] expectedViewModels = AsViewModels(obsoleteItems, calculations.ToDictionary(_ => _.Id));

            viewModels
                .Should()
                .BeEquivalentTo<ObsoleteItemViewModel>(expectedViewModels);
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
                FundingStreamId = _.FundingStreamId,
                TemplateCalculationId = _.TemplateCalculationId,
                Calculations = AsCalculationSummaries(_.CalculationIds, calculations)
            }).ToArray();

        private IEnumerable<CalculationSummaryViewModel> AsCalculationSummaries(IEnumerable<string> calculationIds,
            IDictionary<string, Calculation> calculationNames)
            => calculationIds.Select(_ => new CalculationSummaryViewModel
            {
                Id = _,
                Name = calculationNames.TryGetValue(_, out Calculation calculation) ? calculation.Name : null,
                IsAdditionalCalculation = (calculationNames.TryGetValue(_, out calculation) ? calculation : null)?.CalculationType == CalculationType.Additional
            });

        private void GivenTheCalculations(string specificationId,
            Calculation[] calculations)
            => _calculations.Setup(_ => _.GetCalculationsForSpecification(specificationId))
                .ReturnsAsync(new ApiResponse<IEnumerable<Calculation>>(HttpStatusCode.OK, calculations));

        private void AndTheObsoleteItems(string specificationId,
            ObsoleteItem[] obsoleteItems)
            => _calculations.Setup(_ => _.GetObsoleteItemsForSpecification(specificationId))
                .ReturnsAsync(new ApiResponse<IEnumerable<ObsoleteItem>>(HttpStatusCode.OK, obsoleteItems));

        private Calculation NewCalculation(string id,
            string name)
            => new Calculation
            {
                Id = id,
                Name = name
            };

        private ObsoleteItem NewObsoleteItem(string specificationId,
            params string[] calculationIds) => new ObsoleteItem
        {
            Id = NewRandomString(),
            CodeReference = NewRandomString(),
            ItemType = NewRandomObsoleteItemType(),
            EnumValueName = NewRandomString(),
            TemplateCalculationId = NewRandomUint(),
            SpecificationId = specificationId,
            FundingLineId = NewRandomUint(),
            FundingStreamId = NewRandomString(),
            CalculationIds = calculationIds
        };

        private static uint NewRandomUint() => (uint) new Random().Next(int.MaxValue);

        private string NewRandomString() => Guid.NewGuid().ToString();

        private ObsoleteItemType NewRandomObsoleteItemType()
        {
            ObsoleteItemType[] possibleValues = Enum.GetValues(typeof(ObsoleteItemType))
                .Cast<ObsoleteItemType>()
                .ToArray();

            return possibleValues[new Random().Next(possibleValues.Length - 1)];
        }
    }
}