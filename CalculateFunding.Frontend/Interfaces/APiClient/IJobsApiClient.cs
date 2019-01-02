using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.JobsClient.Models;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface IJobsApiClient
    {
        Task<ApiResponse<JobSummary>> GetLatestJobForSpecification(string specificationId, IEnumerable<string> jobTypes);
    }
}
