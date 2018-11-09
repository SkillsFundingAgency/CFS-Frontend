namespace CalculateFunding.Frontend.Pages.Specs
{
    using System;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;

    public class EditPolicyPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;
        private readonly IAuthorizationHelper _authorizationHelper;

        public EditPolicyPageModel(ISpecsApiClient specsClient, IMapper mapper, ILogger logger, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _mapper = mapper;
            _logger = logger;
            _authorizationHelper = authorizationHelper;
        }

        [BindProperty]
        public EditPolicyViewModel EditPolicyViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        private string PolicyId { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId, string policyId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(policyId, nameof(policyId));

            SpecificationId = specificationId;
            PolicyId = policyId;

            Specification specification = await GetSpecification(specificationId);

            if (!await _authorizationHelper.DoesUserHavePermission(User, specification, SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

            if (specification != null)
            {
                SpecificationName = specification.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                FundingPeriodName = specification.FundingPeriod.Name;

                foreach (Policy policy in specification.Policies)
                {
                    if (policy.Id == policyId)
                    {
                        this.EditPolicyViewModel = _mapper.Map<EditPolicyViewModel>(policy);
                        break;
                    }
                }
                return Page();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive specification");
            }
        }

        public async Task<IActionResult> OnPostAsync(string specificationId, string policyId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            Specification specification = await GetSpecification(specificationId);

            if (specification == null)
            {
                throw new InvalidOperationException($"Unable to retrieve specification model from the response. Specification Id value = {SpecificationId}");
            }

            if (!await _authorizationHelper.DoesUserHavePermission(User, specification, SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

            if (!ModelState.IsValid)
            {
                SpecificationName = specification.Name;

                SpecificationId = specificationId;

                return Page();
            }

            EditPolicyModel updatePolicy = _mapper.Map<EditPolicyModel>(EditPolicyViewModel);

            updatePolicy.SpecificationId = specificationId;

            ValidatedApiResponse<Policy> updatePolicyResult = await _specsClient.UpdatePolicy(specificationId, policyId, updatePolicy);

            if (updatePolicyResult.StatusCode == HttpStatusCode.OK)
            {
                return Redirect($"/specs/policies/{specificationId}?operationType=PolicyUpdated&operationId={updatePolicyResult.Content.Id}");
            }
            else if (updatePolicyResult.StatusCode == HttpStatusCode.BadRequest)
            {
                updatePolicyResult.AddValidationResultErrors(ModelState);

                if (specification != null)
                {
                    SpecificationName = specification.Name;

                    FundingPeriodId = specification.FundingPeriod.Id;
                }

                return Page();
            }
            else
            {
                return new InternalServerErrorResult($"Unable to update policy. API returned {updatePolicyResult}");
            }
        }

        private async Task<Specification> GetSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<Specification> specificationResponse = await _specsClient.GetSpecification(specificationId);

            if (specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
            {
                return specificationResponse.Content;
            }
            return null;
        }
    }
}