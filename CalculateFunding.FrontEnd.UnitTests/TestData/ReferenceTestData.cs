using CalculateFunding.Frontend.ApiClient.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace CalculateFunding.FrontEnd.TestData
{
    public static class ReferenceTestData
    {
        public static IEnumerable<Reference> AcademicYears()
        {
            return new[]
            {
                new Reference("1617", "2016-2017"),
                new Reference("1718", "2017-2018"),
                new Reference("1819", "2018-2019")
            };
        }
    }
}
