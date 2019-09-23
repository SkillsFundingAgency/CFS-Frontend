﻿using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum CalculationSpecificationType
    {
        Number = 0,
        Funding = 10,
        Baseline = 20,
        Template,
        Additional,
    }
}
