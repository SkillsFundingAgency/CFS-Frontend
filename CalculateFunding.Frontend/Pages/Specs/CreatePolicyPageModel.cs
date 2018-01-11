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

        public CreatePolicyPageModel(ISpecsApiClient specsClient, IMapper mapper)
        {
            _specsClient = specsClient;
            _mapper = mapper;
        }

        public IActionResult OnGet(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            SpecificationId = specificationId;

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId)
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
                return Page();
            }

            CreatePolicyModel policy = _mapper.Map<CreatePolicyModel>(CreatePolicyViewModel);

            policy.SpecificationId = specificationId;

            await _specsClient.PostPolicy(policy);

            return Redirect($"/specs/policies?specificationId={specificationId}");
        }
    }


}