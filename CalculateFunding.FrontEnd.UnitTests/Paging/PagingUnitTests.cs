// <copyright file="PagingUnitTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.Paging
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using FluentAssertions;
    using Microsoft.VisualStudio.TestTools.UnitTesting;

    [TestClass]
    public class PagingUnitTests
    {
        [TestMethod]
        public void PagingWithSinglePage()
        {
            // Arrange
            PagerState state = new PagerState(1, 1);

            // Act / Assert
            state.CurrentPage.Should().Be(1);
            state.NextPage.Should().BeNull();
            state.PreviousPage.Should().BeNull();

            state.Pages.Should().ContainInOrder(1);
            state.Pages.Should().HaveCount(1);
        }

        [TestMethod]
        public void PagingWithTwoPages()
        {
            // Arrange
            PagerState state = new PagerState(1, 2);

            // Act / Assert
            state.CurrentPage.Should().Be(1);
            state.NextPage.Should().BeNull();
            state.PreviousPage.Should().BeNull();

            state.Pages.Should().ContainInOrder(1, 2);
            state.Pages.Should().HaveCount(2);
        }

        [TestMethod]
        public void PagingWithTwoPages_WhenOnSecondPage()
        {
            // Arrange
            PagerState state = new PagerState(2, 2);

            // Act / Assert
            state.CurrentPage.Should().Be(2);
            state.NextPage.Should().BeNull();
            state.PreviousPage.Should().BeNull();

            state.Pages.Should().HaveCount(2);
            state.Pages.Should().ContainInOrder(1, 2);
        }

        [TestMethod]
        public void PagingWithMorePagesThanWillBeDisplayedAndOnFirstPage()
        {
            // Arrange
            PagerState state = new PagerState(1, 8);

            // Act / Assert
            state.CurrentPage.Should().Be(1);
            state.NextPage.Should().Be(5);
            state.PreviousPage.Should().BeNull();

            state.Pages.Should().HaveCount(4);
            state.Pages.Should().ContainInOrder(1, 2, 3, 4);
        }

        [TestMethod]
        public void PagingWithMorePagesThanWillBeDisplayedAndOnLastPageOfSequence()
        {
            // Arrange
            PagerState state = new PagerState(4, 8);

            // Act / Assert
            state.CurrentPage.Should().Be(4);
            state.NextPage.Should().Be(7);
            state.PreviousPage.Should().Be(2);

            state.Pages.Should().ContainInOrder(3, 4, 5, 6);
            state.Pages.Should().HaveCount(4);
        }

        [TestMethod]
        public void PagingWithCurrentPageBeingTotalNumberOfPages()
        {
            // Arrange
            PagerState state = new PagerState(8, 8);

            // Act / Assert
            state.CurrentPage.Should().Be(8);
            state.NextPage.Should().BeNull();
            state.PreviousPage.Should().Be(4);

            state.Pages.Should().ContainInOrder(5, 6, 7, 8);
            state.Pages.Should().HaveCount(4);
        }

        [TestMethod]
        public void PagingWithCurrentPageBeingSecondToLast()
        {
            // Arrange
            PagerState state = new PagerState(7, 8);

            // Act / Assert
            state.CurrentPage.Should().Be(7);
            state.NextPage.Should().BeNull();
            state.PreviousPage.Should().Be(4);

            state.Pages.Should().ContainInOrder(5, 6, 7, 8);
            state.Pages.Should().HaveCount(4);
        }

        [TestMethod]
        public void PagingWithCurrentPageBeingThirdToLast()
        {
            // Arrange
            PagerState state = new PagerState(6, 8);

            // Act / Assert
            state.CurrentPage.Should().Be(6);
            state.NextPage.Should().BeNull();
            state.PreviousPage.Should().Be(4);

            state.Pages.Should().ContainInOrder(5, 6, 7, 8);
            state.Pages.Should().HaveCount(4);
        }

        [TestMethod]
        public void PagingWithCurrentPageBeingFourthToLast()
        {
            // Arrange
            PagerState state = new PagerState(5, 8);

            // Act / Assert
            state.Pages.Should().ContainInOrder(4, 5, 6, 7);

            state.CurrentPage.Should().Be(5);
            state.NextPage.Should().Be(8);
            state.PreviousPage.Should().Be(3);

            state.Pages.Should().HaveCount(4);
        }

        [TestMethod]
        public void PagingWithEightPagesAndSecondPageSelected()
        {
            // Arrange
            PagerState state = new PagerState(2, 8);

            // Act / Assert
            state.Pages.Should().ContainInOrder(1, 2, 3, 4);

            state.CurrentPage.Should().Be(2);
            state.NextPage.Should().Be(5);
            state.PreviousPage.Should().BeNull();

            state.Pages.Should().HaveCount(4);
        }

        [TestMethod]
        public void PagingWithEightPagesAndThirdPageSelected()
        {
            // Arrange
            PagerState state = new PagerState(3, 8);

            // Act / Assert
            state.Pages.Should().ContainInOrder(2, 3, 4, 5);

            state.CurrentPage.Should().Be(3);
            state.NextPage.Should().Be(6);
            state.PreviousPage.Should().Be(1);

            state.Pages.Should().HaveCount(4);
        }

        [TestMethod]
        public void PagingWithFiveItems()
        {
            // Arrange
            PagerState state = new PagerState(1, 8, 5);

            // Act / Assert
            state.Pages.Should().ContainInOrder(1, 2, 3, 4, 5);

            state.CurrentPage.Should().Be(1);
            state.NextPage.Should().Be(6);
            state.PreviousPage.Should().BeNull();

            state.Pages.Should().HaveCount(5);
        }

        [TestMethod]
        public void PagingWithFiveItemsOnEndPage()
        {
            // Arrange
            PagerState state = new PagerState(8, 8, 5);

            // Act / Assert
            state.Pages.Should().ContainInOrder(4, 5, 6, 7, 8);

            state.CurrentPage.Should().Be(8);
            state.NextPage.Should().BeNull();
            state.PreviousPage.Should().Be(3);

            state.Pages.Should().HaveCount(5);
        }

        [TestMethod]
        public void PagingWithFiveItemsDisplayedOnThirdPage()
        {
            // Arrange
            PagerState state = new PagerState(3, 8, 5);

            // Act / Assert
            state.Pages.Should().ContainInOrder(2, 3, 4, 5, 6);

            state.CurrentPage.Should().Be(3);
            state.NextPage.Should().Be(7);
            state.PreviousPage.Should().Be(1);

            state.Pages.Should().HaveCount(5);
        }
    }
}
