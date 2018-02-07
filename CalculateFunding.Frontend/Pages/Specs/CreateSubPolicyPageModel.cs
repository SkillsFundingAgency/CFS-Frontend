using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Linq;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Clients.CommonModels;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class CreateSubPolicyPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;

        [BindProperty]
        public CreateSubPolicyViewModel CreateSubPolicyViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string AcademicYearId { get; set; }

        public string AcademicYearName { get; set; }

        public string ParentPolicyId { get; set; }

        public IEnumerable<SelectListItem> Policies { get; set; }

        public CreateSubPolicyPageModel(ISpecsApiClient specsClient, IMapper mapper)
        {
            _specsClient = specsClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            SpecificationId = specificationId;

            Specification specification = await GetSpecification(specificationId);

            if (specification != null)
            {
                AcademicYearName = specification.AcademicYear.Name;

                AcademicYearId = specification.AcademicYear.Id;

                SpecificationName = specification.Name;

                PopulatePolicies(specification);
            }

            //if null then should redirect somewhere else, error or not found page

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

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
                Specification specification = await GetSpecification(specificationId);

                SpecificationName = specification.Name;

                SpecificationId = specificationId;

                AcademicYearName = specification.AcademicYear.Name;

                AcademicYearId = specification.AcademicYear.Id;

                PopulatePolicies(specification);

                return Page();
            }

            CreateSubPolicyModel policy = _mapper.Map<CreateSubPolicyModel>(CreateSubPolicyViewModel);

            policy.SpecificationId = specificationId;

            ApiResponse<Policy> newPolicyResponse = await _specsClient.PostPolicy(policy);

            Policy newPolicy = newPolicyResponse.Content;

            return Redirect($"/specs/policies/{specificationId}#policy-{newPolicy.Id}");
        }

        void PopulatePolicies(Specification specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            Policies = specification.Policies != null ? specification.Policies?.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Selected = (m.Id == ParentPolicyId)
            }).ToList() : new List<SelectListItem>();

        }

        async Task<Specification> GetSpecification(string specificationId)
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