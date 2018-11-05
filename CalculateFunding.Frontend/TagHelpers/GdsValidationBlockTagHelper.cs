namespace CalculateFunding.Frontend.TagHelpers
{
    using CalculateFunding.Common.Utility;
    using Microsoft.AspNetCore.Mvc.ModelBinding;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Microsoft.AspNetCore.Mvc.ViewFeatures;
    using Microsoft.AspNetCore.Razor.TagHelpers;

    [HtmlTargetElement("div", Attributes = ForAttributeName)]
    public class GdsValidationBlockTagHelper : TagHelper
    {
        private const string ForAttributeName = "gds-validationblock-for";

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

            if (ViewContext.ModelState.IsPropertyInvalid(For.Name))
            {
                output.Attributes.Add("class", "validation-failed-block");
            }
            else
            {
                output.Attributes.Add("class", "validation-passed-block");
            }
        }
    }
}
