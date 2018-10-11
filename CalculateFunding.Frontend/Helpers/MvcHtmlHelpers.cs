using System.Net;
using Microsoft.AspNetCore.Html;

namespace CalculateFunding.Frontend.Helpers
{
    public static class MvcHtmlHelpers
    {
        public static IHtmlContent ReplaceLineBreaksForHtml(this string input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new HtmlString("");
            }

            // Replace windows new line first
            string result = input.Replace("\r\n", "<br/>");

            // When initially saving a document, it is only \n so replace this after to catch it first render before app pool reset
            result = result.Replace("\n", "<br/>");

            result = WebUtility.HtmlEncode(result);
            return new HtmlString(result);
        }
    }
}
