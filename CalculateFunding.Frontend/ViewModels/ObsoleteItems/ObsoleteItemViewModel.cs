using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ViewModels.ObsoleteItems
{
    public class ObsoleteItemViewModel
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("specificationId")]
        public string SpecificationId { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("itemType")]
        [JsonConverter(typeof(StringEnumConverter))]
        public ObsoleteItemType ItemType { get; set; }

        [JsonProperty("enumValueName")]
        public string EnumValueName { get; set; }

        [JsonProperty("fundingLineId")]
        public uint? FundingLineId { get; set; }

        [JsonProperty("fundingStreamId")]
        public string FundingStreamId { get; set; }

        [JsonProperty("templateCalculationId")]
        public uint? TemplateCalculationId { get; set; }

        [JsonProperty("codeReference")]
        public string CodeReference { get; set; }

        [JsonProperty("templateCalculations")]
        public IEnumerable<CalculationSummaryViewModel> TemplateCalculations { get; set; }

        [JsonProperty("additionalCalculations")]
        public IEnumerable<CalculationSummaryViewModel> AdditionalCalculations { get; set; }
    }
}