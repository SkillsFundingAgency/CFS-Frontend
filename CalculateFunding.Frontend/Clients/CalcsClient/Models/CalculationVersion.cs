namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    using System;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;

    public class CalculationVersion
    {
        public int DecimalPlaces { get; set; }

        public string SourceCode { get; set; }

        public string Version { get; set; }

        public DateTime Date { get; set; }

        public Reference Author { get; set; }

        [JsonProperty("publishStatus")]
        public string Status { get; set; }
    }
}
