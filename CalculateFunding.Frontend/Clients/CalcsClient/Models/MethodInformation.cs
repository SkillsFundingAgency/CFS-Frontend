using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class MethodInformation
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public IEnumerable<ParameterInformation> Parameters { get; set; }

        public string ReturnType { get; set; }

        public string EntityId { get; set; }

    }
}
