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

		[Route("api/fundingstructures/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}")]
		[HttpGet]
		public async Task<IActionResult> GetFundingStructures(
			[FromRoute] string fundingStreamId,
			[FromRoute] string fundingPeriodId,
			[FromRoute] string specificationId)
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
				await _policiesApiClient.GetFundingTemplateContents(fundingStreamId, fundingPeriodId, templateVersion);

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

				ApiResponse<IEnumerable<CalculationMetadata>> calculationMetadata =
					await _calculationsApiClient.GetCalculationMetadataForSpecification(specificationId);

				if (calculationMetadata.StatusCode == HttpStatusCode.BadRequest)
				{
					return new BadRequestResult();
				}

				if (calculationMetadata.StatusCode != HttpStatusCode.OK || calculationMetadata.Content == null)
				{
					return new InternalServerErrorResult(
						$"There was an issue with retrieving calculation metadata for Specification '{specificationId}'");
				}
				

				List<FundingStructureItem> fundingStructures = new List<FundingStructureItem>();
				RecursivelyAddFundingLineToFundingStructure(
					fundingStructures,
					fundingTemplateContentsApiResponse.Content.RootFundingLines,
					templateMapping.Content.TemplateMappingItems.ToList(),
					calculationMetadata.Content.ToList());

				return Ok(fundingStructures);
			}

			if (fundingTemplateContentsApiResponse.StatusCode == HttpStatusCode.BadRequest)
			{
				return new BadRequestResult();
			}

			return new StatusCodeResult(500);
		}

		private static FundingStructureItem RecursivelyAddFundingLines(
			IEnumerable<FundingLine> fundingLines,
			List<TemplateMappingItem> templateMappingItems,
			List<CalculationMetadata> calculationMetadata,
			int level,
			FundingLine fundingLine)
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
							calculationMetadata));
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
						line));
				}
			}

			// Add FundingStructureItem
			var fundingStructureItem = MapToFundingStructureItem(
				level,
				fundingLine.Name,
				FundingStructureType.FundingLine,
				null,
				null,
				innerFundingStructureItems.Any() ? innerFundingStructureItems : null);

			return fundingStructureItem;
		}

		private static void RecursivelyAddFundingLineToFundingStructure(
			List<FundingStructureItem> fundingStructures,
			IEnumerable<FundingLine> fundingLines,
			List<TemplateMappingItem> templateMappingItems,
			List<CalculationMetadata> calculationMetadata,
			int level = 0) =>
			fundingStructures.AddRange(fundingLines.Select(fundingLine =>
				RecursivelyAddFundingLines(
					fundingLine.FundingLines,
					templateMappingItems,
					calculationMetadata,
					level,
					fundingLine)));


		private static FundingStructureItem MapToFundingStructureItem(
			int level,
			string name,
			FundingStructureType type,
			string calculationId = null,
			string calculationPublishStatus = null,
			List<FundingStructureItem> fundingStructureItems = null) =>
			new FundingStructureItem(
				level, name, calculationId, calculationPublishStatus, type, fundingStructureItems);

		private static FundingStructureItem RecursivelyMapCalculationsToFundingStructureItem(
			Calculation calculation,
			int level, List<TemplateMappingItem> templateMappingItems,
			List<CalculationMetadata> calculationMetadata)

		{
			level++;

			FundingStructureItem fundingStructureItem = null;
			List<FundingStructureItem> innerFundingStructureItems = null;

			string calculationId = GetCalculationId(calculation, templateMappingItems);
			string calculationPublishStatus = calculationMetadata.FirstOrDefault(c => c.CalculationId == calculationId)?
				.PublishStatus.ToString();


			if (calculation.Calculations != null && calculation.Calculations.Any())
			{
				innerFundingStructureItems = calculation.Calculations.Select(innerCalculation =>
						RecursivelyMapCalculationsToFundingStructureItem(
							innerCalculation,
							level,
							templateMappingItems,
							calculationMetadata))
					.ToList();
			}

			fundingStructureItem = MapToFundingStructureItem(
				level,
				calculation.Name,
				FundingStructureType.Calculation,
				calculationId,
				calculationPublishStatus,
				innerFundingStructureItems);

			return fundingStructureItem;
		}

		private static string GetCalculationId(
			Calculation calculation,
			IEnumerable<TemplateMappingItem> templateMappingItems) =>
			templateMappingItems
				.FirstOrDefault(t => t.TemplateId == calculation.TemplateCalculationId)?.CalculationId;
	}
}
