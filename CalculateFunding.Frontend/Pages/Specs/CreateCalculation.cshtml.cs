namespace CalculateFunding.Frontend.Pages.Specs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
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
    using CalculateFunding.Frontend.Properties;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;

    public class CreateCalculationPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        private static readonly IEnumerable<string> _calculationTypes = new[] { CalculationSpecificationType.Funding.ToString(), CalculationSpecificationType.Number.ToString() };

        public CreateCalculationPageModel(ISpecsApiClient specsClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        [BindProperty]
        public CreateCalculationViewModel CreateCalculationViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        public string PolicyId { get; set; }

        public string PolicyName { get; set; }

        public string AllocationLineId { get; set; }

        public string CalculationType { get; set; }

        public IList<SelectListItem> Policies { get; set; }

        public IEnumerable<SelectListItem> AllocationLines { get; set; }

        public IEnumerable<SelectListItem> CalculationTypes { get; set; }

		public bool IsAuthorizedtoEdit { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            SpecificationId = specificationId;

            Specification specification = await GetSpecification(specificationId);

	        IsAuthorizedtoEdit =
		        await _authorizationHelper.DoesUserHavePermission(User, specification,
			        SpecificationActionTypes.CanEditSpecification);

            if (specification != null)
            {
                FundingPeriodName = specification.FundingPeriod.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                SpecificationName = specification.Name;

                return await PopulateForm(specification);
            }

            return Page();
        }

        private async Task<IActionResult> PopulateForm(Specification specification)
        {
            IActionResult populateResult = await PopulateAllocationLines(specification.Id);
            if (populateResult != null)
            {
                return populateResult;
            }

            if (AllocationLines.IsNullOrEmpty())
            {
                return new InternalServerErrorResult($"Failed to load allocation lines for specification id: {specification.Id}");
            }

            PopulatePolicies(specification);

            PopulateCalculationTypes();

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            Specification specification = await GetSpecification(specificationId);

            if (!await _authorizationHelper.DoesUserHavePermission(User, specification, SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

            if (!string.IsNullOrWhiteSpace(CreateCalculationViewModel.Name))
            {
                ApiResponse<Calculation> existingCalculationResponse = await _specsClient.GetCalculationBySpecificationIdAndCalculationName(specificationId, CreateCalculationViewModel.Name);

                if (existingCalculationResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(CreateCalculationViewModel)}.{nameof(CreateCalculationViewModel.Name)}", ValidationMessages.CalculationNameAlreadyExists);
                }
            }

            if (CreateCalculationViewModel.CalculationType == "Funding" && string.IsNullOrWhiteSpace(CreateCalculationViewModel.AllocationLineId))
            {
                this.ModelState.AddModelError($"{nameof(CreateCalculationViewModel)}.{nameof(CreateCalculationViewModel.AllocationLineId)}", ValidationMessages.CalculationAllocationLineRequired);
            }

            if (!ModelState.IsValid)
            {
                SpecificationName = specification.Name;

                SpecificationId = specificationId;

                FundingPeriodName = specification.FundingPeriod.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                return await PopulateForm(specification);
            }

            CalculationCreateModel calculation = _mapper.Map<CalculationCreateModel>(CreateCalculationViewModel);

            calculation.SpecificationId = specificationId;

            ApiResponse<Calculation> newCalculationResponse = await _specsClient.CreateCalculation(calculation);

            if (newCalculationResponse.StatusCode == HttpStatusCode.OK)
            {
                Calculation newCalculation = newCalculationResponse.Content;

                return Redirect($"/specs/policies/{specificationId}?operationType=CalculationCreated&operationId={newCalculation.Id}");
            }
            else
            {
                throw new InvalidOperationException($"Unable to create calculation specifications. Status Code = {newCalculationResponse.StatusCode}");
            }
        }

        private void PopulateCalculationTypes()
        {
            CalculationTypes = _calculationTypes.Select(m => new SelectListItem
            {
                Value = m,
                Text = m,
                Selected = string.Equals(m, CalculationType, StringComparison.InvariantCultureIgnoreCase)
            });
        }

        private void PopulatePolicies(Specification specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            Policies = new List<SelectListItem>();

            if (specification.Policies != null)
            {
                SelectListGroup policiesGroup = new SelectListGroup { Name = "Policies" };
                SelectListGroup subPoliciesGroup = new SelectListGroup { Name = "Subpolicies" };

                foreach (Policy policy in specification.Policies)
                {
                    Policies.Add(new SelectListItem
                    {
                        Value = policy.Id,
                        Text = policy.Name,
                        Selected = policy.Id == PolicyId,
                        Group = policiesGroup
                    });

                    if (policy.SubPolicies != null)
                    {
                        foreach (Policy subPolicy in policy.SubPolicies)
                        {
                            Policies.Add(new SelectListItem
                            {
                                Value = subPolicy.Id,
                                Text = subPolicy.Name,
                                Selected = subPolicy.Id == PolicyId,
                                Group = subPoliciesGroup
                            });
                        }
                    }
                }
            }
        }

        private async Task<IActionResult> PopulateAllocationLines(string specificationId)
        {
            List<SelectListItem> result = new List<SelectListItem>();

            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = await _specsClient.GetFundingStreamsForSpecification(specificationId);
            if (fundingStreamResponse == null)
            {
                return new InternalServerErrorResult("Funding Stream lookup API call returned null");
            }

            if (fundingStreamResponse.StatusCode != HttpStatusCode.OK)
            {
                return new InternalServerErrorResult($"Funding Stream lookup API call returned HTTP Error '{fundingStreamResponse.StatusCode}'");
            }

            if (fundingStreamResponse.Content == null)
            {
                return new InternalServerErrorResult("Funding Stream lookup API call content returned null");
            }

            foreach (FundingStream fundingStream in fundingStreamResponse.Content)
            {
                result.AddRange(fundingStream.AllocationLines.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                    Selected = m.Id == AllocationLineId
                }));
            }

            AllocationLines = result.OrderBy(c => c.Text);

            return null;
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