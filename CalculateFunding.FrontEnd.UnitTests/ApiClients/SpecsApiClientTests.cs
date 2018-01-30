using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CalculateFunding.Frontend.ApiClients
{
    [TestClass]
    public class SpecsApiClientTests
    {
        //string CorrelationId = Guid.NewGuid().ToString();

        //[TestMethod]
        //public async Task GetSpecifications_GivenResponseIsNotASuccess_LogsReturnsStatusCode()
        //{
        //    //Arrange
        //    HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest);

        //    IHttpClient httpClient = CreateHttpClient();
        //    httpClient
        //        .GetAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
        //        .Returns(response);

        //    ILoggingService logs = CreateLoggingService();

        //    SpecsApiClient apiClient = CreateSpecsApiClient(httpClient: httpClient, logs: logs);

        //    //Act
        //    ApiResponse<List<Specification>> results = await apiClient.GetSpecifications();

        //    //
        //    results
        //        .StatusCode
        //        .Should()
        //        .Be(HttpStatusCode.BadRequest);

        //    logs
        //        .Received()
        //        .Trace("No successful response from specs/specifications with status code: BadRequest and reason: Bad Request");
        //}

        //[TestMethod]
        //public async Task GetSpecifications_GivenResponseIsASuccess_ReturnsData()
        //{
        //    //Arrange
        //    IEnumerable<Specification> specs = new List<Specification>
        //    {
        //        new Specification(),
        //        new Specification()
        //    };

        //    HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
        //    response
        //        .Content = new StringContent(JsonConvert.SerializeObject(specs));

        //    IHttpClient httpClient = CreateHttpClient();
        //    httpClient
        //        .GetAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
        //        .Returns(response);

        //    //ILoggingService logs = CreateLoggingService();

        //    SpecsApiClient apiClient = CreateSpecsApiClient(httpClient: httpClient);

        //    //Act
        //    ApiResponse<List<Specification>> results = await apiClient.GetSpecifications();

        //    //
        //    results
        //        .StatusCode
        //        .Should()
        //        .Be(HttpStatusCode.OK);

        //    results
        //        .Content
        //        .Count
        //        .Should()
        //        .Be(2);
        //}


        //static IOptionsSnapshot<ApiOptions> CreateOptions()
        //{
        //    ApiOptions options = new ApiOptions
        //    {
        //        ApiKey = "Whatever",
        //        ApiEndpoint = "http://wherever/",
        //        ResultsPath = "results",
        //        SpecsPath = "specs"
        //    };

        //    IOptionsSnapshot<ApiOptions> optionsSnapshot = Substitute.For<IOptionsSnapshot<ApiOptions>>();

        //    optionsSnapshot
        //        .Value
        //        .Returns(options);

        //    return optionsSnapshot;
        //}

        //static IHttpClient CreateHttpClient()
        //{
        //    IHttpClient httpClient = Substitute.For<IHttpClient>();
        //    return httpClient;
        //}

       
        //static IHttpContextAccessor CreateContextAccessor()
        //{
        //    return Substitute.For<IHttpContextAccessor>();
        //}

        //static SpecsApiClient CreateSpecsApiClient(IOptionsSnapshot<ApiOptions> options = null, 
        //    IHttpClient httpClient = null, ILoggingService logs = null, IHttpContextAccessor contextAccessor = null)
        //{
        //    return new SpecsApiClient(options ?? CreateOptions(), 
        //        httpClient ?? CreateHttpClient(), logs ?? CreateLoggingService(), contextAccessor ?? CreateContextAccessor());
        //}
    }
}
