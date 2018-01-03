using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System;
using System.Collections.Generic;
using System.Text;

namespace CalculateFunding.FrontEnd.ApiClients
{
    [TestClass]
    public class BudgetApiClientTests
    {

        static IOptionsSnapshot<ApiOptions> CreateOptions()
        {
            ApiOptions options = new ApiOptions();

            IOptionsSnapshot<ApiOptions> optionsSnapshot = Substitute.For<IOptionsSnapshot<ApiOptions>>();

            optionsSnapshot
                .Value
                .Returns(options);

            return optionsSnapshot;
        }

        static IHttpClient CreateHttpClient()
        {
            return Substitute.For<IHttpClient>();
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
