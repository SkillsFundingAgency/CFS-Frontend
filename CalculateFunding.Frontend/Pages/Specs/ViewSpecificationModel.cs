using AutoMapper;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class ViewSpecificationModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;

        public ViewSpecificationViewModel ViewSpecificationViewModel { get; set; }

        public ViewSpecificationModel(ISpecsApiClient specsClient, IMapper mapper)
        {
            _specsClient = specsClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGetAsync(string specificationId)
        {
           var specificationResponse = await _specsClient.GetSpecification(specificationId);

           if(specificationResponse.StatusCode == HttpStatusCode.OK)
            {
                ViewSpecificationViewModel = _mapper.Map<ViewSpecificationViewModel>(specificationResponse.Content);
            }

            return Page();
        }
    }
}
