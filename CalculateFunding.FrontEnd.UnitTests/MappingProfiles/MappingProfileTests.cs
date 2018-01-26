using AutoMapper;
using CalculateFunding.Frontend.ViewModels;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace CalculateFunding.Frontend.MappingProfiles
{
    [TestClass]
    public class MappingProfileTests
    {
        [TestMethod]
        public void FrontendMappingConfigurationIsValid()
        {
            // Arrange
            MapperConfiguration config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            Action a = new Action(() => {
                config.AssertConfigurationIsValid();
            });

            // Act / Assert
            a.ShouldNotThrow("Mapping configuration should be valid");
        }
    }
}
