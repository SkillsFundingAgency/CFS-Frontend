namespace CalculateFunding.Frontend.Core.Attributes
{
    using System;

    [AttributeUsage(AttributeTargets.Class)]
    public sealed class ConfigGroupAttribute : Attribute
    {
        public ConfigGroupAttribute(string name)
        {
            Name = name;
        }

        public string Name { get; set; }
    }
}
