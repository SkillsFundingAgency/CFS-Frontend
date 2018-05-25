namespace CalculateFunding.Frontend.Pages.Specs
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using System.Net;
    using System.Threading.Tasks;
    using Serilog;
    using System;
    using CalculateFunding.Frontend.Extensions;
    using System.Collections.Generic;

    public class EditPolicyPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;

        public EditPolicyPageModel(ISpecsApiClient specsClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _specsClient = specsClient;
            _mapper = mapper;
            _logger = logger;
        }

        [BindProperty]
        public EditPolicyViewModel EditPolicyViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodId { get; set; }

        private string PolicyId { get; set; }

        public async Task<IActionResult> OnGetAsync( string specificationId, string policyId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            
            Guard.IsNullOrWhiteSpace(policyId, nameof(policyId));

            SpecificationId = specificationId;

            PolicyId = policyId;

            Specification specification = await GetSpecification(specificationId);

            if (specification != null)
            {
                SpecificationName = specification.Name;

                FundingPeriodId = specification.FundingPeriod.Id;

                foreach (Policy policy in specification.Policies)
                {
                     if(policy.Id == policyId)
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

            if (!ModelState.IsValid)
            {
                Specification specification = await GetSpecification(specificationId);
 
                if (specification == null)
                {
                    throw new InvalidOperationException($"Unable to retrieve specification model from the response. Specification Id value = {SpecificationId}");
                }

                SpecificationName = specification.Name;

                SpecificationId = specificationId;

                return Page();              
            }

            EditPolicyModel updatePolicy = _mapper.Map<EditPolicyModel>(EditPolicyViewModel);

            updatePolicy.SpecificationId = specificationId;

            ValidatedApiResponse<Policy> updatePolicyResult = await _specsClient.UpdatePolicy(specificationId, policyId, updatePolicy);

            if (updatePolicyResult.StatusCode == HttpStatusCode.OK)
            {
                return Redirect($"/specs/policies/{specificationId}&wasSuccess=true&policyType=Policy");
            }
            else if (updatePolicyResult.StatusCode == HttpStatusCode.BadRequest)
            {
                foreach (var validationResult in updatePolicyResult.ModelState)
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