using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using Allocations.Web.ApiClient.Models;

namespace Allocations.Web.ApiClient
{
    public static class ModelExtensions
    {
        public static string GetDisplayText(this Enum @enum)
        {
            var type = @enum.GetType();
            var enumMemberValue = type.GetMember(@enum.ToString()).FirstOrDefault()?.GetCustomAttributes(false).OfType<EnumMemberAttribute>().Select(x => x.Value).FirstOrDefault();
            return enumMemberValue ?? @enum.ToString();
        }
    }
}
