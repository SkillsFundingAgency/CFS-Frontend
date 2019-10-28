using System;
using System.Net;

namespace CalculateFunding.Frontend.Extensions
{
    public class HttpCallException : Exception
    {
        public HttpStatusCode StatusCode { get; private set; }

        public HttpCallException(HttpStatusCode statusCode, string message) : base(message)
        {
            StatusCode = statusCode;
        }
    }
}
