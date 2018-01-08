using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.CreateModels;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class CreateSpecificationPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;

        private readonly IMapper _mapper;

        public IEnumerable<SelectListItem> FundingStreams { get; set; }

        [BindProperty]
        public Reference AcademicYear { get; set; }

        [BindProperty]
        public CreateSpecificationViewModel CreateSpecificationViewModel {get;set;}

        public string AcademicYearId { get; set; }

        public CreateSpecificationPageModel(ISpecsApiClient specsClient, IMapper mapper)
        {
            _specsClient = specsClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGetAsync(string academicYearId)
        {
            var yearsResponse = await _specsClient.GetAcademicYears();
            var years = yearsResponse.Content;

            AcademicYear = years.FirstOrDefault(m => m.Id == academicYearId);

            await PopulateFundingStreams();

            AcademicYearId = academicYearId;

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string academicYearId)
        {
            await Task.Delay(20);

            if (!ModelState.IsValid)
            {
                await PopulateFundingStreams();

                return Page();
            }

            CreateSpecificationModel specification = _mapper.Map<CreateSpecificationModel>(CreateSpecificationViewModel);
            specification.AcademicYearId = academicYearId;

            await _specsClient.PostSpecification(specification);

            return Redirect($"/specs?academicYearId={specification.AcademicYearId}");
        }

        async Task PopulateFundingStreams()
        {
            var fundingStreamsResponse = await _specsClient.GetFundingStreams();
            var fundingStreams = fundingStreamsResponse.Content;

            FundingStreams = fundingStreams.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name
            }).ToList();
        }
    }
}