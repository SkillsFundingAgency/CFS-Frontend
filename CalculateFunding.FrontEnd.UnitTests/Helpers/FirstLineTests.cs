using CalculateFunding.Frontend.Helpers;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CalculateFunding.Frontend.UnitTests.Helpers
{
    [TestClass]
    public class FirstLineTests
    {
        [TestMethod]
        public void FirstLine_ParseFirstLine_WhenOneSentenceIsProvidedWithFullStop_ThenSameTextIsReturned()
        {
            // Arrange
            string input = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

            // Act
            string result = FirstLine.ParseFirstLine(input);

            // Assert
            result
                .Should()
                .Be("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.");
        }

        [TestMethod]
        public void FirstLine_ParseFirstLine_WhenOneSentenceIsProvidedWithNoFullStop_ThenSameTextIsReturned()
        {
            // Arrange
            string input = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

            // Act
            string result = FirstLine.ParseFirstLine(input);

            // Assert
            result
                .Should()
                .Be("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua");
        }

        [TestMethod]
        public void FirstLine_ParseFirstLine_WhenAParagraphIsProvided_ThenFirstLineIsReturned()
        {
            // Arrange
            string input = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

            // Act
            string result = FirstLine.ParseFirstLine(input);

            // Assert
            result
                .Should()
                .Be("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.");
        }

        [TestMethod]
        public void FirstLine_ParseFirstLine_WhenAParagraphIsProvidedWithNewLineAfterFirstSentence_ThenFirstLineIsReturned()
        {
            // Arrange
            string input = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\r\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

            // Act
            string result = FirstLine.ParseFirstLine(input);

            // Assert
            result
                .Should()
                .Be("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.");
        }

        [TestMethod]
        public void FirstLine_ParseFirstLine_WhenAParagraphIsProvidedWithNewLineAndNotFullStopAfterFirstSentence_ThenFirstLineIsReturned()
        {
            // Arrange
            string input = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua\r\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

            // Act
            string result = FirstLine.ParseFirstLine(input);

            // Assert
            result
                .Should()
                .Be("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua");
        }

        [TestMethod]
        public void FirstLine_ParseFirstLine_WhenAParagraphIsProvidedWithQuestionMarkAtTheEndOfTheFirstSentence_ThenFirstLineIsReturned()
        {
            // Arrange
            string input = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua? Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

            // Act
            string result = FirstLine.ParseFirstLine(input);

            // Assert
            result
                .Should()
                .Be("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?");
        }

        [TestMethod]
        public void FirstLine_ParseFirstLine_WhenAParagraphIsProvidedWithExclaimationMarkAtTheEndOfTheFirstSentence_ThenFirstLineIsReturned()
        {
            // Arrange
            string input = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua! Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

            // Act
            string result = FirstLine.ParseFirstLine(input);

            // Assert
            result
                .Should()
                .Be("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua!");
        }
    }
}
