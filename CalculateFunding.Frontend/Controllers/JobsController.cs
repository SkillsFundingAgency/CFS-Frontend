using System;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Jobs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.Jobs;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class JobsController : ControllerBase
    {
        private readonly IJobsApiClient _jobsApiClient;
        private readonly IMapper _mapper;

        public JobsController(IJobsApiClient jobsApiClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(jobsApiClient, nameof(jobsApiClient));

            _jobsApiClient = jobsApiClient;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("api/jobs/{specificationId}/latest/{jobTypes}")]
        public async Task<IActionResult> GetLatestJobForSpecification([FromRoute] string specificationId, [FromRoute] string jobTypes)
        {
            string[] jobTypesArray = jobTypes.Split(',', StringSplitOptions.RemoveEmptyEntries);

            ApiResponse<JobSummary> latestJobTask = await _jobsApiClient.GetLatestJobForSpecification(specificationId, jobTypesArray);

            IActionResult errorResult = latestJobTask.IsSuccessOrReturnFailureResult("JobSummary");
            if (errorResult != null)
            {
                return BadRequest(errorResult);
            }

            JobSummaryViewModel jobSummaryViewModel = _mapper.Map<JobSummaryViewModel>(latestJobTask.Content);

            return Ok(jobSummaryViewModel);
        }

        [HttpGet]
        [Route("api/jobs/{specificationId}/last-updated/{jobTypes}")]
        public async Task<IActionResult> GetJobLastUpdatedForSpecification([FromRoute] string specificationId, [FromRoute] string jobTypes)
        {
	        string[] jobTypesArray = jobTypes.Split(',', StringSplitOptions.RemoveEmptyEntries);

            ApiResponse<JobSummary> latestJobTask = await _jobsApiClient.GetLatestJobForSpecification(specificationId, jobTypesArray);

            IActionResult errorResult = latestJobTask.IsSuccessOrReturnFailureResult("JobSummary");
            if (errorResult != null)
            {
                return errorResult;
            }

            JobSummaryViewModel jobSummaryViewModel = _mapper.Map<JobSummaryViewModel>(latestJobTask.Content);

            return Ok(jobSummaryViewModel.LastUpdatedFormatted);
        }
    }
}