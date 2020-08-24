using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Common.TemplateMetadata.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Modules;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Microsoft.AspNetCore.Mvc;
using Calculation = CalculateFunding.Common.TemplateMetadata.Models.Calculation;

namespace CalculateFunding.Frontend.Controllers
{
    public class FundingLineStructureController : Controller
    {
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private readonly ICalculationsApiClient _calculationsApiClient;
        private readonly IResultsApiClient _resultsApiClient;

        public FundingLineStructureController(
            IPoliciesApiClient policiesApiClient,
            ISpecificationsApiClient specificationsApiClient,
            ICalculationsApiClient calculationsApiClient,
            IResultsApiClient resultsApiClient)
        {
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            _policiesApiClient = policiesApiClient;
            _specificationsApiClient = specificationsApiClient;
            _calculationsApiClient = calculationsApiClient;
            _resultsApiClient = resultsApiClient;
        }

        [Route("api/fundingstructures/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}/provider/{providerId}")]
        [HttpGet]
        public async Task<IActionResult> GetFundingStructuresByProviderId(
	        [FromRoute] string fundingStreamId,
	        [FromRoute] string fundingPeriodId,
	        [FromRoute] string specificationId,
	        [FromRoute] string providerId)
        {
	        ApiResponse<SpecificationSummary> specificationSummaryApiResponse =
		        await _specificationsApiClient.GetSpecificationSummaryById(specificationId);
	        IActionResult specificationSummaryApiResponseErrorResult =
		        specificationSummaryApiResponse.IsSuccessOrReturnFailureResult("GetSpecificationSummaryById");
	        if (specificationSummaryApiResponseErrorResult != null)
	        {
		        return specificationSummaryApiResponseErrorResult;
	        }

	        string templateVersion = specificationSummaryApiResponse.Content.TemplateIds.ContainsKey(fundingStreamId)
		        ? specificationSummaryApiResponse.Content.TemplateIds[fundingStreamId]
		        : null;
	        if (templateVersion == null)
		        return new InternalServerErrorResult(
			        $"Specification contains no matching template version for funding stream '{fundingStreamId}'");

            string etag = Request.ReadETagHeaderValue();

			ApiResponse<TemplateMetadataContents> fundingTemplateContentsApiResponse =
				await _policiesApiClient.GetFundingTemplateContents(fundingStreamId, fundingPeriodId, templateVersion, etag);

            Response.CopyCacheControlHeaders(fundingTemplateContentsApiResponse.Headers);

            if (fundingTemplateContentsApiResponse.StatusCode == HttpStatusCode.NotModified)
            {
                return new StatusCodeResult(304);
            }

	        IActionResult fundingTemplateContentsApiResponseErrorResult =
		        fundingTemplateContentsApiResponse.IsSuccessOrReturnFailureResult("GetFundingTemplateContents");
	        if (fundingTemplateContentsApiResponseErrorResult != null)
	        {
		        return fundingTemplateContentsApiResponseErrorResult;
	        }

	        ApiResponse<TemplateMapping> templateMappingResponse =
		        await _calculationsApiClient.GetTemplateMapping(specificationId, fundingStreamId);
	        IActionResult templateMappingResponseErrorResult =
		        templateMappingResponse.IsSuccessOrReturnFailureResult("GetTemplateMapping");
	        if (templateMappingResponseErrorResult != null)
	        {
		        return templateMappingResponseErrorResult;
	        }

	        ApiResponse<IEnumerable<CalculationMetadata>> calculationMetadata =
		        await _calculationsApiClient.GetCalculationMetadataForSpecification(specificationId);
	        IActionResult calculationMetadataErrorResult =
		        calculationMetadata.IsSuccessOrReturnFailureResult("calculationMetadata");
	        if (calculationMetadataErrorResult != null)
	        {
		        return calculationMetadataErrorResult;
	        }

	        ApiResponse<ProviderResultResponse> providerResultResponse =
		        await _resultsApiClient.GetProviderResults(providerId, specificationId);
	        IActionResult providerResultResponseErrorResult = providerResultResponse.IsSuccessOrReturnFailureResult("GetProviderResults");
	        if (providerResultResponseErrorResult != null)
	        {
		        return providerResultResponseErrorResult;
	        }

	        List<FundingStructureItem> fundingStructures = new List<FundingStructureItem>();
	        RecursivelyAddFundingLineToFundingStructure(
		        fundingStructures,
		        fundingTemplateContentsApiResponse.Content.RootFundingLines,
		        templateMappingResponse.Content.TemplateMappingItems.ToList(),
		        calculationMetadata.Content.ToList(),
		        providerResultResponse.Content,
                null);

	        return Ok(fundingStructures);
        }

        [Route(
            "api/fundingstructures/results/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}")]
        [HttpGet]
        public async Task<IActionResult> GetFundingStructuresWithCalculationResult(
            [FromRoute] string fundingStreamId,
            [FromRoute] string fundingPeriodId,
            [FromRoute] string specificationId,
            [FromRoute] string providerId)
        {
            ApiResponse<SpecificationSummary> specificationSummaryApiResponse =
                await _specificationsApiClient.GetSpecificationSummaryById(specificationId);
            IActionResult specificationSummaryApiResponseErrorResult =
                specificationSummaryApiResponse.IsSuccessOrReturnFailureResult("GetSpecificationSummaryById");
            if (specificationSummaryApiResponseErrorResult != null)
            {
                return specificationSummaryApiResponseErrorResult;
            }

            string templateVersion = specificationSummaryApiResponse.Content.TemplateIds.ContainsKey(fundingStreamId)
                ? specificationSummaryApiResponse.Content.TemplateIds[fundingStreamId]
                : null;
            if (templateVersion == null)
                return new InternalServerErrorResult(
                    $"Specification contains no matching template version for funding stream '{fundingStreamId}'");

            string etag = Request.ReadETagHeaderValue();

            ApiResponse<TemplateMetadataContents> fundingTemplateContentsApiResponse =
                await _policiesApiClient.GetFundingTemplateContents(fundingStreamId, fundingPeriodId, templateVersion,
                    etag);

            Response.CopyCacheControlHeaders(fundingTemplateContentsApiResponse.Headers);

            if (fundingTemplateContentsApiResponse.StatusCode == HttpStatusCode.NotModified)
            {
                return new StatusCodeResult(304);
            }

            IActionResult fundingTemplateContentsApiResponseErrorResult =
                fundingTemplateContentsApiResponse.IsSuccessOrReturnFailureResult("GetFundingTemplateContents");
            if (fundingTemplateContentsApiResponseErrorResult != null)
            {
                return fundingTemplateContentsApiResponseErrorResult;
            }

            ApiResponse<TemplateMapping> templateMappingResponse =
                await _calculationsApiClient.GetTemplateMapping(specificationId, fundingStreamId);
            IActionResult templateMappingResponseErrorResult =
                templateMappingResponse.IsSuccessOrReturnFailureResult("GetTemplateMapping");
            if (templateMappingResponseErrorResult != null)
            {
                return templateMappingResponseErrorResult;
            }

            ApiResponse<IEnumerable<CalculationMetadata>> calculationMetadata =
                await _calculationsApiClient.GetCalculationMetadataForSpecification(specificationId);
            IActionResult calculationMetadataErrorResult =
                calculationMetadata.IsSuccessOrReturnFailureResult("calculationMetadata");
            if (calculationMetadataErrorResult != null)
            {
                return calculationMetadataErrorResult;
            }

            ApiResponse<CalculationProviderResultSearchResults> calculationProviderResultsResponse =
                await _resultsApiClient.SearchCalculationProviderResults(new SearchModel
                {
                    PageNumber = 1,
                    Top = 10000,
                    SearchTerm = "",
                    IncludeFacets = false,
                    Filters = new Dictionary<string, string[]> {{"specificationId", new[] {specificationId}}}
                });
            IActionResult calculationProviderResultsErrorResult =
                calculationProviderResultsResponse.IsSuccessOrReturnFailureResult("SearchCalculationProviderResults");
            if (calculationProviderResultsErrorResult != null)
            {
                return calculationProviderResultsErrorResult;
            }

            List<FundingStructureItem> fundingStructures = new List<FundingStructureItem>();
            RecursivelyAddFundingLineToFundingStructure(
                fundingStructures,
                fundingTemplateContentsApiResponse.Content.RootFundingLines,
                templateMappingResponse.Content.TemplateMappingItems.ToList(),
                calculationMetadata.Content.ToList(),
                null,
                calculationProviderResultsResponse.Content);

            return Ok(fundingStructures);
        }

        [Route(
	        "api/fundingstructures/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}")]
        [HttpGet]
        public async Task<IActionResult> GetFundingStructures(
	        [FromRoute] string fundingStreamId,
	        [FromRoute] string fundingPeriodId,
	        [FromRoute] string specificationId)
        {
	        ApiResponse<SpecificationSummary> specificationSummaryApiResponse =
		        await _specificationsApiClient.GetSpecificationSummaryById(specificationId);
	        IActionResult specificationSummaryApiResponseErrorResult =
		        specificationSummaryApiResponse.IsSuccessOrReturnFailureResult("GetSpecificationSummaryById");
	        if (specificationSummaryApiResponseErrorResult != null)
	        {
		        return specificationSummaryApiResponseErrorResult;
	        }

	        string templateVersion = specificationSummaryApiResponse.Content.TemplateIds.ContainsKey(fundingStreamId)
		        ? specificationSummaryApiResponse.Content.TemplateIds[fundingStreamId]
		        : null;
	        if (templateVersion == null)
		        return new InternalServerErrorResult(
			        $"Specification contains no matching template version for funding stream '{fundingStreamId}'");

            string etag = Request.ReadETagHeaderValue();

			ApiResponse<TemplateMetadataContents> fundingTemplateContentsApiResponse =
				await _policiesApiClient.GetFundingTemplateContents(fundingStreamId, fundingPeriodId, templateVersion, etag);

            Response.CopyCacheControlHeaders(fundingTemplateContentsApiResponse.Headers);

            if (fundingTemplateContentsApiResponse.StatusCode == HttpStatusCode.NotModified)
            {
                return new StatusCodeResult(304);
            }

	        IActionResult fundingTemplateContentsApiResponseErrorResult =
		        fundingTemplateContentsApiResponse.IsSuccessOrReturnFailureResult("GetFundingTemplateContents");
	        if (fundingTemplateContentsApiResponseErrorResult != null)
	        {
		        return fundingTemplateContentsApiResponseErrorResult;
	        }

	        ApiResponse<TemplateMapping> templateMappingResponse =
		        await _calculationsApiClient.GetTemplateMapping(specificationId, fundingStreamId);
	        IActionResult templateMappingResponseErrorResult =
		        templateMappingResponse.IsSuccessOrReturnFailureResult("GetTemplateMapping");
	        if (templateMappingResponseErrorResult != null)
	        {
		        return templateMappingResponseErrorResult;
	        }

	        ApiResponse<IEnumerable<CalculationMetadata>> calculationMetadata =
		        await _calculationsApiClient.GetCalculationMetadataForSpecification(specificationId);
	        IActionResult calculationMetadataErrorResult =
		        calculationMetadata.IsSuccessOrReturnFailureResult("calculationMetadata");
	        if (calculationMetadataErrorResult != null)
	        {
		        return calculationMetadataErrorResult;
	        }

	        List<FundingStructureItem> fundingStructures = new List<FundingStructureItem>();
	        RecursivelyAddFundingLineToFundingStructure(
		        fundingStructures,
		        fundingTemplateContentsApiResponse.Content.RootFundingLines,
		        templateMappingResponse.Content.TemplateMappingItems.ToList(),
		        calculationMetadata.Content.ToList(),
		        null,
                null);

	        return Ok(fundingStructures);
        }

        private static FundingStructureItem RecursivelyAddFundingLines(IEnumerable<FundingLine> fundingLines,
	        List<TemplateMappingItem> templateMappingItems,
	        List<CalculationMetadata> calculationMetadata,
	        int level,
	        FundingLine fundingLine, 
	        ProviderResultResponse providerResult,
            CalculationProviderResultSearchResults calculationProviderResultSearchResults)
        {
            level++;

            List<FundingStructureItem> innerFundingStructureItems = new List<FundingStructureItem>();

            // If funding line has calculations, recursively add them to list of inner FundingStructureItems
            if (fundingLine.Calculations != null && fundingLine.Calculations.Any())
            {
                foreach (Calculation calculation in fundingLine.Calculations)
                {
                    innerFundingStructureItems.Add(
                        RecursivelyMapCalculationsToFundingStructureItem(
                            calculation,
                            level,
                            templateMappingItems,
                            calculationMetadata,
                            providerResult,
                            calculationProviderResultSearchResults));
                }
            }

            // If funding line has more funding lines, recursively add them to list of inner FundingStructureItems
            if (fundingLine.FundingLines != null && fundingLine.FundingLines.Any())
            {
                foreach (FundingLine line in fundingLines)
                {
                    innerFundingStructureItems.Add(RecursivelyAddFundingLines(
                        line.FundingLines,
                        templateMappingItems,
                        calculationMetadata,
                        level,
                        line,
                        providerResult, calculationProviderResultSearchResults));
                }
            }

            FundingLineResult fundingLineResult = providerResult?.FundingLineResults?.FirstOrDefault(c => c.FundingLine.Id == fundingLine.TemplateLineId.ToString());
            string calculationValue = null;
            string emptyCalculationType = null;
            if (fundingLineResult != null)
            {
	            CalculationValueTypeViewModel calculationValueTypeViewModel = CalculationValueTypeViewModel.Number;
                calculationValue = fundingLineResult.Value.AsFormatCalculationType(calculationValueTypeViewModel);
            }

            // Add FundingStructureItem
            var fundingStructureItem = MapToFundingStructureItem(
                level,
                fundingLine.Name,
                FundingStructureType.FundingLine,
                emptyCalculationType,
                null,
                null,
                innerFundingStructureItems.Any() ? innerFundingStructureItems : null,
                calculationValue);

            return fundingStructureItem;
        }

        private static void RecursivelyAddFundingLineToFundingStructure(List<FundingStructureItem> fundingStructures,
	        IEnumerable<FundingLine> fundingLines,
	        List<TemplateMappingItem> templateMappingItems,
	        List<CalculationMetadata> calculationMetadata,
	        ProviderResultResponse providerResult,
            CalculationProviderResultSearchResults calculationProviderResultSearchResults,
            int level = 0) =>
            fundingStructures.AddRange(fundingLines.Select(fundingLine =>
                RecursivelyAddFundingLines(
                    fundingLine.FundingLines,
                    templateMappingItems,
                    calculationMetadata,
                    level,
                    fundingLine,
                    providerResult,
                    calculationProviderResultSearchResults)));


        private static FundingStructureItem MapToFundingStructureItem(int level,
            string name,
            FundingStructureType type,
            string calculationType = null,
            string calculationId = null,
            string calculationPublishStatus = null,
            List<FundingStructureItem> fundingStructureItems = null,
            string value = null, 
            DateTimeOffset? lastUpdatedDate = null) =>
            new FundingStructureItem(
                level, name, calculationId, calculationPublishStatus, type, calculationType, fundingStructureItems, value, lastUpdatedDate);

        private static FundingStructureItem RecursivelyMapCalculationsToFundingStructureItem(Calculation calculation,
            int level, List<TemplateMappingItem> templateMappingItems,
            List<CalculationMetadata> calculationMetadata,
            ProviderResultResponse providerResult,
            CalculationProviderResultSearchResults calculationProviderResultSearchResults)
        {
            level++;

            FundingStructureItem fundingStructureItem = null;
            List<FundingStructureItem> innerFundingStructureItems = null;

            string calculationId = GetCalculationId(calculation, templateMappingItems);
            string calculationPublishStatus = calculationMetadata.FirstOrDefault(c => c.CalculationId == calculationId)?
                .PublishStatus.ToString();
            CalculationResultResponse calculationResult = providerResult?.CalculationResults.FirstOrDefault(c => c.Calculation.Id == calculationId);
            
            string calculationType = null;
            string calculationValue = null;

            if (calculationResult != null)
            {
	            calculationType = calculationResult.CalculationValueType.ToString();
	            CalculationValueTypeViewModel calculationValueTypeViewModel = calculationType.AsEnum<CalculationValueTypeViewModel>();
                calculationValue = calculationResult.Value.AsFormatCalculationType(calculationValueTypeViewModel);
            }

            DateTimeOffset? lastUpdatedDate = null;
            CalculationProviderResultSearchResult calculationProviderResult = calculationProviderResultSearchResults?.Results?.FirstOrDefault(c => c.Id == calculationId);
            if (calculationProviderResult != null)
            {
                lastUpdatedDate = calculationProviderResult.LastUpdatedDate;
            }
            
            if (calculation.Calculations != null && calculation.Calculations.Any())
            {
                innerFundingStructureItems = calculation.Calculations.Select(innerCalculation =>
                        RecursivelyMapCalculationsToFundingStructureItem(
                            innerCalculation,
                            level,
                            templateMappingItems,
                            calculationMetadata,
                            providerResult, 
                            calculationProviderResultSearchResults))
                    .ToList();
            }

            fundingStructureItem = MapToFundingStructureItem(
                level,
                calculation.Name,
                FundingStructureType.Calculation,
                calculationType,
                calculationId,
                calculationPublishStatus,
                innerFundingStructureItems,
                calculationValue,
                lastUpdatedDate);

            return fundingStructureItem;
        }

        private static string GetCalculationId(
            Calculation calculation,
            IEnumerable<TemplateMappingItem> templateMappingItems) =>
            templateMappingItems
                .FirstOrDefault(t => t.TemplateId == calculation.TemplateCalculationId)?.CalculationId;
    }
}
