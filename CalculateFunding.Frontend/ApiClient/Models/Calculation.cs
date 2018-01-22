using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class Calculation : Reference
    {
        public string Description { get; set; }

        public Reference Specification { get; set; }

        public Reference Period { get; set; }
    }
}