namespace CalculateFunding.Frontend.Clients
{
    /// <summary>
    /// API Configuration Options
    /// </summary>
    public class ApiOptions : ApiProxyOptions
    {
        public string ApiKey { get; set; }

        public string ApiEndpoint { get; set; }

        public string ResultsPath { get; set; }

        public string SpecsPath { get; set; }

        public string CalcsPath { get; set; }

        public string DatasetsPath { get; set; }

        public string ScenariosPath { get; set; }

        public string TestEnginePath { get; set; }

    }
}