namespace CalculateFunding.Frontend.TagHelpers
{
    using System;
    using CalculateFunding.Common.Utility;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Microsoft.AspNetCore.Mvc.ViewFeatures;
    using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
    using Microsoft.AspNetCore.Razor.TagHelpers;

    [HtmlTargetElement("a", Attributes = ForAttributeName)]
    public class ValidationAnchorTagHelper : TagHelper
    {
        private const string ForAttributeName = "validationanchor-for";

        [HtmlAttributeNotBound]
        [ViewContext]
        public ViewContext ViewContext { get; set; }

        /// <summary>
        /// Gets or sets an expression to be evaluated against the current model.
        /// </summary>
        [HtmlAttributeName(ForAttributeName)]
        public ModelExpression For { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            Guard.ArgumentNotNull(context, nameof(context));
            Guard.ArgumentNotNull(output, nameof(output));

            string fullName = NameAndIdProvider.GetFullHtmlFieldName(ViewContext, For.Name);
            string elementId = NameAndIdProvider.CreateSanitizedId(ViewContext, fullName, TagHelperConstants.ValidationAnchorSeparator);

            if (string.IsNullOrWhiteSpace(elementId))
            {
                throw new InvalidOperationException("Unable to determine form ID string");
            }

            output.Attributes.Add("name", $"{TagHelperConstants.ValidationAnchorPrefix}-{elementId}");
            output.Attributes.Add("class", "form-anchor");
        }
    }
}
