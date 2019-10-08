using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.TemplateMetadata.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Serilog;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class FundingLineStructureModel : PageModel
    {
        private readonly ISpecificationsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly ITemplateMetadataContentsAssemblerService _templateMetadataContentsAssemblerService;
        private readonly ICalculationsApiClient _calculationsApiClient;

        public FundingLineStructureModel(
            ISpecificationsApiClient specsClient,
            IDatasetsApiClient datasetsClient,
            ILogger logger,
            IMapper mapper,
            IAuthorizationHelper authorizationHelper,
            ITemplateMetadataContentsAssemblerService templateMetadataContentsAssemblerService,
            ICalculationsApiClient calculationsApiClient)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));
            Guard.ArgumentNotNull(templateMetadataContentsAssemblerService, nameof(templateMetadataContentsAssemblerService));
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));

            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _logger = logger;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
            _templateMetadataContentsAssemblerService = templateMetadataContentsAssemblerService;
            _calculationsApiClient = calculationsApiClient;
        }

        public SpecificationViewModel Specification { get; set; }

        public bool HasProviderDatasetsAssigned { get; set; }

        public PageBannerOperation PageBanner { get; set; }

        public string DoesUserHavePermissionToApprove { get; set; }

        public IDictionary<string, TemplateMetadataContents> TemplateData { get; set; }

        public IEnumerable<CalculationMetadata> Calculations { get; set; }

        public IDictionary<string, TemplateMapping> TemplateMappings { get; set; }

        public async Task<IActionResult> OnGet(string specificationId, PoliciesPageBannerOperationType? operationType, string operationId)
        {
            try
            {
                Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

                if (operationType.HasValue && string.IsNullOrWhiteSpace(operationId))
                {
	                return new PreconditionFailedResult("Operation ID not provided");
                }

                Task<ApiResponse<SpecificationSummary>> specificationResponseTask = _specsClient.GetSpecificationSummaryById(specificationId);

                Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> datasetSchemaResponseTask = _datasetsClient.GetAssignedDatasetSchemasForSpecification(specificationId);

                await TaskHelper.WhenAllAndThrow(specificationResponseTask, datasetSchemaResponseTask);

                ApiResponse<SpecificationSummary> specificationResponse = specificationResponseTask.Result;

                ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = datasetSchemaResponseTask.Result;

                if (specificationResponse == null)
                {
                    _logger.Error($"Specification API Request came back null for Specification ID = '{specificationId}'");
                    return new InternalServerErrorResult("Specification Lookup API Failed and returned null");
                }

                if (datasetSchemaResponse == null)
                {
                    _logger.Error($"Dataset Schema Response API Request came back null for Specification ID = '{specificationId}'");
                    return new InternalServerErrorResult("Datasets Lookup API Failed and returned null");
                }

                if (specificationResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    return new NotFoundObjectResult("Specification not found");
                }

                this.DoesUserHavePermissionToApprove = (await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanApproveSpecification)).ToString().ToLowerInvariant();

                SpecificationSummary specificationSummary = _mapper.Map<SpecificationSummary>(specificationResponse.Content);

                Specification = new SpecificationViewModel
                {
                    Id = specificationSummary.Id,
                    Name = specificationSummary.Name,
                    Description = specificationSummary.Description,
                    FundingPeriod = new ReferenceViewModel(specificationSummary.FundingPeriod.Id, specificationSummary.FundingPeriod.Name),
                    FundingStreams = specificationSummary.FundingStreams.Select(m => new ReferenceViewModel(m.Id, m.Name)),
                    PublishStatus = (PublishStatusViewModel)Enum.Parse(typeof(PublishStatusViewModel), specificationSummary.ApprovalStatus.ToString())
                };

                TemplateData = await _templateMetadataContentsAssemblerService.Assemble(specificationSummary);

                if (!TemplateData.IsNullOrEmpty())
                {
                    ApiResponse<IEnumerable<CalculationMetadata>> calculationsResponse = await _calculationsApiClient.GetCalculations(Specification.Id);

                    HandleApiResponse(calculationsResponse, specificationId, "Calculations lookup");

                    Calculations = calculationsResponse.Content?.Where(m => m.CalculationType == CalculationType.Template);
                }

                this.TemplateMappings = await SetTemplateMappings(specificationId);

                HasProviderDatasetsAssigned = datasetSchemaResponse.Content.Any(d => d.IsSetAsProviderData);

                if (operationType.HasValue)
                {
                    PageBanner = PopulatePageBanner(specificationId, operationType, operationId);
                }

                return Page();

            }
            catch (Exception e)
            {
                return new InternalServerErrorResult(e.Message);
            }
        }

        private PageBannerOperation PopulatePageBanner(string specificationId, PoliciesPageBannerOperationType? operationType, string operationId)
        {
			PageBannerOperation pageBanner = new PageBannerOperation();

	        switch (operationType.Value)
	        {
		        case PoliciesPageBannerOperationType.SpecificationCreated:
		        case PoliciesPageBannerOperationType.SpecificationUpdated:
			        pageBanner.EntityName = Specification.Name;
			        pageBanner.EntityType = "Specification";
			        pageBanner.OperationAction = "updated";
			        pageBanner.ActionText = "Edit";
			        pageBanner.ActionUrl = $"/specs/editspecification/{Specification.Id}&returnPage=ManagePolicies";

			        if (operationType.Value == PoliciesPageBannerOperationType.SpecificationUpdated)
			        {
				        pageBanner.OperationAction = "updated";
			        }
			        else if (operationType.Value == PoliciesPageBannerOperationType.SpecificationCreated)
			        {
				        pageBanner.OperationAction = "created";
			        }

			        break;

		        case PoliciesPageBannerOperationType.CalculationUpdated:
		        case PoliciesPageBannerOperationType.CalculationCreated:
			        if (Calculations.AnyWithNullCheck())
			        {
				        foreach (CalculationMetadata calculation in Calculations)
				        {
					        if (calculation.CalculationId == operationId)
					        {
						        pageBanner.EntityName = calculation.Name;
					        }
				        }
			        }

			        pageBanner.EntityType = "Calculation specification";
			        pageBanner.OperationAction = "updated";
			        pageBanner.ActionText = "Edit";
			        pageBanner.ActionUrl = $"/specs/EditCalculation/{operationId}?specificationId={specificationId}";

			        if (operationType.Value == PoliciesPageBannerOperationType.CalculationUpdated)
			        {
				        pageBanner.OperationAction = "updated";
			        }
			        else if (operationType.Value == PoliciesPageBannerOperationType.CalculationCreated)
			        {
				        pageBanner.OperationAction = "created";
			        }

			        break;
	        }

	        return pageBanner;
        }

        private async Task<IDictionary<string, TemplateMapping>> SetTemplateMappings(string specificationId)
        {
            Dictionary<string, TemplateMapping> templateMappings = new Dictionary<string, TemplateMapping>();

            foreach (var fundingStream in Specification.FundingStreams)
            {
                string id = fundingStream.Id;
                var templateMappingResponse = await _calculationsApiClient.GetTemplateMapping(specificationId, id);

                HandleApiResponse(templateMappingResponse, specificationId, "Template mapping");

                TemplateMapping mapping = templateMappingResponse.Content;

                templateMappings.Add(fundingStream.Id, mapping);
            }

            return templateMappings;
        }

        private void HandleApiResponse<T>(ApiResponse<T> apiResponse, string specificationId, string task)
        {
            if (apiResponse == null)
            {
                string message = $"{task} for Specification ID = '{specificationId}' returned null";

                _logger.Error(message);
                throw new Exception(message);
            }

            if (apiResponse.StatusCode != HttpStatusCode.OK)
            {
                string message = $"{task} for Specification ID = '{specificationId}' returned status {apiResponse.StatusCode}";

                _logger.Error(message);
                throw new Exception(message);
            }

            if (apiResponse.Content == null)
            {
                string message = $"{task} for Specification ID = '{specificationId}' completed but returned no content";
                _logger.Error(message);
                throw new Exception(message);
            }
        }
    }
}