using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Extensions
{
    public class InternalServerErrorResult : ObjectResult
    {
        public InternalServerErrorResult(string message)
            : base(message)
        {
            this.StatusCode = 500;
        }
    }
}
