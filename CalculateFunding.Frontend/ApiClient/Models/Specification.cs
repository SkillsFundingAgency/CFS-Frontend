using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class Specification : Reference
    {
        public Specification()
        {
            Policies = Enumerable.Empty<Policy>();
        }

        [JsonProperty("academicYear")]
        public Reference AcademicYear { get; set; }

        [JsonProperty("fundingStream")]
        public Reference FundingStream { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("policies")]
        public IEnumerable<Policy> Policies { get; set; }

    }
}

