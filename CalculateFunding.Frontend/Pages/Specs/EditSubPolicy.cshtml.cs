namespace CalculateFunding.Frontend.Pages.Specs
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Serilog;

    public class EditSubPolicyPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;
        private readonly IAuthorizationHelper _authorizationHelper;

        public EditSubPolicyPageModel(ISpecsApiClient specsClient, IMapper mapper, ILogger logger, IAuthorizationHelper authorizationHelper)
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
        public EditSubPolicyViewModel EditSubPolicyViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        public List<SelectListItem> Policies { get; set; }

        public string ParentPolicyId { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId, string subPolicyId, string parentPolicyId)
        {
            Guard.IsNullOrWhiteSpace(subPolicyId, nameof(subPolicyId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(parentPolicyId, nameof(parentPolicyId));

            SpecificationId = specificationId;
            ParentPolicyId = parentPolicyId;

            (Specification specification, IActionResult error) specificationQuery = await GetSpecification(specificationId);
            if (specificationQuery.error != null)
            {
                return specificationQuery.error;
            }

            Specification specification = specificationQuery.specification;

            if (!await _authorizationHelper.DoesUserHavePermission(User, specification, SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

            PopulateSpecificationProperites(specification);

            foreach (Policy policy in specification.Policies)
            {
                if (!policy.SubPolicies.IsNullOrEmpty())
                {
                    if (policy.Id == parentPolicyId)
                    {
                        Policy subPolicy = policy.SubPolicies.FirstOrDefault(m => m.Id == subPolicyId);

                        if (subPolicy != null)
                        {
                            if (subPolicy.Id == subPolicyId)
                            {
                                this.EditSubPolicyViewModel = _mapper.Map<EditSubPolicyViewModel>(subPolicy);
                            }
                        }
                    }
                }
            }

            if (EditSubPolicyViewModel == null)
            {
                return NotFound("Sub Policy not found");
            }

            return Page();

        }

        public async Task<IActionResult> OnPostAsync(string specificationId, string subPolicyId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            (Specification specification, IActionResult error) specificationQuery = await GetSpecification(specificationId);
            if (specificationQuery.error != null)
            {
                return specificationQuery.error;
            }

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationQuery.specification, SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

            if (!ModelState.IsValid)
            {
                PopulateSpecificationProperites(specificationQuery.specification);

                return Page();
            }

            EditSubPolicyModel updateSubPolicyModel = _mapper.Map<EditSubPolicyModel>(EditSubPolicyViewModel);

            updateSubPolicyModel.SpecificationId = specificationId;

            ValidatedApiResponse<Policy> updateSubPolicyResult = await _specsClient.UpdateSubPolicy(specificationId, subPolicyId, updateSubPolicyModel);

            if (updateSubPolicyResult.StatusCode == HttpStatusCode.OK)
            {
                return Redirect($"/specs/policies/{specificationId}?operationType=SubpolicyUpdated&operationId={updateSubPolicyResult.Content.Id}");
            }
            else if (updateSubPolicyResult.StatusCode == HttpStatusCode.BadRequest)
            {
                updateSubPolicyResult.AddValidationResultErrors(ModelState);

                Specification specification = specificationQuery.specification;

                PopulateSpecificationProperites(specification);

                return Page();
            }
            else
            {
                return new InternalServerErrorResult($"Unable to update policy. API returned {updateSubPolicyResult.StatusCode}");
            }
        }

        private void PopulateSpecificationProperites(Specification specification)
        {
            if (specification != null)
            {
                SpecificationName = specification.Name;

                FundingPeriodName = specification.FundingPeriod.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                PopulatePolicies(specification);
            }
        }

        private void PopulatePolicies(Specification specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            Policies = specification.Policies != null ? specification.Policies?.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Selected = m.Id == ParentPolicyId
            }).ToList() : new List<SelectListItem>();

            //To accomodate change in parent policy id
            Policies.Insert(0, new SelectListItem() { Text = "No parent policy", Value = "" });
        }

        private async Task<(Specification specification, IActionResult error)> GetSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<Specification> specification = await _specsClient.GetSpecification(specificationId);
            IActionResult error = specification.IsSuccessOrReturnFailureResult("Specification");

            return (specification.Content, error);
        }
    }
}
