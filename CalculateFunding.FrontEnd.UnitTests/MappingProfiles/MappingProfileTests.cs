// <copyright file="MappingProfileTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.MappingProfiles
{
    using System;
    using AutoMapper;
    using CalculateFunding.Frontend.ViewModels;
    using FluentAssertions;
    using Microsoft.VisualStudio.TestTools.UnitTesting;

    [TestClass]
    public class MappingProfileTests
    {
        [TestMethod]
        public void FrontendMappingConfigurationIsValid()
        {
            // Arrange
            MapperConfiguration config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            Action a = new Action(() =>
            {
                config.AssertConfigurationIsValid();
            });

            // Act / Assert
            a.Should().NotThrow("Mapping configuration should be valid");
        }
    }
}
