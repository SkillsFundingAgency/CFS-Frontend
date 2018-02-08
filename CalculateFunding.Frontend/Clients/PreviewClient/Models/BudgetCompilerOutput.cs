namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.Clients.CommonModels;

    public class BudgetCompilerOutput
    {
        public bool Success { get; set; }

        public Reference Budget { get; set; }

        public List<CompilerMessage> CompilerMessages { get; set; }
        ////public string DatasetSourceCode { get; set; }
        ////public string CalculationSourceCode { get; set; }
    }
}