namespace CalculateFunding.Frontend.Helpers
{
    public static class FormatStrings
    {
        public const string DateTimeFormatString = "d/MM/yyyy HH:mm";

        public const string DateFormatString = "d/MM/yyyy";

        public const string DateFullMonthFormatString = "dd MMMM yyyy";

        public const string TimeFormatString = "HH:mm";

        public const string MoneyFormatString = "{0:n}";

        public static string FundingPeriodString(this string input)
        {
            if (string.IsNullOrWhiteSpace(input) || input.Length!=4 )
            {
                return input;
            }
            
            return $"20{input.Substring(0,2)}/{input.Substring(2,2)}";
        }
    }
}
