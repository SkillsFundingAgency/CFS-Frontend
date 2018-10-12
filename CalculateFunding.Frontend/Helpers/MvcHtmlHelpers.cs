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

            string result = WebUtility.HtmlEncode(input);

            // Replace windows new line first
            result = result.Replace("\r\n", "<br/>");

            // When initially saving a document, it is only \n so replace this after to catch it first render before app pool reset
            result = result.Replace("\n", "<br/>");

            return new HtmlString(result);
        }
    }
}
