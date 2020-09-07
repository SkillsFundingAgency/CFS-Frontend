using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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
        [Route("api/jobs/{specificationId}/{jobTypes}")]
        public async Task<IActionResult> GetSpecificationJobs([FromRoute] string specificationId, [FromRoute] string jobTypes)
        {
            string[] jobTypesArray = jobTypes.Split(',', StringSplitOptions.RemoveEmptyEntries);

            ApiResponse<IEnumerable<JobSummary>> response = await _jobsApiClient.GetLatestJobsForSpecification(specificationId, jobTypesArray);

            IActionResult errorResult = response.IsSuccessOrReturnFailureResult("JobSummary", treatNoContentAsSuccess: true);
            
            if (errorResult != null)
            {
                return errorResult;
            }

            if (response.StatusCode == HttpStatusCode.NoContent)
            {
                return Ok(jobTypesArray.Select(x => (string)null));
            }

            IEnumerable<JobSummaryViewModel> jobs = _mapper.Map<IEnumerable<JobSummaryViewModel>>(response.Content);

            return Ok(jobs);
        }
    }
}