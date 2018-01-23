namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{

    public class PreviewRequest
    {
        public string BudgetId { get; set; }
        public string ProductId { get; set; }
        public string Calculation { get; set; }
        public ProductTestScenario TestScenario { get; set; }
    }
}

