namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    using System.Collections.Generic;

    public class CompilerOutput
    {
        public bool Success { get; set; }

        public string AssemblyBase64 { get; set; }

        public IEnumerable<CompilerMessage> CompilerMessages { get; set; }
    }
}
