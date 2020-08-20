namespace CalculateFunding.Frontend
{
    using System;
    using System.Linq;
    using System.Runtime.Serialization;

    public static class ExtensionMethods
    {
        public static string GetDisplayText(this Enum @enum)
        {
            var type = @enum.GetType();
            var enumMemberValue = type.GetMember(@enum.ToString()).FirstOrDefault()?.GetCustomAttributes(false).OfType<EnumMemberAttribute>().Select(x => x.Value).FirstOrDefault();
            return enumMemberValue ?? @enum.ToString();
        }

        public static string AsMoney(this decimal? money)
        {
            if (money == null)
            {
                return "-";
            }

            return money.Value.AsFormattedMoney();
        }

        public static string AsFormattedMoney(this decimal money)
        {
            return (money % 1) == 0 ? $"£{money:###,###,###,###,##0}" : $"£{money:###,###,###,###,##0.00}";
        }

        public static string AsFormattedNumber(this decimal number)
        {
            return $"{number:###,###,###,###,##0.##########}";
        }

        public static string AsFormattedPercentage(this decimal number)
        {
            return $"{number}%";
        }
    }
}
