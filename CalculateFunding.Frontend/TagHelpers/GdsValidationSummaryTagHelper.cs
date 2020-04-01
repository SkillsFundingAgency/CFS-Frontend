namespace CalculateFunding.Frontend.TagHelpers
{
    using System;
    using CalculateFunding.Common.Utility;
    using Microsoft.AspNetCore.Html;
    using Microsoft.AspNetCore.Mvc.ModelBinding;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Microsoft.AspNetCore.Mvc.TagHelpers;
    using Microsoft.AspNetCore.Mvc.ViewFeatures;
    using Microsoft.AspNetCore.Razor.TagHelpers;

    [HtmlTargetElement("div", Attributes = ValidationSummaryAttributeName)]
    public class GdsValidationSummaryTagHelper : ValidationSummaryTagHelper
    {
        private const string HiddenListItem = @"<li style=""display:none""></li>";

        private const string ValidationSummaryAttributeName = "gds-validation-summary";
        private ValidationSummary _validationSummary;

        public GdsValidationSummaryTagHelper(IHtmlGenerator generator)
           : base(generator)
        {
        }

        /// <summary>
        /// Gets or sets If <see cref="ValidationSummary.All"/> or <see cref="ValidationSummary.ModelOnly"/>, appends a validation
        /// summary. Otherwise (<see cref="ValidationSummary.None"/>, the default), this tag helper does nothing.
        /// </summary>
        /// <exception cref="ArgumentException">
        /// Thrown if setter is called with an undefined <see cref="ValidationSummary"/> value e.g.
        /// <c>(ValidationSummary)23</c>.
        /// </exception>
        [HtmlAttributeName(ValidationSummaryAttributeName)]
        public new ValidationSummary ValidationSummary
        {
            get => _validationSummary;
            set
            {
                switch (value)
                {
                    case ValidationSummary.All:
                    case ValidationSummary.ModelOnly:
                    case ValidationSummary.None:
                        _validationSummary = value;
                        break;

                    default:
                        throw new ArgumentException(
                            message: "Invalid enum value for Validation Summary",
                            paramName: nameof(value));
                }
            }
        }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            Guard.ArgumentNotNull(context, nameof(context));
            Guard.ArgumentNotNull(output, nameof(output));

            if (ValidationSummary == ValidationSummary.None)
            {
                return;
            }

            TagBuilder tagBuilder = GenerateValidationSummary(
                ViewContext,
                excludePropertyErrors: ValidationSummary == ValidationSummary.ModelOnly,
                message: null,
                headerTag: null);

            if (tagBuilder == null)
            {
                // The generator determined no element was necessary.
                output.SuppressOutput();
                return;
            }

            output.MergeAttributes(tagBuilder);
            if (tagBuilder.HasInnerHtml)
            {
                output.PostContent.AppendHtml(tagBuilder.InnerHtml);
            }
        }

        private TagBuilder GenerateValidationSummary(
               ViewContext viewContext,
               bool excludePropertyErrors,
               string message,
               string headerTag)
        {
            if (viewContext == null)
            {
                throw new ArgumentNullException(nameof(viewContext));
            }

            ViewDataDictionary viewData = viewContext.ViewData;
            if (!viewContext.ClientValidationEnabled && viewData.ModelState.IsValid)
            {
                // Client-side validation is not enabled to add to the generated element and element will be empty.
                return null;
            }

            if (excludePropertyErrors &&
                (!viewData.ModelState.TryGetValue(viewData.TemplateInfo.HtmlFieldPrefix, out ModelStateEntry entryForModel) ||
                 entryForModel.Errors.Count == 0))
            {
                // Client-side validation (if enabled) will not affect the generated element and element will be empty.
                return null;
            }

            TagBuilder messageTag;
            if (string.IsNullOrEmpty(message))
            {
                messageTag = null;
            }
            else
            {
                if (string.IsNullOrEmpty(headerTag))
                {
                    headerTag = viewContext.ValidationSummaryMessageElement;
                }

                messageTag = new TagBuilder(headerTag);
                messageTag.InnerHtml.SetContent(message);
            }

            // If excludePropertyErrors is true, describe any validation issue with the current model in a single item.
            // Otherwise, list individual property errors.
            bool isHtmlSummaryModified = false;

            TagBuilder htmlSummary = new TagBuilder("ul");

            foreach (System.Collections.Generic.KeyValuePair<string, ModelStateEntry> modelStateValuePair in viewData.ModelState)
            {
                ModelStateEntry modelState = modelStateValuePair.Value;

                string fieldNameSanitisedId = modelState.Errors.Count > 0 ? NameAndIdProvider.CreateSanitizedId(viewContext, modelStateValuePair.Key, TagHelperConstants.ValidationAnchorSeparator) : string.Empty;

                // Perf: Avoid allocations
                for (int i = 0; i < modelState.Errors.Count; i++)
                {
                    ModelError modelError = modelState.Errors[i];
                    string errorText = ValidationHelpers.GetModelErrorMessageOrDefault(modelError);

                    if (!string.IsNullOrEmpty(errorText))
                    {
                        TagBuilder listItem = new TagBuilder("li");

                        TagBuilder anchorTag = new TagBuilder("a");
                        anchorTag.InnerHtml.SetContent(errorText);
                        anchorTag.AddCssClass("validation-summary-link");

                        anchorTag.Attributes.Add("href", $"#{TagHelperConstants.ValidationAnchorPrefix}-{fieldNameSanitisedId}");
                        anchorTag.Attributes.Add("id", $"validation-link-for-{fieldNameSanitisedId}");

                        listItem.InnerHtml.AppendLine(anchorTag);
                        htmlSummary.InnerHtml.AppendLine(listItem);
                        isHtmlSummaryModified = true;
                    }
                }
            }

            if (!isHtmlSummaryModified)
            {
                htmlSummary.InnerHtml.AppendHtml(HiddenListItem);
                htmlSummary.InnerHtml.AppendLine();
            }

            TagBuilder tagBuilder = new TagBuilder("div");

            if (viewData.ModelState.IsValid)
            {
                tagBuilder.AddCssClass(HtmlHelper.ValidationSummaryValidCssClassName);
            }
            else
            {
                tagBuilder.AddCssClass(HtmlHelper.ValidationSummaryCssClassName);

                TagBuilder heading = new TagBuilder("h3");
                heading.InnerHtml.Append("There is a problem");
                heading.AddCssClass("heading-large");

                tagBuilder.InnerHtml.AppendHtml(heading);

                TagBuilder errorDescriptionParagraph = new TagBuilder("p");
                TagBuilder errorDescriptionContent = new TagBuilder("strong");
                errorDescriptionContent.InnerHtml.Append("Check that you have answered the questions correctly");

                errorDescriptionParagraph.InnerHtml.AppendHtml(errorDescriptionContent);

                tagBuilder.InnerHtml.AppendHtml(errorDescriptionParagraph);
            }

            if (messageTag != null)
            {
                tagBuilder.InnerHtml.AppendLine(messageTag);
            }

            tagBuilder.InnerHtml.AppendHtml(htmlSummary);

            if (viewContext.ClientValidationEnabled && !excludePropertyErrors)
            {
                // Inform the client where to replace the list of property errors after validation.
                tagBuilder.MergeAttribute("data-valmsg-summary", "true");
            }

            return tagBuilder;
        }
    }
}
