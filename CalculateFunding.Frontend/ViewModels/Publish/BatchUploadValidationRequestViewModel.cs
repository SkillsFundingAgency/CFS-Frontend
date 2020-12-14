using System.Text.Json.Serialization;

namespace CalculateFunding.Frontend.ViewModels.Publish
{
    public class BatchUploadValidationRequestViewModel
    {
        [JsonPropertyName("specificationId")]
        public string SpecificationId { get; set; }
        
        [JsonPropertyName("fundingStreamId")]
        public string FundingStreamId { get; set; }
        
        [JsonPropertyName("fundingPeriodId")]
        public string FundingPeriodId { get; set; }
        
        [JsonPropertyName("batchId")]
        public string BatchId { get; set; }    
    }
}