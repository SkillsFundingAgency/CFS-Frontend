using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Helpers;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.ProviderResults;
using Microsoft.AspNetCore.Mvc;
using CalculationMetadata = CalculateFunding.Common.ApiClient.Calcs.Models.CalculationMetadata;
using TemplateMapping = CalculateFunding.Common.ApiClient.Calcs.Models.TemplateMapping;
using TemplateMappingItem = CalculateFunding.Common.ApiClient.Calcs.Models.TemplateMappingItem;

namespace CalculateFunding.Frontend.Controllers
{
    [ApiController]
    public class ProviderResultsController : ControllerBase
    {
        private readonly ISpecificationsApiClient _specsClient;
        private readonly IResultsApiClient _resultsClient;
        private readonly IPoliciesApiClient _policiesClient;
        private readonly ICalculationsApiClient _calculationsClient;

        public ProviderResultsController(ISpecificationsApiClient specificationsApiClient,
            IResultsApiClient resultsApiClient,
            IPoliciesApiClient policiesApiClient,
            ICalculationsApiClient calculationsApiClient)
        {
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(calculationsApiClient));

            _specsClient = specificationsApiClient;
            _resultsClient = resultsApiClient;
            _policiesClient = policiesApiClient;
            _calculationsClient = calculationsApiClient;
        }

        [HttpGet("api/results/specifications/{specificationId}/providers/{providerId}/template-results")]
        public async Task<IActionResult> GetFundingStructureResultsForProviderAndSpecification(
            [FromRoute] string providerId,
            [FromRoute] string specificationId)
        {
            Guard.ArgumentNotNull(providerId, nameof(providerId));
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            ApiResponse<SpecificationSummary> specificationResult = await _specsClient.GetSpecificationSummaryById(specificationId);
            IActionResult specificationErrorResult =
                            specificationResult.IsSuccessOrReturnFailureResult("GetFundingStructureResultsForProviderAndSpecification");
            if (specificationErrorResult != null)
            {
                return specificationErrorResult;
            }

            SpecificationSummary specification = specificationResult.Content;

            // NOTE: This API is designed with the assumption that there is only a single funding stream per specification.
            // The return type will need to change to be funding stream specific if more than one is ever used
            Reference fundingStream = specification.FundingStreams.First();

            string fundingStreamTemplateVersion = specification.TemplateIds[fundingStream.Id];

            Task<ApiResponse<TemplateMetadataDistinctContents>> distictTemplateContentsRequest = _policiesClient.GetDistinctTemplateMetadataContents(fundingStream.Id, specification.FundingPeriod.Id, fundingStreamTemplateVersion);
            Task<ApiResponse<TemplateMapping>> templateMappingRequest = _calculationsClient.GetTemplateMapping(specificationId, fundingStream.Id);
            Task<ApiResponse<Common.ApiClient.Results.Models.ProviderResultResponse>> calculationEngineResultsRequest = _resultsClient.GetProviderResults(providerId, specificationId);
            Task<ApiResponse<IEnumerable<CalculationMetadata>>> calculationMetadataRequest = _calculationsClient.GetCalculationMetadataForSpecification(specificationId);

            await TaskHelper.WhenAllAndThrow(distictTemplateContentsRequest, templateMappingRequest, calculationEngineResultsRequest, calculationMetadataRequest);

            IActionResult distictTemplateContentsErrorResult = distictTemplateContentsRequest.Result.IsSuccessOrReturnFailureResult(nameof(TemplateMetadataDistinctContents));
            IActionResult templateMappingErrorResult = templateMappingRequest.Result.IsSuccessOrReturnFailureResult(nameof(TemplateMapping));
            IActionResult calculationEngineResultsErrorResult = calculationEngineResultsRequest.Result.IsSuccessOrReturnFailureResult(nameof(Common.ApiClient.Results.Models.ProviderResultResponse));
            IActionResult calculationMetadataErrorResult = calculationMetadataRequest.Result.IsSuccessOrReturnFailureResult(nameof(CalculationMetadata));

            if (distictTemplateContentsErrorResult != null)
            {
                return distictTemplateContentsErrorResult;
            }

            if (templateMappingErrorResult != null)
            {
                return templateMappingErrorResult;
            }

            if (calculationEngineResultsErrorResult != null)
            {
                return calculationEngineResultsErrorResult;
            }

            if (calculationMetadataErrorResult != null)
            {
                return calculationMetadataErrorResult;
            }

            IEnumerable<TemplateMetadataCalculation> templateCalculations = distictTemplateContentsRequest.Result.Content.Calculations;
            IEnumerable<TemplateMetadataFundingLine> templateFundingLines = distictTemplateContentsRequest.Result.Content.FundingLines;

            IEnumerable<TemplateMappingItem> templateMapping = templateMappingRequest.Result.Content.TemplateMappingItems;

            Dictionary<uint, TemplateCalculationResult> calculationResults = GenerateCalculationResults(
                templateMapping,
                templateCalculations,
                calculationEngineResultsRequest.Result.Content.CalculationResults,
                calculationMetadataRequest.Result.Content
                );

            Dictionary<uint, FundingLineResult> fundingLineResults = GenerateFundingLineResults(templateFundingLines,
                calculationEngineResultsRequest.Result.Content.FundingLineResults);

            return Ok(new ProviderResultForSpecification()
            {
                SpecificationId = specificationId,
                SpecificationName = specification.Name,
                FundingStreamName = fundingStream.Name,
                FundingStreamId = fundingStream.Id,
                CalculationResults = calculationResults,
                FundingLineResults = fundingLineResults,
            });
        }

        private Dictionary<uint, TemplateCalculationResult> GenerateCalculationResults(
            IEnumerable<TemplateMappingItem> templateMapping,
            IEnumerable<TemplateMetadataCalculation> templateCalculations,
            IEnumerable<Common.ApiClient.Results.Models.CalculationResultResponse> calcEngineResults,
            IEnumerable<CalculationMetadata> specificationCalculationMetadata)
        {
            Dictionary<uint, TemplateCalculationResult> calculationResults = new Dictionary<uint, TemplateCalculationResult>();
            Dictionary<string, object> calculationValues = new Dictionary<string, object>();
            Dictionary<string, string> calculationExceptionMessages = new Dictionary<string, string>();
            foreach (Common.ApiClient.Results.Models.CalculationResultResponse calculationResult in calcEngineResults)
            {
                calculationValues.Add(calculationResult.Calculation.Id, calculationResult.Value);
                calculationExceptionMessages.Add(calculationResult.Calculation.Id, calculationResult.ExceptionMessage);
            }

            Dictionary<string, PublishStatus> approvalStatus = new Dictionary<string, PublishStatus>();
            foreach (CalculationMetadata calculation in specificationCalculationMetadata)
            {
                approvalStatus.Add(calculation.CalculationId, calculation.PublishStatus);
            }

            foreach (TemplateMetadataCalculation definition in templateCalculations)
            {
                string calculationId = templateMapping.FirstOrDefault(c => c.TemplateId == definition.TemplateCalculationId
                    && c.EntityType == Common.ApiClient.Calcs.Models.TemplateMappingEntityType.Calculation)?.CalculationId;

                TemplateCalculationResult result = new TemplateCalculationResult()
                {
                    TemplateCalculationType = definition.Type,
                    TemplateCalculationId = definition.TemplateCalculationId,
                    CalculationId = calculationId,
                    Name = definition.Name,
                    ValueFormat = definition.ValueFormat,
                };

                if (!string.IsNullOrWhiteSpace(calculationId))
                {
                    if (calculationValues.ContainsKey(calculationId))
                    {
                        result.Value = calculationValues[calculationId];
                    }

                    if (calculationExceptionMessages.ContainsKey(calculationId))
                    {
                        result.ExceptionMessage = calculationExceptionMessages[calculationId];
                    }

                    if (approvalStatus.ContainsKey(calculationId))
                    {
                        result.Status = approvalStatus[calculationId];
                    }
                }

                calculationResults.Add(definition.TemplateCalculationId, result);
            }

            return calculationResults;

        }

        private static Dictionary<uint, FundingLineResult> GenerateFundingLineResults(
            IEnumerable<TemplateMetadataFundingLine> templateFundingLines,
            IEnumerable<Common.ApiClient.Results.Models.FundingLineResult> fundingLineResultValues)
        {
            Dictionary<uint, FundingLineResult> fundingLineResults = new Dictionary<uint, FundingLineResult>();

            foreach (TemplateMetadataFundingLine fundingLine in templateFundingLines)
            {
                FundingLineResult result = new FundingLineResult()
                {
                    TemplateLineId = fundingLine.TemplateLineId,
                    Name = fundingLine.Name,
                    FundingLineCode = fundingLine.FundingLineCode
                };

                fundingLineResults.Add(fundingLine.TemplateLineId, result);
            }

            foreach (Common.ApiClient.Results.Models.FundingLineResult fundingLine in fundingLineResultValues)
            {
                if (uint.TryParse(fundingLine.FundingLine.Id, out uint fundingLineId))
                {
                    if (fundingLineResults.ContainsKey(fundingLineId))
                    {
                        FundingLineResult result = fundingLineResults[fundingLineId];
                        result.Value = fundingLine.Value;
                        result.ExceptionMessage = fundingLine.ExceptionMessage;
                    }
                }
            }

            return fundingLineResults;
        }
    }
}
