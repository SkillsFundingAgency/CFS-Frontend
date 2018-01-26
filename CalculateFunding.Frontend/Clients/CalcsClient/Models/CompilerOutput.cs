using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class CompilerOutput
    {
        public bool Success { get; set; }

        public string AssemblyBase64 { get; set; }

        public IEnumerable<CompilerMessage> CompilerMessages { get; set; }
    }
}
