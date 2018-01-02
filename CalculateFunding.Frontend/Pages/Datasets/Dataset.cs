using System;
using System.Collections.Generic;
using CalculateFunding.Frontend.ApiClient.Models;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Pages.Datasets
{
    public class Dataset
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("datasetType")]
        public string DatasetType { get; set; }

        [JsonProperty("academicYear")]
        public Reference AcademicYear { get; set; }

        [JsonProperty("fundingStreams")]
        public List<Reference> FundingStreams { get; set; }

        [JsonProperty("rowType")]
        public RowType RowType { get; set; }

        [JsonProperty("version")]
        public string Version { get; set; }

        [JsonProperty("updatedDate")]
        public DateTime UpdatedDate { get; set; }

        [JsonProperty("rowCount")]
        public int RowCount { get; set; }
        [JsonProperty("sizeBytes")]
        public long SizeBytes { get; set; }
    }
}