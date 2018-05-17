namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class PreviewCompileRequest
    {
        public string CalculationId { get; set; }

        public string SpecificationId { get; set; }

        public string SourceCode { get; set; }
    }
}
