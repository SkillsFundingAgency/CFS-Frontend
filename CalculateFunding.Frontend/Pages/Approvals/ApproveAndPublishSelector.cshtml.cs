using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Approvals;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ApproveAndPublishSelectorPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly ICalculationsApiClient _calcsClient;
        private readonly IResultsApiClient _resultsClient;
        private readonly ITestEngineApiClient _testEngineClient;
        private readonly IMapper _mapper;

        public IEnumerable<SelectListItem> FundingStreams { get; set; }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        public string SelectedFundingStreamId { get; set; }

        public string SelectedFundingPeriodId { get; set; }

        [BindProperty]
        public ApproveAndPublishSelectorViewModel ApproveAndPublishSelectorViewModel { get; set; }

        public ApproveAndPublishSelectorPageModel(ISpecsApiClient specsApiClient,
            ICalculationsApiClient calcsClient,
            IResultsApiClient resultsClient,
            ITestEngineApiClient testEngineClient,
            IMapper mapper)
        {
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(calcsClient, nameof(calcsClient));
            Guard.ArgumentNotNull(resultsClient, nameof(resultsClient));
            Guard.ArgumentNotNull(testEngineClient, nameof(testEngineClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsApiClient;
            _calcsClient = calcsClient;
            _resultsClient = resultsClient;
            _testEngineClient = testEngineClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            List<Task> tasks = new List<Task>();


            Task<ApiResponse<IEnumerable<Reference>>> fundingPeriodsLookupTask = _specsClient.GetFundingPeriods();

            //Task<ApiResponse<IEnumerable<FundingStream>>> fundingStreamsLookupTask = _specsClient.GetFundingStreams();

            tasks.Add(fundingPeriodsLookupTask);
            //tasks.Add(fundingStreamsLookupTask);

            await TaskHelper.WhenAllAndThrow(tasks.ToArray());


            IActionResult errorResult = fundingPeriodsLookupTask.Result.IsSuccessOrReturnFailureResult("Funding Period");
            if (errorResult != null)
            {
                return errorResult;
            }

            FundingPeriods =fundingPeriodsLookupTask.Result.Content.Select(s => new SelectListItem()
            {
                Text = s.Name,
                Value = s.Id,   
             });

            return Page();
        }



    }

   
}