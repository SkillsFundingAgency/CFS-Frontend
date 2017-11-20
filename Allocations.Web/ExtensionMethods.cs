using System;
using System.Linq;
using System.Runtime.Serialization;

namespace Allocations.Web
{
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
            if (money == null) return "-";
            return money.Value.AsMoney();
        }

        public static string AsMoney(this decimal money)
        {
            const decimal oneMillion = 1000000M;
            const decimal oneBillion = 1000000000M;
           
            if (money > oneBillion)
            {
                var output = $"£{(money / oneBillion):0.00}B";
                return output.EndsWith(".00B") ? output.Replace(".00B", "B") : output;
            }
            if (money > oneMillion)
            {
                var output = $"£{(money / oneMillion):0.00}M";
                return output.EndsWith(".00M") ? output.Replace(".00M", "M") : output;
            }
            return $"£{money:0.00}";
        }
    }
}
