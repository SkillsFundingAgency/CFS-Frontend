// <copyright file="ReferenceTestData.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.TestData
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.Clients.CommonModels;

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
