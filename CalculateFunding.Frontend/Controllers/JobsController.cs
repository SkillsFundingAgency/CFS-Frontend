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
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _jobsApiClient = jobsApiClient;
            _mapper = mapper;
        }

        [HttpPost]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [Route("api/jobs/{specificationId}")]
        public async Task<IActionResult> GetSpecificationJobs([FromBody] string[] jobTypes, [FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<IDictionary<string, JobSummary>> response = await _jobsApiClient.GetLatestJobsForSpecification(specificationId, jobTypes ?? Array.Empty<string>());

            return response.Handle(nameof(JobSummary),
                onNotFound: Ok,
                onNoContent: Ok,
                onSuccess: _ => Ok(_mapper.Map<JobSummaryViewModel[]>(response.Content.Values)));
        }

        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [Route("api/jobs/latest-success/{specificationId}/{jobDefinitionId}")]
        public async Task<IActionResult> GetSpecificationLatestSucessfulJob([FromRoute] string specificationId, [FromRoute] string jobDefinitionId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(jobDefinitionId, nameof(jobDefinitionId));

            ApiResponse<JobSummary> response = await _jobsApiClient.GetLatestSuccessfulJobForSpecification(specificationId, jobDefinitionId);

            return response.Handle(nameof(JobSummary),
                onNotFound: Ok,
                onNoContent: Ok,
                onSuccess: x => Ok(_mapper.Map<JobSummaryViewModel>(x.Content)));
        }

        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [Route("api/jobs/latest-by-entity-id/{specificationId}/{entityId}")]
        public async Task<IActionResult> GetLatestJobByTriggerEntityId([FromRoute] string specificationId, [FromRoute] string entityId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(entityId, nameof(entityId));

            ApiResponse<JobSummary> response = await _jobsApiClient.GetLatestJobByTriggerEntityId(specificationId, entityId);

            return response.Handle(nameof(JobSummary),
                onNotFound: Ok,
                onNoContent: Ok,
                onSuccess: x => Ok(_mapper.Map<JobSummaryViewModel>(x.Content)));
        }
    }
}
