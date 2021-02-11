using System.Text.RegularExpressions;

namespace CalculateFunding.Frontend.Helpers
{
    public static class FirstLine
    {
        public static string ParseFirstLine(string paragraph)
        {
            if (string.IsNullOrWhiteSpace(paragraph))
            {
                return string.Empty;
            }

            Regex regex = new Regex("^(.*?)[.?!\\r\\n]\\s");

            Match match = regex.Match(paragraph);
            if (match.Success)
            {
                return match.Value.Trim();
            }

            return paragraph;
        }
    }
}
