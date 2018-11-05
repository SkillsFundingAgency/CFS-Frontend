using System.Security.Claims;
using System.Security.Principal;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Routing;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Helpers
{
    internal static class TestAuthHelper
    {
        internal static PageContext CreatePageContext()
        {
            string displayName = "Test User";
            GenericIdentity identity = new GenericIdentity(displayName);
            ClaimsPrincipal principle = new ClaimsPrincipal(identity);
            // use default context with user
            DefaultHttpContext httpContext = new DefaultHttpContext()
            {
                User = principle
            };
            //need these as well for the page context
            ModelStateDictionary modelState = new ModelStateDictionary();
            ActionContext actionContext = new ActionContext(httpContext, new RouteData(), new PageActionDescriptor(), modelState);
            //var modelMetadataProvider = new EmptyModelMetadataProvider();
            //var viewData = new ViewDataDictionary(modelMetadataProvider, modelState);
            // need page context for the page model
            PageContext pageContext = new PageContext(actionContext)
            {
                //ViewData = viewData
            };

            return pageContext;
        }

        internal static IAuthorizationHelper CreateAuthorizationHelperSubstitute(SpecificationActionTypes permissionRequired)
        {
            IAuthorizationHelper authHelper = Substitute.For<IAuthorizationHelper>();
            authHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(permissionRequired)).Returns(true);
            return authHelper;
        }

    }
}
