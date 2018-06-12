namespace CalculateFunding.Frontend.Pages.Specs
{
    using AutoMapper;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;
    using Microsoft.AspNetCore.Mvc;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using System.Collections.Generic;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using System.Linq;
    using System;

    public class EditSubPolicyPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;

        public EditSubPolicyPageModel(ISpecsApiClient specsClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _specsClient = specsClient;
            _mapper = mapper;
            _logger = logger;
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

            Specification specification = await GetSpecification(specificationId);

            if (specification != null)
            {
                SpecificationName = specification.Name;

                FundingPeriodName = specification.FundingPeriod.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                PopulatePolicies(specification);

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

                return Page();
            }
            else
            {
                return new NotFoundObjectResult($"Unable to retreive specification for the given specification id: " +specificationId);
            }
        }

        public async Task<IActionResult> OnPostAsync(string specificationId, string subPolicyId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (!ModelState.IsValid)
            {
                Specification specification = await GetSpecification(specificationId);

                if (specification == null)
                {
                    throw new InvalidOperationException($"Unable to retrieve specification model from the response. Specification Id value = {SpecificationId}");
                }

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
                foreach (var validationResult in updateSubPolicyResult.ModelState)
                {
                    List<string> errors = new List<string>(validationResult.Value);
                    for (int i = 0; i < errors.Count; i++)
                    {
                        ModelState.AddModelError($"{validationResult.Key}.{i}", errors[i]);
                    }
                }

                Specification specification = await GetSpecification(specificationId);

                if (specification != null)
                {
                    SpecificationName = specification.Name;

                    FundingPeriodName = specification.FundingPeriod.Name;

                    FundingPeriodId = specification.FundingPeriod.Id;

                    PopulatePolicies(specification);
                }
                return Page();
            }
            else
            {
                return new InternalServerErrorResult($"Unable to update policy. API returned {updateSubPolicyResult.StatusCode}");
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
