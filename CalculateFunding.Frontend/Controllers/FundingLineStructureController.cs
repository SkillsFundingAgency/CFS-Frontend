using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.TemplateMetadata.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Modules;
using Microsoft.AspNetCore.Mvc;
using Calculation = CalculateFunding.Common.TemplateMetadata.Models.Calculation;

namespace CalculateFunding.Frontend.Controllers
{
    public class FundingLineStructureController : Controller
    {
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private readonly ICalculationsApiClient _calculationsApiClient;

        public FundingLineStructureController(
            IPoliciesApiClient policiesApiClient,
            ISpecificationsApiClient specificationsApiClient,
            ICalculationsApiClient calculationsApiClient)
        {
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));
            _policiesApiClient = policiesApiClient;
            _specificationsApiClient = specificationsApiClient;
            _calculationsApiClient = calculationsApiClient;
        }

        [Route("api/fundingstructures/specifications/{specificationId}/fundingstreams/{fundingStreamId}")]
		[HttpGet]
        public async Task<IActionResult> GetFundingStructures(
            [FromRoute]string fundingStreamId,
            [FromRoute]string specificationId)
        {
            SpecificationSummary specificationSummary;
            ApiResponse<SpecificationSummary> specificationSummaryApiResponse = 
	            await _specificationsApiClient.GetSpecificationSummaryById(specificationId);

            if (specificationSummaryApiResponse.StatusCode == HttpStatusCode.OK)
            {
                specificationSummary = specificationSummaryApiResponse.Content;
            }
            else
            {
                if (specificationSummaryApiResponse.StatusCode == HttpStatusCode.BadRequest)
                {
                    return new BadRequestResult();
                }

                return new InternalServerErrorResult(
	                $"There was an issue with retrieving specification '{specificationId}'");
            }

            string templateVersion = specificationSummary.TemplateIds[fundingStreamId];
            if (templateVersion == null)
	            return new InternalServerErrorResult(
		            $"Specification contains no matching template version for funding stream '{fundingStreamId}'");

            ApiResponse<TemplateMetadataContents> fundingTemplateContentsApiResponse =
                await _policiesApiClient.GetFundingTemplateContents(fundingStreamId, templateVersion);

            if (fundingTemplateContentsApiResponse.StatusCode == HttpStatusCode.OK)
            {
	            ApiResponse<TemplateMapping> templateMapping =
		            await _calculationsApiClient.GetTemplateMapping(specificationId, fundingStreamId);
	            if (templateMapping.StatusCode == HttpStatusCode.BadRequest)
	            {
					return new BadRequestResult();
	            }

	            if (templateMapping.StatusCode != HttpStatusCode.OK || templateMapping.Content == null)
	            {
		            return new InternalServerErrorResult(
		            $"There was an issue with retrieving template mapping for Specification '{specificationId}' and Funding Stream '{fundingStreamId}'");
	            }

	            List<FundingStructureItem> fundingStructures = new List<FundingStructureItem>();
                RecursivelyAddFundingLineToFundingStructure(
                    fundingStructures,
                    fundingTemplateContentsApiResponse.Content.RootFundingLines,
                    templateMapping.Content.TemplateMappingItems);

                return Ok(fundingStructures);
            }

            if (fundingTemplateContentsApiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        private static void RecursivelyAddFundingLineToFundingStructure(List<FundingStructureItem> fundingStructures,
	        IEnumerable<FundingLine> fundingLines,
	        IEnumerable<TemplateMappingItem> templateMappingItems,
	        int level = 0)
        {
			level++;

            foreach (FundingLine fundingLine in fundingLines)
            {
                //1 - add FundingLine to the structure
                AddToFundingStructureItem(
	                fundingStructures,  
					level,
	                fundingLine.Name,
	                FundingStructureType.FundingLine);

                //2 - Recursively add any lower lever Calculations to structure with increment level
                if (fundingLine.Calculations != null && fundingLine.Calculations.Any())
                {
	                RecursivelyAddCalculationsToFundingStructure(
						fundingStructures, 
						fundingLine.Calculations, 
						level,
						templateMappingItems);
                }

                //3 - Recursively add any lower lever FundingLines to structure with increment level
                if (fundingLine.FundingLines != null && fundingLine.FundingLines.Any())
                {
	                RecursivelyAddFundingLineToFundingStructure(
		                fundingStructures, 
		                fundingLine.FundingLines, 
						templateMappingItems,
		                level);
                }
            }
        }

        private static void RecursivelyAddCalculationsToFundingStructure(List<FundingStructureItem> fundingStructures,
	        IEnumerable<Calculation> calculations,
	        int level, IEnumerable<TemplateMappingItem> templateMappingItems)
        {
	        level++;

	        foreach (Calculation calculation in calculations)
	        {
		        
		        TemplateMappingItem templateMappingItem = templateMappingItems
			        .FirstOrDefault(t => t.TemplateId == calculation.TemplateCalculationId);

		        string calculationId = templateMappingItem?.CalculationId;

		        AddToFundingStructureItem(
			        fundingStructures,
			        level,
			        calculation.Name,
			        FundingStructureType.Calculation,
					calculationId
		        );

                if (calculation.Calculations != null && calculation.Calculations.Any())
                {
					RecursivelyAddCalculationsToFundingStructure(
						fundingStructures, 
						calculation.Calculations,
						level,
						templateMappingItems);
                }
	        }
        }

        private static void AddToFundingStructureItem(
	        List<FundingStructureItem> fundingStructures,
	        int level, 
            string name, 
            FundingStructureType type,
	        string calculationId = null) =>
	        fundingStructures.Add(new FundingStructureItem(level, name, calculationId, type));
    }
}
