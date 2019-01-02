using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient;
using CalculateFunding.Common.ApiClient.Interfaces;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.JobsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Serilog;

namespace CalculateFunding.Frontend.Clients.JobsClient
{
    public class JobsApiClient : BaseApiClient, IJobsApiClient
    {
        public JobsApiClient(
            IHttpClientFactory httpClientFactory,
            ILogger logger,
            ICancellationTokenProvider cancellationTokenProvider)
            : base(httpClientFactory, HttpClientKeys.Jobs, logger, cancellationTokenProvider)
        {
        }

        public async Task<ApiResponse<JobSummary>> GetLatestJobForSpecification(string specificationId, IEnumerable<string> jobTypes)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            string api = $"latest?specificationId={specificationId}";

            if (jobTypes != null && jobTypes.Count() > 0)
            {
                api += $"&jobTypes={string.Join(",", jobTypes)}";
            }

            return await GetAsync<JobSummary>(api);
        }
    }
}
