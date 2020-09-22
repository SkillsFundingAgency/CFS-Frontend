using System;
using System.Collections.Generic;
using System.Net;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Extensions;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CalculateFunding.Frontend.UnitTests.Extensions
{
    [TestClass]
    public class BadRequestExtensionsTests
    {
        private IActionResult _actionResult;
        
        [TestMethod]
        public void GuardsAgainstMissingResponse()
        {
            Func<bool> invocation = () => WhenTheValidatedResponseIsEvaluated(null);

            invocation
                .Should()
                .Throw<ArgumentNullException>()
                .Which
                .ParamName
                .Should()
                .Be($"{nameof(String)} validatedApiResponse");
        }

        [TestMethod]
        public void ReturnsFalseIfStatusCodeNotBadRequest()
        {
            bool isBadRequest = WhenTheValidatedResponseIsEvaluated(new ValidatedApiResponse<string>(HttpStatusCode.Accepted));

            isBadRequest
                .Should()
                .BeFalse();
        }

        [TestMethod]
        public void ReturnsTrueForBadRequestsAndCreatesResponseFromModelStateOnApiResponse()
        {
            Dictionary<string, IEnumerable<string>> expectedModelState = new Dictionary<string, IEnumerable<string>>();

            bool isBadRequest = WhenTheValidatedResponseIsEvaluated(new ValidatedApiResponse<string>(HttpStatusCode.BadRequest)
            {
                ModelState = expectedModelState
            });

            isBadRequest
                .Should()
                .BeTrue();

            _actionResult
                .Should()
                .BeOfType<BadRequestObjectResult>()
                .Which
                .Value
                .Should()
                .BeSameAs(expectedModelState);
        }
        
        [TestMethod]
        public void ReturnsTrueForBadRequestsAndCreatesResponseWithEmptyModelStateDictionaryIfNoneInResponse()
        {
            bool isBadRequest = WhenTheValidatedResponseIsEvaluated(new ValidatedApiResponse<string>(HttpStatusCode.BadRequest));

            isBadRequest
                .Should()
                .BeTrue();

            _actionResult
                .Should()
                .BeOfType<BadRequestObjectResult>()
                .Which
                .Value
                .Should()
                .NotBeNull();
        }

        private bool WhenTheValidatedResponseIsEvaluated(ValidatedApiResponse<string> validatedApiResponse)
        {
            bool isBadRequest = validatedApiResponse.IsBadRequest(out BadRequestObjectResult badRequest);

            _actionResult = badRequest;

            return isBadRequest;
        }
    }
}