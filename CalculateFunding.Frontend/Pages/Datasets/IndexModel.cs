using System;
using System.Collections.Generic;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.APiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Datasets
{
    public class IndexModel : PageModel
    {
        private readonly IAllocationsApiClient _apiClient;
        public IList<Dataset> Datasets { get; set; }

        public IndexModel(IAllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public IActionResult OnGet(string id)
        {
            var y1718 = new Reference("1718", "2017-2018");
            Datasets = new List<Dataset>
            {
                new Dataset{DatasetType = "ILR", AcademicYear = y1718, RowCount = 7000000, SizeBytes = 1024 * 1024 * 101, UpdatedDate = DateTime.Now.AddMonths(-7)},
                new Dataset{DatasetType = "NPD 10", AcademicYear = y1718, RowCount = 700000, SizeBytes = 1024 * 1024 * 10, UpdatedDate=  DateTime.Now.AddMonths(-7)},

            };
            return Page();
        }

    }
}