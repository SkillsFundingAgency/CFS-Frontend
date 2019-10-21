namespace CalculateFunding.Frontend.Helpers
{
    public static class HtmlHelperExtensions
    {
	    public static string AsFormatCalculationTypeText(this decimal? value, string textType)
	    {
		    if (textType == "Number")
		    {
			    return value?.ToString("N0") ?? "Excluded"; 

		    }

		    if (textType == "Percentage")
		    {
			    return value?.ToString("P0") ?? "Excluded";
            }

		    if (textType == "Currency")
		    {
			    return value.HasValue ? value.Value.AsFormattedMoney() : "Excluded";
            }

		    return "";
	    }
    }
}
