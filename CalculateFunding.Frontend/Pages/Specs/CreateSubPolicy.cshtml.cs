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
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Properties;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;

    public class CreateSubPolicyPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public CreateSubPolicyPageModel(ISpecsApiClient specsClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        [BindProperty]
        public CreateSubPolicyViewModel CreateSubPolicyViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        public string ParentPolicyId { get; set; }

	    public bool IsAuthorizedToEdit { get; set; }

        public IEnumerable<SelectListItem> Policies { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            SpecificationId = specificationId;

            Specification specification = await GetSpecification(specificationId);

	        IsAuthorizedToEdit =
		        await _authorizationHelper.DoesUserHavePermission(User, specification,
			        SpecificationActionTypes.CanEditSpecification);

            if (specification != null)
            {
                FundingPeriodName = specification.FundingPeriod.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                SpecificationName = specification.Name;

                PopulatePolicies(specification);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            Specification specification = await GetSpecification(specificationId);

	        IsAuthorizedToEdit = await _authorizationHelper.DoesUserHavePermission(User, specification, SpecificationActionTypes.CanEditSpecification);
	        if (!IsAuthorizedToEdit)
            {
                return new ForbidResult();
            }

            if (!string.IsNullOrWhiteSpace(CreateSubPolicyViewModel.Name))
            {
                ApiResponse<Policy> existingPolicyResponse = await _specsClient.GetPolicyBySpecificationIdAndPolicyName(specificationId, CreateSubPolicyViewModel.Name);

                if (existingPolicyResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(CreateSubPolicyViewModel)}.{nameof(CreateSubPolicyViewModel.Name)}", ValidationMessages.PolicyNameAlreadyExists);
                }
            }

            if (!ModelState.IsValid)
            {
                SpecificationName = specification.Name;

                SpecificationId = specificationId;

                FundingPeriodName = specification.FundingPeriod.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                PopulatePolicies(specification);

                return Page();
            }

            CreateSubPolicyModel policy = _mapper.Map<CreateSubPolicyModel>(CreateSubPolicyViewModel);

            policy.SpecificationId = specificationId;

            ApiResponse<Policy> newPolicyResponse = await _specsClient.CreatePolicy(policy);

            Policy newPolicy = newPolicyResponse.Content;

            return Redirect($"/specs/policies/{specificationId}?operationType=SubpolicyCreated&operationId={newPolicy.Id}");
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