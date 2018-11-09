using CalculateFunding.Common.ApiClient.Models;

namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    public class TestScenarioUpdateModel : Reference
    {
        public string SpecificationId { get; set; }

        public string Description { get; set; }

        /// <summary>
        /// Source code of Gherkin
        /// </summary>
        public string Scenario { get; set; }
    }
}
