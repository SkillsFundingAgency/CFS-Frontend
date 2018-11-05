namespace CalculateFunding.Frontend.Pages.Specs
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;

    public class PoliciesModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public PoliciesModel(ISpecsApiClient specsClient, IDatasetsApiClient datasetsClient, ILogger logger, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _logger = logger;
            _mapper = mapper;
        }

        public SpecificationViewModel Specification { get; set; }

        public bool HasProviderDatasetsAssigned { get; set; }

        public PageBannerOperation PageBanner { get; set; }

        public async Task<IActionResult> OnGet(string specificationId, PoliciesPageBannerOperationType? operationType, string operationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            Task<ApiResponse<Specification>> specificationResponseTask = _specsClient.GetSpecification(specificationId);

            Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> datasetSchemaResponseTask = _datasetsClient.GetAssignedDatasetSchemasForSpecification(specificationId);

            await TaskHelper.WhenAllAndThrow(specificationResponseTask, datasetSchemaResponseTask);

            ApiResponse<Specification> specificationResponse = specificationResponseTask.Result;

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = datasetSchemaResponseTask.Result;

            if (specificationResponse == null)
            {
                _logger.Warning("Specification API Request came back null for Specification ID = '{specificationId}'", specificationId);
                return new ObjectResult("Specification Lookup API Failed and returned null")
                {
                    StatusCode = 500
                };
            }

            if (datasetSchemaResponse == null)
            {
                _logger.Warning("Dataset Schema Response API Request came back null for Specification ID = '{specificationId}'", specificationId);
                return new ObjectResult("Datasets Lookup API Failed and returned null")
                {
                    StatusCode = 500
                };
            }

            if (specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Specification not found");
            }

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Warning("Dataset Schema Response API Request came back with '{statusCode}' for Specification ID = '{specificationId}'", specificationResponse.StatusCode, specificationId);
                return new ObjectResult("Specification Lookup API Failed")
                {
                    StatusCode = 500
                };
            }

            if (datasetSchemaResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Warning("Dataset Schema Response API Request came back with '{statusCode} for Specification ID = '{specificationId}'", datasetSchemaResponse.StatusCode, specificationId);
                return new ObjectResult("Datasets Schema API Failed")
                {
                    StatusCode = 500
                };
            }

            this.Specification = _mapper.Map<SpecificationViewModel>(specificationResponse.Content);

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
                    case PoliciesPageBannerOperationType.PolicyUpdated:
                    case PoliciesPageBannerOperationType.PolicyCreated:
                        PageBanner.EntityName = Specification.Policies.Where(p => p.Id == operationId).FirstOrDefault()?.Name;
                        PageBanner.EntityType = "Policy";
                        PageBanner.ActionText = "Edit";
                        PageBanner.ActionUrl = $"/specs/editPolicy/{specificationId}/{operationId}";

                        if (operationType.Value == PoliciesPageBannerOperationType.PolicyUpdated)
                        {
                            PageBanner.OperationAction = "updated";
                        }
                        else if (operationType.Value == PoliciesPageBannerOperationType.PolicyCreated)
                        {
                            PageBanner.OperationAction = "created";
                        }

                        break;
                    case PoliciesPageBannerOperationType.SubpolicyUpdated:
                    case PoliciesPageBannerOperationType.SubpolicyCreated:
                        string policyId = null;
                        if (Specification.Policies.AnyWithNullCheck())
                        {
                            foreach (PolicyViewModel policy in Specification.Policies)
                            {
                                if (policy.SubPolicies.AnyWithNullCheck())
                                {
                                    foreach (PolicyViewModel subpolicy in policy.SubPolicies)
                                    {
                                        if (subpolicy.Id == operationId)
                                        {
                                            PageBanner.EntityName = subpolicy.Name;
                                            policyId = policy.Id;
                                        }
                                    }
                                }
                            }
                        }
                        PageBanner.EntityType = "Subpolicy";
                        PageBanner.ActionText = "Edit";
                        PageBanner.ActionUrl = $"/specs/EditSubPolicy/{specificationId}/{operationId}/{policyId}";

                        if (operationType.Value == PoliciesPageBannerOperationType.SubpolicyUpdated)
                        {
                            PageBanner.OperationAction = "updated";
                        }
                        else if (operationType.Value == PoliciesPageBannerOperationType.SubpolicyCreated)
                        {
                            PageBanner.OperationAction = "created";
                        }
                        break;
                    case PoliciesPageBannerOperationType.CalculationUpdated:
                    case PoliciesPageBannerOperationType.CalculationCreated:
                        if (Specification.Policies.AnyWithNullCheck())
                        {
                            foreach (PolicyViewModel policy in Specification.Policies)
                            {
                                if (policy.SubPolicies.AnyWithNullCheck())
                                {
                                    foreach (PolicyViewModel subpolicy in policy.SubPolicies)
                                    {
                                        if (subpolicy.Calculations.AnyWithNullCheck())
                                        {
                                            foreach (CalculationViewModel calculation in subpolicy.Calculations)
                                            {
                                                if (calculation.Id == operationId)
                                                {
                                                    PageBanner.EntityName = calculation.Name;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (policy.Calculations.AnyWithNullCheck())
                                {
                                    foreach (CalculationViewModel calculation in policy.Calculations)
                                    {
                                        if (calculation.Id == operationId)
                                        {
                                            PageBanner.EntityName = calculation.Name;
                                        }
                                    }
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