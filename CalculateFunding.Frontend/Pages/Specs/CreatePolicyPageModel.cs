using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.CreateModels;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class CreatePolicyPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;

        [BindProperty]
        public CreatePolicyViewModel CreatePolicyViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string AcademicYearId { get; set; }

        public string AcademicYearName { get; set; }

        public CreatePolicyPageModel(ISpecsApiClient specsClient, IMapper mapper)
        {
            _specsClient = specsClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            SpecificationId = specificationId;

            ApiResponse<Specification> specificationResponse = await _specsClient.GetSpecification(specificationId);

            if(specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
            {
                Specification specification = specificationResponse.Content;

                AcademicYearName = specification.AcademicYear.Name;

                AcademicYearId = specification.AcademicYear.Id;

                SpecificationName = specification.Name;
            }
            
            //if null then should redirect somewhere else, error or not found page

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId, string specificationName)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

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
                SpecificationName = specificationName;

                return Page();
            }

            CreatePolicyModel policy = _mapper.Map<CreatePolicyModel>(CreatePolicyViewModel);

            policy.SpecificationId = specificationId;

            ApiResponse<Policy> newPolicyResponse = await _specsClient.PostPolicy(policy);

            Policy newPolicy = newPolicyResponse.Content;

            return Redirect($"/specs/policies/{specificationId}#policy-{newPolicy.Id}");
        }
    }
}