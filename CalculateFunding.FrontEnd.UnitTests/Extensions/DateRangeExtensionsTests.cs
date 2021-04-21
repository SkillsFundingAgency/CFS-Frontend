using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static CalculateFunding.Frontend.Extensions.DateRangeExtensions;


namespace CalculateFunding.Frontend.UnitTests.Extensions
{
    [TestClass]
    public class DateRangeExtensionsTests
    {

        [TestMethod]
        [DynamicData(nameof(DateRangeExamples), DynamicDataSourceType.Method)]
        public void GetMonthsBetweenListsMonthsAndYearsFromSuppliedStartEndToSuppliedEndDate(DateTimeOffset startDate,
            DateTimeOffset endDate,
            string[] expectedMonthsBetween)
        {
            string[] monthsBetween = GetMonthsBetween(startDate, endDate).ToArray();

            monthsBetween
                .Should()
                .BeEquivalentTo(expectedMonthsBetween);
        }

        public static IEnumerable<object[]> DateRangeExamples()
        {
            yield return new object[]
            {
                NewDate(1980, 6, 26),
                NewDate(1981, 2, 4),
                StringArray("June 1980", "July 1980", "August 1980", "September 1980", "October 1980", "November 1980", "December 1980", "January 1981", "February 1981")
            };
            yield return new object[]
            {
                NewDate(2021, 6, 1),
                NewDate(2021, 6, 26),
                StringArray("June 2021")
            };
        }

        private static string[] StringArray(params string[] items) => items;

        private static DateTimeOffset NewDate(int year,
            int month,
            int day) => new DateTimeOffset(new DateTime(year, month, day));
    }
}