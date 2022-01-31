using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Calculations;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Extensions
{
    [TestClass]
    public class HtmlHelperExtensionTests
    {
        [DataTestMethod]
        [DataRow(null, CalculationValueTypeViewModel.String, "Excluded")]
        [DataRow("Hello", CalculationValueTypeViewModel.String, "Hello")]
        [DataRow(null, CalculationValueTypeViewModel.Number, "Excluded")]
        [DataRow(435, CalculationValueTypeViewModel.Number, "435")]
        [DataRow(435.72, CalculationValueTypeViewModel.Number, "435.72")]
        [DataRow(null, CalculationValueTypeViewModel.Percentage, "Excluded")]
        [DataRow(50, CalculationValueTypeViewModel.Percentage, "50%")]
        [DataRow(null, CalculationValueTypeViewModel.Currency, "Excluded")]
        [DataRow(50, CalculationValueTypeViewModel.Currency, "£50")]
        [DataRow(50.77, CalculationValueTypeViewModel.Currency, "£50.77")]
        [DataRow(true, CalculationValueTypeViewModel.Boolean, "True")]
        [DataRow(false, CalculationValueTypeViewModel.Boolean, "False")]
        [DataRow(null, CalculationValueTypeViewModel.Boolean, "Excluded")]
        public void WhenCalcValueIsFormatted_ThenCorrectOutputGiven(object value, CalculationValueTypeViewModel calculationType, string expectedOutput )
        {

            string result = HtmlHelperExtensions.AsFormatCalculationType(value, calculationType);

            result.Should().Be(expectedOutput);
        }
    }
}
