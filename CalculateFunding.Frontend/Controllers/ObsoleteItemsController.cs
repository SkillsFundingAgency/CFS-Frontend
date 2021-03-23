using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.ObsoleteItems;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class ObsoleteItemsController : Controller
    {
        private readonly ICalculationsApiClient _calculations;

        public ObsoleteItemsController(ICalculationsApiClient calculations)
        {
            Guard.ArgumentNotNull(calculations, nameof(calculations));

            _calculations = calculations;
        }

        [HttpGet("api/specification/{specificationId}/obsoleteitems")]
        public async Task<IActionResult> GetObsoleteItemsForSpecification([FromRoute] string specificationId)
        {
            Task<ApiResponse<IEnumerable<Calculation>>> calculationsTask = _calculations.GetCalculationsForSpecification(specificationId);
            Task<ApiResponse<IEnumerable<ObsoleteItem>>> obsoleteItemsTask = _calculations.GetObsoleteItemsForSpecification(specificationId);

            await Task.WhenAll(calculationsTask, obsoleteItemsTask);

            ApiResponse<IEnumerable<Calculation>> calculationsResponse = calculationsTask.Result;
            
            IActionResult errorResult = calculationsResponse.IsSuccessOrReturnFailureResult("Calculations");
            
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

            IDictionary<string, Calculation> calculationLookup = calculations.ToDictionary(_ => _.Id);

            IEnumerable<ObsoleteItemViewModel> obsoleteItemViewModels = AsViewModels(obsoleteItems, calculationLookup);

            return Ok(obsoleteItemViewModels);
        }

        private IEnumerable<ObsoleteItemViewModel> AsViewModels(IEnumerable<ObsoleteItem> obsoleteItems,
            IDictionary<string, Calculation> calculationNames)
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
                Calculations = AsCalculationSummaries(_.CalculationIds, calculationNames)
            });

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
                IsAdditionalCalculation = calculation?.CalculationType == CalculationType.Additional
            };
        }
    }
}