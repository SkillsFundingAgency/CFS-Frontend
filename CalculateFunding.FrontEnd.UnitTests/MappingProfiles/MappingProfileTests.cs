// <copyright file="MappingProfileTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.ViewModels;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.MappingProfiles
{

    [TestClass]
    public class MappingProfileTests
    {
        [TestMethod]
        public void FrontEndMappingProfile_ShouldBeValid()
        {
            // Arrange
            MapperConfiguration config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            Action a = new Action(() =>
            {
                config.AssertConfigurationIsValid();
            });

            // Act / Assert
            a.Should().NotThrow("Mapping configuration should be valid for FrontEndMappingProfile");
        }

        #region "Calculation -> CalculationViewModel"
#if NCRUNCH
        [Ignore]
#endif
        [TestMethod]
        [DynamicData(nameof(CalculationCalculationViewModelMappingSources), DynamicDataSourceType.Method)]
        [DynamicData(nameof(CalculationCalculationViewModelMappingSources), DynamicDataSourceType.Method)]
        public void CalculationCalculationViewModel_MapsAsExpected(Calculation source, CalculationViewModel destination)
        {
            // Arrange
            var config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            IMapper mapper = new Mapper(config);

            //Act
            var result = mapper.Map(source, destination);

            //Assert
            result?.Description
                .Should().Be(destination?.Description);

            result?.FundingPeriodId
                .Should().Be(destination?.FundingPeriodId);

            result?.FundingPeriodName
                .Should().Be(destination?.FundingPeriodName);

            if (result?.LastModified != null)
            {
                result.LastModified
                    .Should().Be(destination.LastModified);
            }

            result?.LastModifiedByName
                .Should().Be(destination?.LastModifiedByName);

            result?.SourceCode
                .Should().Be(destination?.SourceCode);

            result?.CalculationType
                .Should().Be(destination?.CalculationType);

            result?.PublishStatus
                .Should().Be(destination?.PublishStatus);

            //Final deep check - do this last so we can get descriptive errors before, but this'll catch anything else that's slipped through
            JsonConvert.SerializeObject(destination)
                .Should().Be(JsonConvert.SerializeObject(result));
        }

        private static IEnumerable<object[]> CalculationCalculationViewModelMappingSources()
        {
            yield return new object[] { null, null };
            yield return new object[] { new Calculation(), new CalculationViewModel() };
            yield return new object[]
            {
                new Calculation
                {
                    Current = new CalculationVersion
                    {
                        Description = "a",
                        Date = new DateTimeOffset(new DateTime(1, 2, 3, 4, 5, 6)),
                        SourceCode = "Pack my box with five dozen liquor jugs",
                        CalculationType =  CalculationType.Additional,
                        PublishStatus = PublishStatus.Approved
                    }
                },
                new CalculationViewModel
                {
                    Description = "a",
                    LastModified = new DateTime(1, 2, 3, 4, 5, 6),
                    SourceCode = "Pack my box with five dozen liquor jugs",
                    CalculationType = CalculationTypeViewModel.Additional,
                    PublishStatus = PublishStatusViewModel.Approved
                }
            };
        }
        #endregion

        #region "CalculationVersion -> CalculationViewModel"
#if NCRUNCH
        [Ignore]
#endif
        [TestMethod]
        [DynamicData(nameof(CalculationVersionCalculationViewModelMappingSources), DynamicDataSourceType.Method)]
        public void CalculationVersionCalculationViewModel_MapsAsExpected(CalculationVersion source, CalculationViewModel destination)
        {
            // Arrange
            var config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            IMapper mapper = new Mapper(config);

            //Act
            var result = mapper.Map(source, destination);

            //Assert
            result?.Description
                .Should().Be(destination?.Description);

            result?.FundingPeriodId
                .Should().Be(destination?.FundingPeriodId);

            result?.FundingPeriodName
                .Should().Be(destination?.FundingPeriodName);

            if (result?.LastModified != null)
            {
                result.LastModified
                    .Should().Be(destination.LastModified);
            }

            result?.LastModifiedByName
                .Should().Be(destination?.LastModifiedByName);

            result?.SourceCode
                .Should().Be(destination?.SourceCode);

            result?.CalculationType
                .Should().Be(destination?.CalculationType);

            result?.PublishStatus
                .Should().Be(destination?.PublishStatus);

            //Final deep check - do this last so we can get descriptive errors before, but this'll catch anything else that's slipped through
            JsonConvert.SerializeObject(destination)
                .Should().Be(JsonConvert.SerializeObject(result));
        }

        private static IEnumerable<object[]> CalculationVersionCalculationViewModelMappingSources()
        {
            yield return new object[] { null, null };
            yield return new object[] { new CalculationVersion(), new CalculationViewModel() };
            yield return new object[]
            {
                new CalculationVersion
                {
                    Description = "a",
                    Date = new DateTimeOffset(new DateTime(1, 2, 3, 4, 5, 6)),
                    SourceCode = "Pack my box with five dozen liquor jugs",
                    CalculationType =  CalculationType.Additional,
                    PublishStatus = PublishStatus.Approved
                },
                new CalculationViewModel
                {
                    Description = "a",
                    LastModified = new DateTime(1, 2, 3, 4, 5, 6),
                    SourceCode = "Pack my box with five dozen liquor jugs",
                    CalculationType = CalculationTypeViewModel.Additional,
                    PublishStatus = PublishStatusViewModel.Approved
                }
            };
        }
        #endregion

        #region "Calculation -> CalculationEditViewModel"
#if NCRUNCH
        [Ignore]
#endif
        [TestMethod]
        [DynamicData(nameof(CalculationCalculationEditViewModelMappingSources), DynamicDataSourceType.Method)]
        public void CalculationCalculationEditViewModel_MapsAsExpected(Calculation source, CalculationEditViewModel destination)
        {
            // Arrange
            var config = new MapperConfiguration(c => c.AddProfile<FrontEndMappingProfile>());
            IMapper mapper = new Mapper(config);

            //Act
            var result = mapper.Map(source, destination);

            //Assert
            result?.SourceCode
                .Should().Be(destination?.SourceCode);

            //Final deep check - do this last so we can get descriptive errors before, but this'll catch anything else that's slipped through
            JsonConvert.SerializeObject(destination)
                .Should().Be(JsonConvert.SerializeObject(result));
        }

        private static IEnumerable<object[]> CalculationCalculationEditViewModelMappingSources()
        {
            yield return new object[] { null, null };
            yield return new object[] { new Calculation(), new CalculationEditViewModel() };
            yield return new object[]
            {
                new Calculation
                {
                    Current = new CalculationVersion
                    {
                        Description = "a",
                        Date = new DateTimeOffset(new DateTime(1, 2, 3, 4, 5, 6)),
                        SourceCode = "Pack my box with five dozen liquor jugs",
                        CalculationType =  CalculationType.Additional,
                        PublishStatus = PublishStatus.Approved
                    }
                },
                new CalculationEditViewModel
                {
                    SourceCode = "Pack my box with five dozen liquor jugs",
                }
            };
        }
        #endregion
    }
}
