using System.Collections.Generic;

namespace CalculateFunding.Frontend.Helpers
{
    public class VersionStringComparer : IComparer<string>
    {
        public int Compare(string s1, string s2)
        {
            bool s1Result = int.TryParse(s1, out int s1Value);
            bool s2Result = int.TryParse(s2, out int s2Value);

            if (s1Result && s2Result)
            {
                // Both are numbers so compare directly
                return s1Value.CompareTo(s2Value);
            }

            if (s1Result && !s2Result)
            {
                // RHS is NaN so LHS comes first
                return -1;
            }

            if (!s1Result && s2Result)
            {
                // LHS is NaN so RHS comes first
                return 1;
            }

            // Fallback to just compare strings
            return string.Compare(s1, s2);
        }
    }
}
