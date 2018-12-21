using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.Clients.JobsClient.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum RunningStatus
    {
        Queued, // Created and waiting to be actioned
        QueuedWithService, // Sent to the microservice to action
        InProgress, // Job is running
        Completed, // Job has completed
    }
}
