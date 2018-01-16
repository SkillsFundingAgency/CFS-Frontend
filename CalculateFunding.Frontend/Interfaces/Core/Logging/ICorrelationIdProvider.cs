using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.Core.Logging
{
    public interface ICorrelationIdProvider
    {
        string GetCorrelationId();

        void SetCorrelationId(string correlationId);
    }
}
