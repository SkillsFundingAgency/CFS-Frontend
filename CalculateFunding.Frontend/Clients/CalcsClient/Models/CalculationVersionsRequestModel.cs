namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    using System.Collections.Generic;

    internal class CalculationVersionsRequestModel
    {
        public string CalculationId { get; set; }

        public IEnumerable<int> Versions { get; set; }
    }
}
