using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CalculateFunding.FrontEnd.ApiClients
{
    [TestClass]
    public class SpecsApiClientTests
    {
        [TestMethod]
        public void GetBudgetResults_GivenHttpCluientThrowsException_LogsReturnsInternalServerError()
        {
            //Arrange
            IHttpClient httpClient = CreateHttpClient();
            httpClient
                .When(x => x.GetAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()))
                .Do(x => { throw new Exception(); });

            ILoggingService logs = CreateLoggingService();

            BudgetApiClient budgetApiClient = CreateBudgetApiClient(httpClient: httpClient, logs: logs);

            //Act
            Func<Task> test = async () => await budgetApiClient.GetBudgetResults().ConfigureAwait(false);

            //Assert
            test();

            logs
                .Received()
                .Trace(Arg.Is("Beginning to fetch data from: results/budgets"));

            logs
                .Received()
                .Exception(Arg.Any<string>(), Arg.Any<Exception>());
        }

        public async Task 








        static IOptionsSnapshot<ApiOptions> CreateOptions()
        {
            ApiOptions options = new ApiOptions
            {
                ApiKey = "Whatever",
                ApiEndpoint = "http://wherever/",
                ResultsPath = "results",
                SpecsPath = "specs"
            };

            IOptionsSnapshot<ApiOptions> optionsSnapshot = Substitute.For<IOptionsSnapshot<ApiOptions>>();

            optionsSnapshot
                .Value
                .Returns(options);

            return optionsSnapshot;
        }

        static IHttpClient CreateHttpClient()
        {
            IHttpClient httpClient = Substitute.For<IHttpClient>();
            return httpClient;
        }

        static ILoggingService CreateLoggingService()
        {
            return Substitute.For<ILoggingService>();
        }

        static BudgetApiClient CreateBudgetApiClient(IOptionsSnapshot<ApiOptions> options = null, IHttpClient httpClient = null, ILoggingService logs = null)
        {
            return new BudgetApiClient(options ?? CreateOptions(), httpClient ?? CreateHttpClient(), logs ?? CreateLoggingService());
        }
    }
}
