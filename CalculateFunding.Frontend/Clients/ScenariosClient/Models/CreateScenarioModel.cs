namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    public class CreateScenarioModel
    {
        public string SpecificationId { get; set; }

        public string Name { get; set; }   

        public string Description { get; set; }

        /// <summary>
        /// Source code of Gherkin
        /// </summary>
        public string Scenario { get; set; }

    }
}