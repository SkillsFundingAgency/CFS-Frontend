using CalculateFunding.Frontend.ViewModels.Calculations;
using System;

namespace CalculateFunding.Frontend.Helpers
{
    public static class HtmlHelperExtensions
    {
        public static string AsFormatCalculationType(this decimal? value, CalculationValueTypeViewModel calculationValueTypeViewModel)
        {
            if (value.HasValue)
            {
                switch (calculationValueTypeViewModel)
                {
                    case CalculationValueTypeViewModel.Number:
                        return value.Value.AsFormattedNumber();
                    case CalculationValueTypeViewModel.Percentage:
                        return value.Value.AsFormattedPercentage();
                    case CalculationValueTypeViewModel.Currency:
                        return value.Value.AsFormattedMoney();
                    default:
                        throw new InvalidOperationException("Unknown calculation type");
                }
            }
            else
            {
                return Properties.PageText.ExcludedText;
            }
        }

        public static string AsFormatCalculationTypeText(this decimal? value, string textType)
	    {
            return value.AsFormatCalculationType(Enum.Parse<CalculationValueTypeViewModel>(textType));
        }
    }
}
