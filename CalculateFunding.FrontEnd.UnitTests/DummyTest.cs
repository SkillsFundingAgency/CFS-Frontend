using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CalculateFunding.FrontEnd
{
    [TestClass]
    public class DummyTest
    {
        [TestMethod]
        public void Just_Testing()
        {
            //Arrange
            int i = 1;

            //Act
            int j = i++;

            //Assert
            i.Should().Be(2);
        }
    }
}
