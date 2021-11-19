using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Helpers;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.ProviderResults;
using Microsoft.AspNetCore.Mvc;
using CalculationMetadata = CalculateFunding.Common.ApiClient.Calcs.Models.CalculationMetadata;
using FundingLineResult = CalculateFunding.Frontend.ViewModels.ProviderResults.FundingLineResult;
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
        private readonly IPublishingApiClient _publishingApiClient;
        private readonly IAuthorizationHelper _authHelper;

        public ProviderResultsController(ISpecificationsApiClient specificationsApiClient,
            IResultsApiClient resultsApiClient,
            IPoliciesApiClient policiesApiClient,
            ICalculationsApiClient calculationsApiClient,
            IPublishingApiClient publishingApiClient,
            IAuthorizationHelper authHelper)
        {
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));
            Guard.ArgumentNotNull(publishingApiClient, nameof(publishingApiClient));
            Guard.ArgumentNotNull(authHelper, nameof(authHelper));

            _specsClient = specificationsApiClient;
            _resultsClient = resultsApiClient;
            _policiesClient = policiesApiClient;
            _calculationsClient = calculationsApiClient;
            _publishingApiClient = publishingApiClient;
            _authHelper = authHelper;
        }

        [HttpGet("api/results/specifications/{specificationId}/providers/{providerId}/template-results/{useCalcEngine}")]
        public async Task<IActionResult> GetFundingStructureResultsForProviderAndSpecification(
            [FromRoute] string providerId,
            [FromRoute] string specificationId,
            [FromRoute] bool useCalcEngine = true)
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<SpecificationSummary> specificationResult = await _specsClient.GetSpecificationSummaryById(specificationId);
            IActionResult specificationErrorResult =
                            specificationResult.IsSuccessOrReturnFailureResult("GetSpecificationSummaryById");
            if (specificationErrorResult != null)
            {
                return specificationErrorResult;
            }

            SpecificationSummary specification = specificationResult.Content;

            // NOTE: This API is designed with the assumption that there is only a single funding stream per specification.
            // The return type will need to change to be funding stream specific if more than one is ever used
            Reference fundingStream = specification.FundingStreams.First();

            string fundingStreamTemplateVersion = specification.TemplateIds[fundingStream.Id];

            List<Task> tasks = new List<Task>();

            Task<ApiResponse<TemplateMetadataDistinctContents>> distictTemplateContentsRequest = _policiesClient.GetDistinctTemplateMetadataContents(fundingStream.Id, specification.FundingPeriod.Id, fundingStreamTemplateVersion);
            Task<ApiResponse<TemplateMapping>> templateMappingRequest = _calculationsClient.GetTemplateMapping(specificationId, fundingStream.Id);

            tasks.Add(distictTemplateContentsRequest);
            tasks.Add(templateMappingRequest);

            Task<ApiResponse<ProviderResultResponse>> calculationEngineResultsRequest = null;
            Task<ApiResponse<Common.ApiClient.Publishing.Models.PublishedProviderVersion>> publishProviderResultsRequest = null;

            if (useCalcEngine)
            {
                calculationEngineResultsRequest = _resultsClient.GetProviderResults(providerId, specificationId);
                tasks.Add(calculationEngineResultsRequest);
            }
            else
            {
                publishProviderResultsRequest = _publishingApiClient.GetCurrentPublishedProviderVersion(specificationId, fundingStream.Id, providerId);
                tasks.Add(publishProviderResultsRequest);
            }
            
            Task<ApiResponse<IEnumerable<CalculationMetadata>>> calculationMetadataRequest = _calculationsClient.GetCalculationMetadataForSpecification(specificationId);
            tasks.Add(calculationMetadataRequest);

            await TaskHelper.WhenAllAndThrow(tasks.ToArray());

            IActionResult distictTemplateContentsErrorResult = distictTemplateContentsRequest.Result.IsSuccessOrReturnFailureResult(nameof(TemplateMetadataDistinctContents));
            IActionResult templateMappingErrorResult = templateMappingRequest.Result.IsSuccessOrReturnFailureResult(nameof(TemplateMapping));

            IEnumerable<(string id, object value, string exception)> calcResults = null;
            IEnumerable<(string id, decimal? value, string exception)> fundingResults = null;

            if (useCalcEngine)
            {
                IActionResult calculationEngineResultsErrorResult = calculationEngineResultsRequest.Result.IsSuccessOrReturnFailureResult(nameof(Common.ApiClient.Results.Models.ProviderResultResponse));

                if (calculationEngineResultsErrorResult != null)
                {
                    return calculationEngineResultsErrorResult;
                }

                calcResults = calculationEngineResultsRequest.Result.Content.CalculationResults.Select(_ => (_.Calculation.Id, _.Value, _.ExceptionMessage));
                fundingResults = calculationEngineResultsRequest.Result.Content.FundingLineResults.Select(_ => (_.FundingLine.Id, _.Value, _.ExceptionMessage));
            }
            else
            {
                IActionResult publishedProviderResultsErrorResult = publishProviderResultsRequest.Result.IsSuccessOrReturnFailureResult(nameof(Common.ApiClient.Publishing.Models.PublishedProviderVersion));

                if (publishedProviderResultsErrorResult != null)
                {
                    return publishedProviderResultsErrorResult;
                }

                calcResults = publishProviderResultsRequest.Result.Content.Calculations.Select(_ => (_.TemplateCalculationId.ToString(), _.Value, string.Empty));
                fundingResults = publishProviderResultsRequest.Result.Content.FundingLines.Select(_ => (_.TemplateLineId.ToString(), _.Value, string.Empty));
            }
            
            IActionResult calculationMetadataErrorResult = calculationMetadataRequest.Result.IsSuccessOrReturnFailureResult(nameof(CalculationMetadata));

            if (distictTemplateContentsErrorResult != null)
            {
                return distictTemplateContentsErrorResult;
            }

            if (templateMappingErrorResult != null)
            {
                return templateMappingErrorResult;
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
                calcResults,
                calculationMetadataRequest.Result.Content
                );

            Dictionary<uint, FundingLineResult> fundingLineResults = GenerateFundingLineResults(templateFundingLines,
                fundingResults);

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

        

        [HttpGet]
        [Route("api/results/specification-calculation-results-metadata/{specificationId}")]
        public async Task<IActionResult> GetSpecificationCalculationResultsMetadata([FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<SpecificationCalculationResultsMetadata> response =
                await _resultsClient.GetSpecificationCalculationResultsMetadata(specificationId);

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("GetSpecificationCalculationResultsMetadata");
            if (errorResult != null)
            {
                return errorResult;
            }

            return new OkObjectResult(response.Content);
        }

        [HttpPost]
        [Route("api/results/specifications/{specificationId}/run-populate-calculation-results-qa-database-job")]
        public async Task<IActionResult> RunGenerateCalculationResultQADatabasePopulationJob([FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            EffectiveSpecificationPermission effectiveSpecificationPermission = await _authHelper.GetEffectivePermissionsForUser(User, specificationId);

            if (!effectiveSpecificationPermission.CanRefreshPublishedQa)
            {
                return new ForbidResult();
            }

            PopulateCalculationResultQADatabaseRequest populateCalculationResultQADatabaseRequest = new PopulateCalculationResultQADatabaseRequest
            {
                SpecificationId = specificationId
            };

            ApiResponse<Job> response = await _resultsClient.RunGenerateCalculationResultQADatabasePopulationJob(populateCalculationResultQADatabaseRequest);

            IActionResult errorResult = response.IsSuccessOrReturnFailureResult(nameof(RunGenerateCalculationResultQADatabasePopulationJob));
            if (errorResult != null)
            {
                return errorResult;
            }

            return new OkObjectResult(response.Content);
        }

        private Dictionary<uint, TemplateCalculationResult> GenerateCalculationResults(
            IEnumerable<TemplateMappingItem> templateMapping,
            IEnumerable<TemplateMetadataCalculation> templateCalculations,
            IEnumerable<(string calculationId, object value, string exception)> calcEngineResults,
            IEnumerable<CalculationMetadata> specificationCalculationMetadata)
        {
            Guard.ArgumentNotNull(templateMapping, nameof(templateMapping));
            Guard.ArgumentNotNull(templateCalculations, nameof(templateCalculations));
            Guard.ArgumentNotNull(calcEngineResults, nameof(calcEngineResults));
            Guard.ArgumentNotNull(specificationCalculationMetadata, nameof(specificationCalculationMetadata));

            Dictionary<uint, TemplateCalculationResult> calculationResults = new Dictionary<uint, TemplateCalculationResult>();
            Dictionary<string, object> calculationValues = new Dictionary<string, object>();
            Dictionary<string, string> calculationExceptionMessages = new Dictionary<string, string>();
            foreach ((string calculationId, object value, string exception) in calcEngineResults)
            {
                calculationValues.Add(calculationId, value);
                calculationExceptionMessages.Add(calculationId, exception);
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
                    else if(calculationValues.ContainsKey(definition.TemplateCalculationId.ToString()))
                    {
                        result.Value = calculationValues[definition.TemplateCalculationId.ToString()];
                    }

                    if (calculationExceptionMessages.ContainsKey(calculationId))
                    {
                        result.ExceptionMessage = calculationExceptionMessages[calculationId];
                    }
                    else if(calculationValues.ContainsKey(definition.TemplateCalculationId.ToString()))
                    {
                        result.ExceptionMessage = calculationExceptionMessages[definition.TemplateCalculationId.ToString()];
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
            IEnumerable<(string id, decimal? value, string exception)> fundingLineResultValues)
        {
            Guard.ArgumentNotNull(templateFundingLines, nameof(templateFundingLines));
            Guard.ArgumentNotNull(fundingLineResultValues, nameof(fundingLineResultValues));

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

            foreach ((string id, decimal? value, string exception) in fundingLineResultValues)
            {
                if (uint.TryParse(id, out uint fundingLineId))
                {
                    if (fundingLineResults.ContainsKey(fundingLineId))
                    {
                        FundingLineResult result = fundingLineResults[fundingLineId];
                        result.Value = value;
                        result.ExceptionMessage = exception;
                    }
                }
            }

            return fundingLineResults;
        }
    }
}
