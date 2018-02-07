using System.Collections.Generic;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class ProductModel : PageModel
    {
        public List<Reference> AllocationLines { get; set; }

        public ProductSpecification Product { get; set; }
    
        public void OnGet()
        {
            AllocationLines = new List<Reference>
            {
                new Reference("pupil-led-factors", "Pupil Led Factors"),
                new Reference("other-factors", "Other Factors"),
                new Reference("exceptional-factors", "Exceptional Factors")

            };

            Product = new ProductSpecification();
        }
    }


}