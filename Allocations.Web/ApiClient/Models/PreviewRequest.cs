namespace CalculateFunding.Web.ApiClient.Models
{

    public class PreviewRequest
    {
        public string BudgetId { get; set; }
        public string ProductId { get; set; }
        public string Calculation { get; set; }
        public ProductTestScenario TestScenario { get; set; }
    }
}

