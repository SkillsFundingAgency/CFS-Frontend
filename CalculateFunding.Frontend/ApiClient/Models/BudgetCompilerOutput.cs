using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum Severity
    {
        Hidden,
        Info,
        Warning,
        Error,
    }
    public class BudgetCompilerOutput
    { 
        public bool Success { get; set; }
        public Specification Budget { get; set; }
        public List<CompilerMessage> CompilerMessages { get; set; }
        //public string DatasetSourceCode { get; set; }
        //public string CalculationSourceCode { get; set; }
    }

    public class CompilerMessage
    {
        public Severity Severity { get; set; }
        public string Message { get; set; }
    }
}