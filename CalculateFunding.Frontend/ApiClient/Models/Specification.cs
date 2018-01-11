using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class Specification : Reference
    {
        [JsonProperty("academicYear")]
        public Reference AcademicYear { get; set; }

        [JsonProperty("fundingStream")]
        public Reference FundingStream { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("policies")]
        public List<Policy> Policies { get; set; }

    }
}

