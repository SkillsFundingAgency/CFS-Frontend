using CalculateFunding.Frontend.ViewModels.Calculations;
using System;

namespace CalculateFunding.Frontend.Helpers
{
    public static class HtmlHelperExtensions
    {
        public static string AsFormatCalculationType(this object value, CalculationValueTypeViewModel calculationValueTypeViewModel)
        {
            if (value == null)
            {
                return Properties.PageText.ExcludedText;

            }

            if (calculationValueTypeViewModel == CalculationValueTypeViewModel.String)
            {
                return value?.ToString();
            }

            if (calculationValueTypeViewModel == CalculationValueTypeViewModel.Number ||
                calculationValueTypeViewModel == CalculationValueTypeViewModel.Percentage ||
                calculationValueTypeViewModel == CalculationValueTypeViewModel.Currency)
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
                }
            }

            if (calculationValueTypeViewModel == CalculationValueTypeViewModel.Boolean || value != null)
            {
                return value.ToString();
            }

            throw new InvalidOperationException("Unknown calculation type from CalculationValueTypeViewModel");
        }
    }
}
