using System.Collections.Generic;
using System.Diagnostics;

namespace CalculateFunding.Frontend.TagHelpers
{
    internal class CurrentValues
    {
        public CurrentValues(ICollection<string> values)
        {
            Debug.Assert(values != null);
            Values = values;
        }

        public ICollection<string> Values { get; }

        public ICollection<string> ValuesAndEncodedValues { get; set; }
    }
}
