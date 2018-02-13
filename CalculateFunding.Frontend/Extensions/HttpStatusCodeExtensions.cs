namespace CalculateFunding.Frontend.Extensions
{
    using System.Net;

    public static class HttpStatusCodeExtensions
    {
        public static bool IsSuccess(this HttpStatusCode statusCode)
        {
            return ((int)statusCode >= 200) && ((int)statusCode <= 299);
        }
    }
}
