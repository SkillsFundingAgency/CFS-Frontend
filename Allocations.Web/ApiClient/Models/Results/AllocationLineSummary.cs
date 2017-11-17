using Newtonsoft.Json;

namespace Allocations.Web.ApiClient.Models.Results
{
    public class AllocationLineSummary : ResultSummary
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}
