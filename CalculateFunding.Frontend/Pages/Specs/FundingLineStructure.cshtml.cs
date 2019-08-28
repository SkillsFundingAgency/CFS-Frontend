namespace CalculateFunding.Frontend.Pages.Specs
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Common;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Common.TemplateMetadata.Models;
    using CalculateFunding.Common.ApiClient.Calcs;
    using CalculateFunding.Common.ApiClient.Calcs.Models;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using System;

    public class FundingLineStructureModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly ITemplateMetadataContentsAssemblerService _templateMetadataContentsAssemblerService;
        private readonly ICalculationsApiClient _calculationsApiClient;

        public FundingLineStructureModel(
            ISpecsApiClient specsClient, 
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

        public IEnumerable<TemplateMetadataContents> TemplateData { get; set; }

        public IEnumerable<CalculationMetadata> Calculations { get; set; }

        public async Task<IActionResult> OnGet(string specificationId, PoliciesPageBannerOperationType? operationType, string operationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            Task<ApiResponse<SpecificationSummary>> specificationResponseTask = _specsClient.GetSpecificationSummary(specificationId);

            var fundinglines = _specsClient.GetFundingStreamsForSpecification(specificationId);

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

            this.DoesUserHavePermissionToApprove = (await _authorizationHelper.DoesUserHavePermission(User, specificationResponse.Content, SpecificationActionTypes.CanApproveSpecification)).ToString().ToLowerInvariant();

            Common.ApiClient.Specifications.Models.SpecificationSummary specificationSummary = _mapper.Map<Common.ApiClient.Specifications.Models.SpecificationSummary>(specificationResponse.Content);

            Specification = new SpecificationViewModel
            {
                Id = specificationSummary.Id,
                Name = specificationSummary.Name,
                FundingPeriod = new ReferenceViewModel(specificationSummary.FundingPeriod.Id, specificationSummary.FundingPeriod.Name),
                FundingStreams = specificationSummary.FundingStreams.Select(m => new ReferenceViewModel(m.Id, m.Name)),
                PublishStatus = (PublishStatusViewModel)Enum.Parse(typeof(PublishStatusViewModel), specificationSummary.ApprovalStatus.ToString())
            };

            TemplateData = await _templateMetadataContentsAssemblerService.Assemble(specificationSummary);

            if (!TemplateData.IsNullOrEmpty())
            {
                ApiResponse<IEnumerable<CalculationMetadata>> calculationsResponse = await _calculationsApiClient.GetCalculations(Specification.Id);

                if (calculationsResponse != null || calculationsResponse.Content == null)
                {
                    Calculations = calculationsResponse.Content?.Where(m => m.CalculationType == CalculationType.Template);
                }
                else
                {
                    _logger.Error($"Calculations for Specification ID = '{specificationId}' returned null");
                    return new InternalServerErrorResult("Calculations Lookup API Failed and returned null");
                }
            }

            HasProviderDatasetsAssigned = datasetSchemaResponse.Content.Any(d => d.IsSetAsProviderData);

            if (operationType.HasValue)
            {
                if (string.IsNullOrWhiteSpace(operationId))
                {
                    return new PreconditionFailedResult("Operation ID not provided");
                }

                PageBanner = new PageBannerOperation();
                switch (operationType.Value)
                {
                    case PoliciesPageBannerOperationType.SpecificationCreated:
                    case PoliciesPageBannerOperationType.SpecificationUpdated:
                        PageBanner.EntityName = Specification.Name;
                        PageBanner.EntityType = "Specification";
                        PageBanner.OperationAction = "updated";
                        PageBanner.ActionText = "Edit";
                        PageBanner.ActionUrl = $"/specs/editspecification/{Specification.Id}&returnPage=ManagePolicies";

                        if (operationType.Value == PoliciesPageBannerOperationType.SpecificationUpdated)
                        {
                            PageBanner.OperationAction = "updated";
                        }
                        else if (operationType.Value == PoliciesPageBannerOperationType.SpecificationCreated)
                        {
                            PageBanner.OperationAction = "created";
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
                                    PageBanner.EntityName = calculation.Name;
                                }
                            }
                        }
                        PageBanner.EntityType = "Calculation specification";
                        PageBanner.OperationAction = "updated";
                        PageBanner.ActionText = "Edit";
                        PageBanner.ActionUrl = $"/specs/EditCalculation/{operationId}?specificationId={specificationId}";

                        if (operationType.Value == PoliciesPageBannerOperationType.CalculationUpdated)
                        {
                            PageBanner.OperationAction = "updated";
                        }
                        else if (operationType.Value == PoliciesPageBannerOperationType.CalculationCreated)
                        {
                            PageBanner.OperationAction = "created";
                        }
                        break;
                }
            }

            return Page();
        }
    }
}