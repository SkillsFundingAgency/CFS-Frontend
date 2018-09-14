using AutoMapper;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Approvals;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ViewFunding2Model : PageModel
    {

        private readonly ISpecsApiClient _specsClient;
        private readonly ICalculationsApiClient _calcsClient;
        private readonly IResultsApiClient _resultsClient;
        private readonly ITestEngineApiClient _testEngineClient;
        private readonly IMapper _mapper;

        public ViewFunding2Model(ISpecsApiClient specsApiClient,
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

        public IEnumerable<SelectListItem> FundingStreams { get; set; }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        public string SelectedFundingStreamId { get; set; }

        public string SelectedFundingPeriodId { get; set; }

        [BindProperty]
        public ViewFundingVeiwModel viewFundingVeiwModel{ get; set; }
        public void OnGet()
        {
        }
    }
}