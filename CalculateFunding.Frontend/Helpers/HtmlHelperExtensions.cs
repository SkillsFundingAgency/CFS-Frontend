using CalculateFunding.Frontend.ViewModels.Calculations;
using System;

namespace CalculateFunding.Frontend.Helpers
{
    public static class HtmlHelperExtensions
    {
        public static string AsFormatCalculationType(this object value, CalculationValueTypeViewModel calculationValueTypeViewModel)
        {
	        if (value != null)
	        {
		        if (decimal.TryParse(value.ToString(), out decimal decimalValue))
	            {
		            switch (calculationValueTypeViewModel)
		            {
			            case CalculationValueTypeViewModel.Number:
				            return decimalValue.AsFormattedNumber();
			            case CalculationValueTypeViewModel.Percentage:
				            return decimalValue.AsFormattedPercentage();
			            case CalculationValueTypeViewModel.Currency:
				            return decimalValue.AsFormattedMoney();
			            default:
				            throw new InvalidOperationException("Unknown calculation type");
		            }
	            }

		        return value.ToString();
            }

	        return Properties.PageText.ExcludedText;
        }

        public static string AsFormatCalculationTypeText(this decimal? value, string textType)
	    {
            return value.AsFormatCalculationType(Enum.Parse<CalculationValueTypeViewModel>(textType));
        }
    }
}
