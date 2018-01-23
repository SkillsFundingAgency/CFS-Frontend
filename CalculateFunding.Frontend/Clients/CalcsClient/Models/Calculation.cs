using CalculateFunding.Frontend.Clients.Models;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class Calculation : Reference
    {
        public string Description { get; set; }

        public Reference Specification { get; set; }

        public Reference Period { get; set; }
    }
}
