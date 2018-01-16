using CalculateFunding.Frontend.Helpers;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace CalculateFunding.Frontend.TagHelpers
{
    [HtmlTargetElement("div", Attributes = ForAttributeName)]
    public class GdsValidationBlockTagHelper : TagHelper
    {
        private const string ForAttributeName = "gds-validationblock-for";

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            Guard.ArgumentNotNull(context, nameof(context));
            Guard.ArgumentNotNull(output, nameof(output));

            if (ViewContext.ModelState.IsPropertyInvalid(For.Name))
            {
                output.Attributes.Add("class", "validation-failed-block");
            }
            else
            {
                output.Attributes.Add("class", "validation-passed-block");
            }
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
