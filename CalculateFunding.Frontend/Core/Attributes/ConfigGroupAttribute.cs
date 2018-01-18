using System;

namespace CalculateFunding.Frontend.Core.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    sealed public class ConfigGroupAttribute : Attribute
    {
        public ConfigGroupAttribute(string name)
        {
            Name = name;
        }

        public string Name { get; set; }
    }
}
