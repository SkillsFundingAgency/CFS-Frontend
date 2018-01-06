using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class CreateSpecificationModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;

        private readonly IMapper _mapper;

        public IEnumerable<SelectListItem> FundingStreams { get; set; }

        [BindProperty]
        public Reference AcademicYear { get; set; }

        [BindProperty]
        public CreateSpecificationViewModel CreateSpecificationViewModel {get;set;}

        public string AcademicYearId { get; set; }

        public CreateSpecificationModel(ISpecsApiClient specsClient, IMapper mapper)
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

        public async Task<IActionResult> OnPostAsync()
        {
            await Task.Delay(20);

            if (!ModelState.IsValid)
            {
                await PopulateFundingStreams();

                return Page();
            }

            Specification specification = _mapper.Map<Specification>(CreateSpecificationViewModel);
            specification.AcademicYear = AcademicYear;
            return Redirect($"/specs?academicYearId={specification.AcademicYear.Id}");
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