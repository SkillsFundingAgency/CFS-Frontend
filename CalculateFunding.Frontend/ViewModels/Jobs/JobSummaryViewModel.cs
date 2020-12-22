using CalculateFunding.Common.ApiClient.Jobs.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

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
        
            [JsonProperty("itemCount")]
            public int? ItemCount { get; set; }
        
            [JsonProperty("overallItemsProcessed")]
            public int? OverallItemsProcessed { get; set; }
        
            [JsonProperty("overallItemsSucceeded")]
            public int? OverallItemsSucceeded { get; set; }
        
            [JsonProperty("overallItemsFailed")]
            public int? OverallItemsFailed { get; set; }
        
            [JsonProperty("supersededByJobId")]
            public string SupersededByJobId { get; set; }
        
            [JsonProperty("outcome")]
            public string Outcome { get; set; }
        
            [JsonProperty("outcomes")]
            public IEnumerable<JobOutcomeViewModel> Outcomes { get; set; }
        
            [JsonProperty("outcomeType")]
            public OutcomeType? OutcomeType { get; set; }
            
            [JsonProperty("trigger")]
            public TriggerViewModel Trigger { get; set; }
    }
}
