namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    using System.Collections.Generic;

    public class CalculationVersions
    {
        public int TotalCount { get; set; }

        public IEnumerable<Calculation> Versions { get; set; }
    }
}
