using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Profiling;
using CalculateFunding.Common.ApiClient.Profiling.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.Publish;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class ProfilingController : Controller
    {
	    private readonly IProfilingApiClient _profilingApiClient;

	    public ProfilingController(IProfilingApiClient profilingApiClient)
	    {
		    Guard.ArgumentNotNull(profilingApiClient, nameof(profilingApiClient));
		    _profilingApiClient = profilingApiClient;
	    }

	    [HttpGet]
	    [Route("api/profiling/patterns/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}")]
	    public async Task<IActionResult> GetFutureInstallments(
		    string fundingStreamId,
		    string fundingPeriodId)
	    {
		    Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));
		    Guard.ArgumentNotNull(fundingPeriodId, nameof(fundingPeriodId));

		    ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>> apiResponse =
			    await _profilingApiClient.GetProfilePatternsForFundingStreamAndFundingPeriod(fundingStreamId,
				    fundingPeriodId);

		    IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(FundingStreamPeriodProfilePattern));
		    if (errorResult != null)
		    {
			    return errorResult;
		    }

		    IEnumerable<FundingStreamPeriodProfilePattern> fundingStreamPeriodProfilePatterns =
			    apiResponse.Content;

		    var profilePatterns =
			    fundingStreamPeriodProfilePatterns.SelectMany(p => p.ProfilePattern).ToList();

		    var futureProfilePatterns = profilePatterns.Where(f =>
				    f.PeriodYear > DateTime.Now.Year ||
				    f.PeriodYear == DateTime.Now.Year &&
				    f.PeriodStartDate.Month > DateTime.Now.Month)
			    .ToList();

		    return Ok(!futureProfilePatterns.Any()
			    ? new List<ProfilingInstallment>()
			    : MapToFutureInstallmentModel(futureProfilePatterns));
	    }

	    private static List<ProfilingInstallment> MapToFutureInstallmentModel(
	        IEnumerable<ProfilePeriodPattern> profilePatterns) =>
	        profilePatterns
		        .Select(profilingTotal =>
			        new ProfilingInstallment(
				        profilingTotal.PeriodYear,
				        profilingTotal.Period,
				        profilingTotal.Occurrence, 0))
		        .ToList();
    }
}