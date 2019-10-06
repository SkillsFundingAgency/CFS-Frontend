namespace CalculateFunding.Frontend.Helpers
{
    public static class HtmlHelperExtensions
    {
	    public static string FormatCalculationTypeText(decimal? text, string textType)
	    {
		    if (textType == "Number")
		    {
			    return text?.ToString("N0");

		    }

		    if (textType == "Percentage")
		    {
			    return text?.ToString("P0");
            }

		    if (textType == "Currency")
		    {
			    return text?.ToString("C0");
            }

		    return "";
	    }
    }
}
