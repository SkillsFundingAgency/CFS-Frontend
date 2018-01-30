using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class CalculationVersions
    {
        public int TotalCount { get; set; }

        public IEnumerable<Calculation> Versions { get; set; }
    }
}
