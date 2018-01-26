using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    internal class CalculationSearchRequest
    {
        public int PageNumber { get; set; }

        public int Top { get; set; }
    }
}
