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
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Properties;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class CreatePolicyPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public CreatePolicyPageModel(ISpecsApiClient specsClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        [BindProperty]
        public CreatePolicyViewModel CreatePolicyViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

		public bool IsAuthorizedToEdit { get; set; }

		public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            SpecificationId = specificationId;

            SpecificationSummary specification = await GetSpecification(specificationId);

	        IsAuthorizedToEdit =
		        await _authorizationHelper.DoesUserHavePermission(User, specification,
			        SpecificationActionTypes.CanEditSpecification);

            if (specification != null)
            {
                SpecificationName = specification.Name;

                FundingPeriodName = specification.FundingPeriod.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                return Page();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive specification");
            }
        }

        public async Task<IActionResult> OnPostAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            SpecificationSummary specification = await GetSpecification(specificationId);

			if (!await _authorizationHelper.DoesUserHavePermission(User, specification, SpecificationActionTypes.CanEditSpecification))
			{
				return new ForbidResult();
			}

			if (!string.IsNullOrWhiteSpace(CreatePolicyViewModel.Name))
            {
                ApiResponse<Policy> existingPolicyResponse = await _specsClient.GetPolicyBySpecificationIdAndPolicyName(specificationId, CreatePolicyViewModel.Name);

                if (existingPolicyResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(CreatePolicyViewModel)}.{nameof(CreatePolicyViewModel.Name)}", ValidationMessages.PolicyNameAlreadyExists);
                }
            }

            if (!ModelState.IsValid)
            {
                SpecificationName = specification.Name;

                SpecificationId = specificationId;

                FundingPeriodName = specification.FundingPeriod.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                return Page();
            }

            CreatePolicyModel policy = _mapper.Map<CreatePolicyModel>(CreatePolicyViewModel);

            policy.SpecificationId = specificationId;

            ApiResponse<Policy> newPolicyResponse = await _specsClient.CreatePolicy(policy);

            Policy newPolicy = newPolicyResponse.Content;

            return Redirect($"/specs/policies/{specificationId}?operationType=PolicyCreated&operationId={newPolicy.Id}");
        }

        private async Task<SpecificationSummary> GetSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummary(specificationId);

            if (specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
            {
                return specificationResponse.Content;
            }

            return null;
        }
    }
}