namespace CalculateFunding.Frontend.Clients.CommonModels
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using CalculateFunding.Frontend.Clients.UsersClient.Models;

    public class ApiResponse<T>
    {
        public ApiResponse(HttpStatusCode statusCode, T content = default(T))
        {
            StatusCode = statusCode;
            Content = content;
        }

        public HttpStatusCode StatusCode { get; private set; }

        public T Content { get; private set; }

        public static implicit operator ApiResponse<T>(ApiResponse<IEnumerable<FundingStreamPermission>> v)
        {
            throw new NotImplementedException();
        }
    }
}