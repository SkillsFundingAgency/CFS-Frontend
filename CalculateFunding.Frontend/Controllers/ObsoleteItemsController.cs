using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.ObsoleteItems;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class ObsoleteItemsController : Controller
    {
        private readonly ICalculationsApiClient _calculations;
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly ISpecificationsApiClient _specsClient;

        public ObsoleteItemsController(ICalculationsApiClient calculations,
            IPoliciesApiClient policiesApiClient,
            ISpecificationsApiClient specificationsApiClient)
        {
            Guard.ArgumentNotNull(calculations, nameof(calculations));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));

            _calculations = calculations;
            _policiesApiClient = policiesApiClient;
            _specsClient = specificationsApiClient;
        }

        [HttpGet("api/specification/{specificationId}/obsoleteitems")]
        public async Task<IActionResult> GetObsoleteItemsForSpecification([FromRoute] string specificationId)
        {
            Task<ApiResponse<IEnumerable<Calculation>>> calculationsTask = _calculations.GetCalculationsForSpecification(specificationId);
            Task<ApiResponse<IEnumerable<ObsoleteItem>>> obsoleteItemsTask = _calculations.GetObsoleteItemsForSpecification(specificationId);
            Task<ApiResponse<SpecificationSummary>> specificationTask = _specsClient.GetSpecificationSummaryById(specificationId);

            await Task.WhenAll(calculationsTask, obsoleteItemsTask, specificationTask);


            IActionResult errorResult = specificationTask.Result.IsSuccessOrReturnFailureResult("Specifications");
            if (errorResult != null)
            {
                return errorResult;
            }

            SpecificationSummary specification = specificationTask.Result.Content;


            string fundingStreamId = specification.FundingStreams.First().Id;

            ApiResponse<TemplateMetadataDistinctContents> policyContents = await _policiesApiClient.GetDistinctTemplateMetadataContents(fundingStreamId, specification.FundingPeriod.Id, specification.TemplateIds[fundingStreamId]);

            ApiResponse<IEnumerable<Calculation>> calculationsResponse = calculationsTask.Result;

            errorResult = calculationsResponse.IsSuccessOrReturnFailureResult("Calculations");

            if (errorResult != null)
            {
                return errorResult;
            }

            ApiResponse<IEnumerable<ObsoleteItem>> obsoleteItemsResponse = obsoleteItemsTask.Result;

            errorResult = obsoleteItemsResponse.IsSuccessOrReturnFailureResult("ObsoleteItems", treatNoContentAsSuccess: true);

            if (errorResult != null)
            {
                return errorResult;
            }

            IEnumerable<ObsoleteItem> obsoleteItems = obsoleteItemsResponse.Content ?? ArraySegment<ObsoleteItem>.Empty;
            IEnumerable<Calculation> calculations = calculationsResponse.Content ?? ArraySegment<Calculation>.Empty;

            IDictionary<string, Calculation> templateCalculations = calculations
                .Where(c => c.CalculationType == CalculationType.Template)
                .ToDictionary(_ => _.Id);

            IDictionary<string, Calculation> additionalCalculations = calculations
                .Where(c => c.CalculationType == CalculationType.Additional)
                .ToDictionary(_ => _.Id);

            IEnumerable<ObsoleteItemViewModel> obsoleteItemViewModels = AsViewModels(obsoleteItems, templateCalculations, additionalCalculations, policyContents.Content);

            return Ok(obsoleteItemViewModels);
        }

        private IEnumerable<ObsoleteItemViewModel> AsViewModels(IEnumerable<ObsoleteItem> obsoleteItems,
            IDictionary<string, Calculation> templateCalculations,
            IDictionary<string, Calculation> additionalCalculations,
            TemplateMetadataDistinctContents policyContents)
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
                TemplateCalculations = AsCalculationSummaries(_.CalculationIds.Intersect(templateCalculations.Keys), templateCalculations),
                AdditionalCalculations = AsCalculationSummaries(_.CalculationIds.Intersect(additionalCalculations.Keys), additionalCalculations),
                Title = GenerateTitleForObsoleteItem(_, policyContents),
            });

        private string GenerateTitleForObsoleteItem(ObsoleteItem obsoleteItem, TemplateMetadataDistinctContents policyContents)
        {
            switch (obsoleteItem.ItemType)
            {
                case ObsoleteItemType.EnumValue:

                    TemplateMetadataCalculation calcInTemplate = policyContents.Calculations.Single(c => c.TemplateCalculationId == obsoleteItem.TemplateCalculationId);

                    return $"{obsoleteItem.EnumValueName} in {calcInTemplate.Name} is not valid";
                case ObsoleteItemType.FundingLine:
                    return $"Missing funding line - ID: {obsoleteItem.FundingLineId} Name: {obsoleteItem.FundingLineName}";
                default:
                    throw new InvalidOperationException($"Unknown obsolete item type {obsoleteItem.ItemType}");
            }
        }

        private IEnumerable<CalculationSummaryViewModel> AsCalculationSummaries(IEnumerable<string> calculationIds,
            IDictionary<string, Calculation> calculations)
            => calculationIds.Select(_ => AsCalculationSummary(calculations, _));

        private static CalculationSummaryViewModel AsCalculationSummary(IDictionary<string, Calculation> calculations,
            string id)
        {
            Calculation calculation = calculations.ContainsKey(id) ? calculations[id] : null;

            return new CalculationSummaryViewModel
            {
                Id = id,
                Name = calculation?.Name,
            };
        }
    }
}