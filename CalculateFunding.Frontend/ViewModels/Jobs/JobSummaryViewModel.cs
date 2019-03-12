using CalculateFunding.Common.ApiClient.Jobs.Models;
using CalculateFunding.Frontend.Helpers;
using Newtonsoft.Json;
using System;

namespace CalculateFunding.Frontend.ViewModels.Jobs
{
    public class JobSummaryViewModel 
    {
        [JsonProperty("jobId")]
        public string JobId { get; set; }

        [JsonProperty("jobType")]
        public string JobType { get; set; }

        [JsonProperty("specificationId")]
        public string SpecificationId { get; set; }

        [JsonProperty("entityId")]
        public string EntityId { get; set; }

        [JsonProperty("runningStatus")]
        public RunningStatus RunningStatus { get; set; }

        [JsonProperty("completionStatus")]
        public CompletionStatus? CompletionStatus { get; set; }

        [JsonProperty("invokerUserId")]
        public string InvokerUserId { get; set; }

        [JsonProperty("invokerUserDisplayName")]
        public string InvokerUserDisplayName { get; set; }

        [JsonProperty("parentJobId")]
        public string ParentJobId { get; set; }

        [JsonProperty("lastUpdated")]
        public DateTimeOffset LastUpdated { get; set; }

        [JsonProperty("created")]
        public DateTimeOffset Created { get; set; }

        [JsonProperty("lastUpdatedFormatted")]
        public string LastUpdatedFormatted
        {
            get
            {
                return LastUpdated.ToString(FormatStrings.DateTimeFormatString);
            }
        }

        [JsonProperty("createdFormatted")]
        public string CreatedFormatted
        {
            get
            {
                return Created.ToString(FormatStrings.DateTimeFormatString);
            }
        }
    }
}
