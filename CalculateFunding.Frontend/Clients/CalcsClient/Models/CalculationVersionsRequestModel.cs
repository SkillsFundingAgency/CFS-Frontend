using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    internal class CalculationVersionsRequestModel
    {
        public string CalculationId { get; set; }

        public IEnumerable<int> Versions { get; set; }
    }
}
