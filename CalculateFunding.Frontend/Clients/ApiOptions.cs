namespace CalculateFunding.Frontend.Clients
{
    /// <summary>
    /// API Configuration Options
    /// </summary>
    public class ApiOptions
    {
        public string ApiKey { get; set; }
        public string ApiEndpoint { get; set; }
        public string ResultsPath { get; set; }
        public string SpecsPath { get; set; }
        public string CalcsPath { get; set; }
        public string DatasetPath { get; set; }
    }
}