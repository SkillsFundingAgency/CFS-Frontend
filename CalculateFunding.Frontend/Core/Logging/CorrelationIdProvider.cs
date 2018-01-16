using CalculateFunding.Frontend.Interfaces.Core.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Core.Logging
{
    public class CorrelationIdProvider : ICorrelationIdProvider
    {
        string _correlationId = "";

        public string GetCorrelationId()
        {
            if (string.IsNullOrWhiteSpace(_correlationId))
            {
                _correlationId =  Guid.NewGuid().ToString();
            }

            return _correlationId;
        }

        public void SetCorrelationId(string correlationId)
        {
            if (string.IsNullOrWhiteSpace(_correlationId))
            {
                _correlationId = correlationId;
            }
        }

    }
}
