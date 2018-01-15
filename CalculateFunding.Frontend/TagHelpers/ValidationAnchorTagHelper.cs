using System;
using CalculateFunding.Frontend.Helpers;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace CalculateFunding.Frontend.TagHelpers
{
    [HtmlTargetElement("a", Attributes = ForAttributeName)]
    public class ValidationAnchorTagHelper : TagHelper
    {
        private const string ForAttributeName = "validationanchor-for";

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            Guard.ArgumentNotNull(context, nameof(context));
            Guard.ArgumentNotNull(output, nameof(output));

            var fullName = NameAndIdProvider.GetFullHtmlFieldName(ViewContext, For.Name);
            var idString = NameAndIdProvider.CreateSanitizedId(ViewContext, fullName, TagHelperConstants.ValidationAnchorSeparator);

            if (string.IsNullOrWhiteSpace(idString))
            {
                throw new InvalidOperationException("Unable to determine form ID string");
            }

            output.Attributes.Add("name", $"{TagHelperConstants.ValidationAnchorPrefix}-{idString}");
            output.Attributes.Add("class", "form-anchor");
        }

        [HtmlAttributeNotBound]
        [ViewContext]
        public ViewContext ViewContext { get; set; }

        /// <summary>
        /// An expression to be evaluated against the current model.
        /// </summary>
        [HtmlAttributeName(ForAttributeName)]
        public ModelExpression For { get; set; }
    }
}
