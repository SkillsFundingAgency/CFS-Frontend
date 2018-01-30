using System;
using CalculateFunding.Frontend.Clients.Models;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class CalculationVersion
    {
        public int DecimalPlaces { set; get; }

        public string SourceCode { set; get; }

        public string Version { get; set; }

        public DateTime Date { get; set; }

        public Reference Author { get; set; }

        [JsonProperty("publishStatus")]
        public string Status { get; set; }

    }
}
