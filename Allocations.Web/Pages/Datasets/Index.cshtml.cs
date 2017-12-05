using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Allocations.Web.ApiClient;
using Allocations.Web.ApiClient.Models;
using Allocations.Web.ApiClient.Models.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;

namespace Allocations.Web.Pages.Datasets
{
    public enum RowType
    {
        Provider,
        Authority,
        Learner,
        Aim
    }

    public class Dataset
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("datasetType")]
        public string DatasetType { get; set; }

        [JsonProperty("academicYear")]
        public Reference AcademicYear { get; set; }

        [JsonProperty("fundingStreams")]
        public List<Reference> FundingStreams { get; set; }

        [JsonProperty("rowType")]
        public RowType RowType { get; set; }

        [JsonProperty("version")]
        public string Version { get; set; }

        [JsonProperty("updatedDate")]
        public DateTime UpdatedDate { get; set; }

        [JsonProperty("rowCount")]
        public int RowCount { get; set; }
        [JsonProperty("sizeBytes")]
        public long SizeBytes { get; set; }
    }

    public class IndexModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;
        public IList<Dataset> Datasets { get; set; }

        public IndexModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<IActionResult> OnGetAsync(string id)
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