﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace CalculateFunding.Frontend.Properties {
    using System;
    
    
    /// <summary>
    ///   A strongly-typed resource class, for looking up localized strings, etc.
    /// </summary>
    // This class was auto-generated by the StronglyTypedResourceBuilder
    // class via a tool like ResGen or Visual Studio.
    // To add or remove a member, edit your .ResX file then rerun ResGen
    // with the /str option, or rebuild your VS project.
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("System.Resources.Tools.StronglyTypedResourceBuilder", "15.0.0.0")]
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    internal class ErrorMessages {
        
        private static global::System.Resources.ResourceManager resourceMan;
        
        private static global::System.Globalization.CultureInfo resourceCulture;
        
        [global::System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1811:AvoidUncalledPrivateCode")]
        internal ErrorMessages() {
        }
        
        /// <summary>
        ///   Returns the cached ResourceManager instance used by this class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        internal static global::System.Resources.ResourceManager ResourceManager {
            get {
                if (object.ReferenceEquals(resourceMan, null)) {
                    global::System.Resources.ResourceManager temp = new global::System.Resources.ResourceManager("CalculateFunding.Frontend.Properties.ErrorMessages", typeof(ErrorMessages).Assembly);
                    resourceMan = temp;
                }
                return resourceMan;
            }
        }
        
        /// <summary>
        ///   Overrides the current thread's CurrentUICulture property for all
        ///   resource lookups using this strongly typed resource class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        internal static global::System.Globalization.CultureInfo Culture {
            get {
                return resourceCulture;
            }
            set {
                resourceCulture = value;
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Enter a unique name.
        /// </summary>
        internal static string CalculationIdNullOrEmpty {
            get {
                return ResourceManager.GetString("CalculationIdNullOrEmpty", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Check the calculation name you entered.
        /// </summary>
        internal static string CalculationNotFoundInCalcsService {
            get {
                return ResourceManager.GetString("CalculationNotFoundInCalcsService", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Check the specification you entered - one or more of the specifications you entered aren&apos;t working.
        /// </summary>
        internal static string CalculationNotFoundInSpecsService {
            get {
                return ResourceManager.GetString("CalculationNotFoundInSpecsService", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Check the data schema - one or more the data definitions aren&apos;t working.
        /// </summary>
        internal static string DatasetDefinitionNotFoundInDatasetService {
            get {
                return ResourceManager.GetString("DatasetDefinitionNotFoundInDatasetService", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Select a data schema.
        /// </summary>
        internal static string DatasetSchemaRequired {
            get {
                return ResourceManager.GetString("DatasetSchemaRequired", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to Select a specification.
        /// </summary>
        internal static string SpecificationIdNullOrEmpty {
            get {
                return ResourceManager.GetString("SpecificationIdNullOrEmpty", resourceCulture);
            }
        }
    }
}
