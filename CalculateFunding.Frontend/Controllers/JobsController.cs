using System;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Jobs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class JobsController : ControllerBase
    {
        private readonly IJobsApiClient _jobsApiClient;

        public JobsController(IJobsApiClient jobsApiClient)
        {
            Guard.ArgumentNotNull(jobsApiClient, nameof(jobsApiClient));

            _jobsApiClient = jobsApiClient;
        }

        [Route("api/jobs/{specificationId}/latest/{jobTypes}")]
        public async Task<IActionResult> GetLatestJobForSpecification([FromRoute] string specificationId, [FromRoute] string jobTypes)
        {
            string[] jobTypesArray = jobTypes.Split(',', StringSplitOptions.RemoveEmptyEntries);

            ApiResponse<JobSummary> latestJobTask = await _jobsApiClient.GetLatestJobForSpecification(specificationId, jobTypesArray);

            IActionResult errorResult = latestJobTask.IsSuccessOrReturnFailureResult("JobSummary");
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(latestJobTask.Content);
        }
    }
}