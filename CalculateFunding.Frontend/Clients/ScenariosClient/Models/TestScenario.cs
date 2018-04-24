using CalculateFunding.Frontend.Clients.CommonModels;

namespace CalculateFunding.Frontend.Clients.QAClient.Models
{
    public class TestScenario : Reference
    {
        public string SpecificationId { get; set; }

        public string TestDescription { get; set; }

        public string Status { get; set; }
    }
}
