using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CalculateFunding.Frontend.UnitTests.Extensions
{
    [TestClass]
    public class NumberFormattingExtensionTests
    {
        [TestMethod]
        public void AsMoney_WhenValueIsZero_ThenOutputIsCorrect()
        {
            // Arrange
            decimal input = 0M;

            // Act
            string output = ExtensionMethods.AsFormattedMoney(input);

            // Assert
            output.Should().Be("£0");
        }

        [TestMethod]
        public void AsMoney_WhenValueIsZeroWithDecimalPlaces_ThenOutputIsCorrect()
        {
            // Arrange
            decimal input = 0.2M;

            // Act
            string output = ExtensionMethods.AsFormattedMoney(input);

            // Assert
            output.Should().Be("£0.20");
        }

        [TestMethod]
        public void AsMoney_WhenValueIsOverAThousand_ThenCommasAreInserted()
        {
            // Arrange
            decimal input = 10050M;

            // Act
            string output = ExtensionMethods.AsFormattedMoney(input);

            // Assert
            output.Should().Be("£10,050");
        }

        [TestMethod]
        public void AsMoney_WhenValueIsOverAMillion_ThenCommasAreInserted()
        {
            // Arrange
            decimal input =12345678M;

            // Act
            string output = ExtensionMethods.AsFormattedMoney(input);

            // Assert
            output.Should().Be("£12,345,678");
        }

        [TestMethod]
        public void AsMoney_WhenValueIsOverAMillionAndMoreDecimalPlaces_ThenCommasAreInserted()
        {
            // Arrange
            decimal input = 12345678.1234M;

            // Act
            string output = ExtensionMethods.AsFormattedMoney(input);

            // Assert
            output.Should().Be("£12,345,678.12");
        }
    }
}
