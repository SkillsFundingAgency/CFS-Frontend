using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Calcs.Models.ObsoleteItems;
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

        [JsonProperty("datasetRelationshipId")]
        public string DatasetRelationshipId { get; set; }

        [JsonProperty("datasetRelationshipName")]
        public string DatasetRelationshipName { get; set; }

        [JsonProperty("datasetFieldId")]
        public string DatasetFieldId { get; set; }

        [JsonProperty("datasetFieldName")]
        public string DatasetFieldName { get; set; }

        [JsonProperty("datasetDatatype")]
        [JsonConverter(typeof(StringEnumConverter))]
        public DatasetFieldType DatasetDatatype { get; set; }

        [JsonProperty("isReleasedData")]
        public bool IsReleasedData { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("itemType")]
        [JsonConverter(typeof(StringEnumConverter))]
        public ObsoleteItemType ItemType { get; set; }

        [JsonProperty("enumValueName")]
        public string EnumValueName { get; set; }

        [JsonProperty("fundingLineId")]
        public uint? FundingLineId { get; set; }

        [JsonProperty("fundingLineName")]
        public string FundingLineName { get; set; }

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