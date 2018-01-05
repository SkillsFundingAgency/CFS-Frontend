using FluentAssertions;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace System.Collections.Generic
{
	[TestClass]
	public class IEnumerableExtensionsTests
	{
		[TestMethod]
		public void IsNullOrEmpty_GivenArrayIsNull_ReturnsTrue()
		{
			// Arrange
			IEnumerable<string> enumerable = null;

			// Act
			bool result = enumerable.IsNullOrEmpty();

			// Assert
			result
				.Should()
				.BeTrue();
		}

		[TestMethod]
		public void IsNullOrEmpty_GivenArrayIsEmpty_ReturnsTrue()
		{
			// Arrange
			IEnumerable<string> enumerable = new string[0];

			// Act
			bool result = enumerable.IsNullOrEmpty();

			// Assert
			result
				.Should()
				.BeTrue();
		}

		[TestMethod]
		public void IsNullOrEmpty_GivenArrayHasValues_ReturnsFalse()
		{
			// Arrange
			IEnumerable<string> enumerable = new[] { "A string" };

			// Act
			bool result = enumerable.IsNullOrEmpty();

			// Assert
			result
				.Should()
				.BeFalse();
		}

		[TestMethod]
		public void AnyWithNullCheck_GivenArrayIsNull_ReturnsFalse()
		{
			// Arrange
			IEnumerable<string> enumerable = null;

			// Act
			bool result = enumerable.AnyWithNullCheck();

			// Assert
			result
				.Should()
				.BeFalse();
		}

		[TestMethod]
		public void AnyWithNullCheck_GivenArrayIsEmpty_ReturnsFalse()
		{
			// Arrange
			IEnumerable<string> enumerable = new string[0];

			// Act
			bool result = enumerable.AnyWithNullCheck();

			// Assert
			result
				.Should()
				.BeFalse();
		}

		[TestMethod]
		public void AnyWithNullCheck_GivenArrayHasValues_ReturnsTrue()
		{
			// Arrange
			IEnumerable<string> enumerable = new[] { "A string" };

			// Act
			bool result = enumerable.AnyWithNullCheck();

			// Assert
			result
				.Should()
				.BeTrue();
		}

		[TestMethod]
		public void EqualTo_IfEnumerablesAreTheSameAndInTheSameOrder_ReturnTrue()
		{
			// Arrange
			IEnumerable<string> enum1 = new[] { "1", "2" };
			IEnumerable<string> enum2 = new[] { "1", "2" };

			// Act
			bool result = enum1.EqualTo(enum2);

			// Assert
			result
				.Should()
				.BeTrue();
		}

		[TestMethod]
		public void EqualTo_IfEnumerablesAreTheSameAndInDifferentOrder_ReturnTrue()
		{
			// Arrange
			IEnumerable<string> enum1 = new[] { "1", "2" };
			IEnumerable<string> enum2 = new[] { "2", "1" };

			// Act
			bool result = enum1.EqualTo(enum2);

			// Assert
			result
				.Should()
				.BeTrue();
		}

		[TestMethod]
		public void EqualTo_IfEnumerablesAreDifferent_ReturnFalse()
		{
			// Arrange
			IEnumerable<string> enum1 = new[] { "1", "2" };
			IEnumerable<string> enum2 = new[] { "2", "1", "12" };

			// Act
			bool result = enum1.EqualTo(enum2);

			// Assert
			result
				.Should()
				.BeFalse();
		}

		[TestMethod]
		public void ToArraySafe_IfEnumerableIsNull_ReturnsEmptyArray()
		{
			// Arrange
			IEnumerable<object> nullEnumerable = null;

			// Act
			IEnumerable<object> result = nullEnumerable.ToArraySafe();

			// Assert
			result
				.Should()
				.BeEmpty();
		}

		[TestMethod]
		public void ToArraySafe_IfEnumerableIsNotNull_ReturnsArray()
		{
			// Arrange
			IEnumerable<object> enumerable = new object[] { string.Empty, 1 };

			// Act
			IEnumerable<object> result = enumerable.ToArraySafe();

			// Assert
			result
				.Should()
				.HaveCount(2);
		}

		[TestMethod]
		public void IsNullOrEmpty_IfEnumerableIsNull_ReturnsTrue()
		{
			// Arrange
			IEnumerable<object> nullEnumerable = null;

			// Act
			bool result = nullEnumerable.IsNullOrEmpty();

			// Assert
			result
				.Should()
				.BeTrue();
		}

		[TestMethod]
		public void IsNullOrEmpty_IfEnumerableIsEmpty_ReturnsTrue()
		{
			// Arrange
			IEnumerable<object> nullEnumerable = new object[0];

			// Act
			bool result = nullEnumerable.IsNullOrEmpty();

			// Assert
			result
				.Should()
				.BeTrue();
		}

		[TestMethod]
		public void IsNullOrEmpty_IfEnumerableIsNotNullOrEmpty_ReturnsFalse()
		{
			// Arrange
			IEnumerable<object> nullEnumerable = new[] { new object() };

			// Act
			bool result = nullEnumerable.IsNullOrEmpty();

			// Assert
			result
				.Should()
				.BeFalse();
		}

		[TestMethod]
		public void ContainsDuplicates_GivenAListWithDuplicateValues_ReturnsTrue()
		{
			//Arrange
			IEnumerable<string> list = new[] { "one", "two", "two", "three" };

			//Act
			bool result = list.ContainsDuplicates();

			//Assert
			result
				.Should()
				.BeTrue();
		}

		[TestMethod]
		public void ContainsDuplicates_GivenAListWithoutDuplicateValues_ReturnsFalse()
		{
			//Arrange
			IEnumerable<string> list = new[] { "one", "two", "three", "four" };

			//Act
			bool result = list.ContainsDuplicates();

			//Assert
			result
				.Should()
				.BeFalse();
		}

		[TestMethod]
		public void ContainsDuplicates_GivenAnEmptyList_ReturnsFalse()
		{
			//Arrange
			IEnumerable<string> list = new List<string>();

			//Act
			bool result = list.ContainsDuplicates();

			//Assert
			result
				.Should()
				.BeFalse();
		}

		[TestMethod]
		public void ContainsDuplicates_GivenANullList_ReturnsFalse()
		{
			//Arrange
			IEnumerable<string> list = null;

			//Act
			bool result = list.ContainsDuplicates();

			//Assert
			result
				.Should()
				.BeFalse();
		}

		[TestMethod]
		public void Flatten_GivenHeirarchyOfObjects_ReturnsFalttenedList()
		{
			//Arrange
			IEnumerable<TestNode> nodes = GetNodes();

			//Act
			IEnumerable<TestNode> flattened = nodes.Flatten(m => m.ChildNodes);

			//Assert
			flattened
				.Should()
				.HaveCount(5);
		}

		[TestMethod]
		public void DistinctBy_GivenListOfItemsWithDuplicates_ReturnsNonDuplicatedItems()
		{
			//Arrange
			IEnumerable<dynamic> items = new List<dynamic>
			{
				new {Id = 1, Name = "Test1"},
				new {Id = 1, Name = "Test2"},
				new {Id = 2, Name = "Test3"},
				new {Id = 2, Name = "Test4"},
				new {Id = 3, Name = "Test5"},
				new {Id = 4, Name = "Test6"},
			};

			//Act
			IEnumerable<dynamic> nonDuplicatedItems = items.DistinctBy(m => m.Id);

			//Assert
			nonDuplicatedItems
				.Should()
				.HaveCount(4);
		}

		static IEnumerable<TestNode> GetNodes()
		{
			return new[]
			{
				new TestNode
				{
					Name = "Name1",
					ChildNodes = new[]
					{
						new TestNode
						{
							Name = "Name2",
							ChildNodes = new[]
							{
								new TestNode
								{
									Name = "Name3",
									ChildNodes = Enumerable.Empty<TestNode>()
								}
							}
						}
					}
				},
				new TestNode
				{
					Name = "Name4",
					ChildNodes = new[]
					{
						new TestNode
						{
							Name = "Name5",
							ChildNodes = Enumerable.Empty<TestNode>()

						}
					}
				}
			};
		}

		class TestNode
		{
			public string Name { get; set; }
			public IEnumerable<TestNode> ChildNodes { get; set; }
		}
	}
}
