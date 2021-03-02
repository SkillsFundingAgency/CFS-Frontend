using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace CalculateFunding.Frontend.Helpers
{
    public static class ObjectMappers
    {
        public static T SetAllBooleansTo<T>(this  T subject, bool value)
        {
            IEnumerable<PropertyInfo> baseBooleanProperties = subject
                .GetType()
                .GetProperties()
                .Where(_ => _.PropertyType == typeof(bool));
            foreach (PropertyInfo baseProp in baseBooleanProperties)
            {
                if (baseProp.CanWrite)
                {
                    baseProp.SetValue(subject, value, null);
                }
            }

            return subject;
        }
    }
}