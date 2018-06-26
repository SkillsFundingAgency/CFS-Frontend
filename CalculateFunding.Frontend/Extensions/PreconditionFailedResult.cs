using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Extensions
{
    public class PreconditionFailedResult : ObjectResult
    {
        public PreconditionFailedResult(string message)
            : base(message)
        {
            this.StatusCode = 412;
        }
    }
}
