using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class CalculationSearchFilterRequest : PagedQueryOptions
    {
        public string SearchTerm { get; set; }
    }
}
