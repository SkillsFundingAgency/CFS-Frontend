namespace CalculateFunding.Frontend.Pages.Specs
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
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

        public CreateCalculationPageModel(ISpecsApiClient specsClient, IMapper mapper)
        {
            _specsClient = specsClient;
            _mapper = mapper;
        }

        [BindProperty]
        public CreateCalculationViewModel CreateCalculationViewModel { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string AcademicYearId { get; set; }

        public string AcademicYearName { get; set; }

        public string PolicyId { get; set; }

        public string PolicyName { get; set; }

        public string AllocationLineId { get; set; }

        public IList<SelectListItem> Policies { get; set; }

        public IEnumerable<SelectListItem> AllocationLines { get; set; }

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

                await PopulateAllocationLines();
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (!string.IsNullOrWhiteSpace(CreateCalculationViewModel.Name))
            {
                ApiResponse<Calculation> existingCalculationResponse = await _specsClient.GetCalculationBySpecificationIdAndCalculationName(specificationId, CreateCalculationViewModel.Name);

                if (existingCalculationResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(CreateCalculationViewModel)}.{nameof(CreateCalculationViewModel.Name)}", ValidationMessages.CalculationNameAlreadyExists);
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

                await PopulateAllocationLines();

                return Page();
            }

            CreateCalculationModel calculation = _mapper.Map<CreateCalculationModel>(CreateCalculationViewModel);

            calculation.SpecificationId = specificationId;

            ApiResponse<Calculation> newCalculationResponse = await _specsClient.PostCalculation(calculation);

            Calculation newCalculation = newCalculationResponse.Content;

            return Redirect($"/specs/policies/{specificationId}#calculation-{newCalculation.Id}");
        }

        private void PopulatePolicies(Specification specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            Policies = new List<SelectListItem>();

            if (specification.Policies != null)
            {
                var policiesGroup = new SelectListGroup { Name = "Policies" };
                var subPoliciesGroup = new SelectListGroup { Name = "Sub Policies" };

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

        private async Task PopulateAllocationLines()
        {
            ApiResponse<IEnumerable<Reference>> allocationLinesResponse = await _specsClient.GetAllocationLines();

            if (allocationLinesResponse != null && allocationLinesResponse.StatusCode == HttpStatusCode.OK)
            {
                AllocationLines = allocationLinesResponse.Content.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                    Selected = m.Id == AllocationLineId
                }).ToList();
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