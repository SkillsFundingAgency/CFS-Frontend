using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class CalculationCurrentVersion : Calculation
    {
        public string PolicyId { get; set; }

        public string PolicyName { get; set; }
    }
}
