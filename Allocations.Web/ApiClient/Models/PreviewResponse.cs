using System.Collections.Generic;

namespace Allocations.Web.ApiClient.Models
{
    public class PreviewResponse
    {
        public Product Product { get; set; }
        public BudgetCompilerOutput CompilerOutput { get; set; }
        public List<ProviderTestResult> TestResults { get; set; }
    }
}