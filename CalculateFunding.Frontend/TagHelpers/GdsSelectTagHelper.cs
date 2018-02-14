namespace CalculateFunding.Frontend.TagHelpers
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;
    using CalculateFunding.Frontend.ViewModels.Common;
    using Microsoft.AspNetCore.Html;
    using Microsoft.AspNetCore.Mvc.ModelBinding;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Microsoft.AspNetCore.Mvc.TagHelpers;
    using Microsoft.AspNetCore.Mvc.TagHelpers.Internal;
    using Microsoft.AspNetCore.Mvc.ViewFeatures;
    using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
    using Microsoft.AspNetCore.Razor.TagHelpers;

    /// <summary>
    /// <see cref="ITagHelper"/> implementation targeting &lt;select&gt; elements with <c>gds-for</c> and/or
    /// <c>gds-items</c> attribute(s).
    /// </summary>
    [HtmlTargetElement("select", Attributes = ForAttributeName)]
    [HtmlTargetElement("select", Attributes = ItemsAttributeName)]
    public class GdsSelectTagHelper : TagHelper
    {
        private const string ForAttributeName = "gds-for";
        private const string ItemsAttributeName = "gds-items";

        private const string IdAttributeDotReplacement = "_";

        private readonly ValidationHtmlAttributeProvider _validationAttributeProvider;

        private bool _allowMultiple;
        private ICollection<string> _currentValues;
        private IModelMetadataProvider _metadataProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="GdsSelectTagHelper"/> class.
        /// Creates a new <see cref="SelectTagHelper"/>.
        /// </summary>
        /// <param name="generator">The <see cref="IHtmlGenerator"/>.</param>
        /// <param name="metadataProvider">Metadata provider</param>
        /// <param name="validationAttributeProvider">Validation Attribute Provider</param>
        public GdsSelectTagHelper(IHtmlGenerator generator, IModelMetadataProvider metadataProvider, ValidationHtmlAttributeProvider validationAttributeProvider)
        {
            Generator = generator;
            _metadataProvider = metadataProvider;
            _validationAttributeProvider = validationAttributeProvider;
        }

        /// <inheritdoc />
        public override int Order => -1000;

        [HtmlAttributeNotBound]
        [ViewContext]
        public ViewContext ViewContext { get; set; }

        /// <summary>
        /// Gets or sets An expression to be evaluated against the current model.
        /// </summary>
        [HtmlAttributeName(ForAttributeName)]
        public ModelExpression For { get; set; }

        /// <summary>
        /// Gets or sets a collection of <see cref="GdsSelectListItem"/> objects used to populate the &lt;select&gt; element with
        /// &lt;optgroup&gt; and &lt;option&gt; elements.
        /// </summary>
        [HtmlAttributeName(ItemsAttributeName)]
        public IEnumerable<GdsSelectListItem> Items { get; set; }

        /// <summary>
        /// Gets or sets the name of the &lt;input&gt; element.
        /// </summary>
        /// <remarks>
        /// Passed through to the generated HTML in all cases. Also used to determine whether <see cref="For"/> is
        /// valid with an empty <see cref="ModelExpression.Name"/>.
        /// </remarks>
        public string Name { get; set; }

        protected IHtmlGenerator Generator { get; }

        /// <inheritdoc />
        public override void Init(TagHelperContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (For == null)
            {
                // Informs contained elements that they're running within a targeted <select/> element.
                context.Items[typeof(GdsSelectTagHelper)] = null;
                return;
            }

            // Note null or empty For.Name is allowed because TemplateInfo.HtmlFieldPrefix may be sufficient.
            // IHtmlGenerator will enforce name requirements.
            if (For.Metadata == null)
            {
                throw new InvalidOperationException("No provided value for metadata");
            }

            // Base allowMultiple on the instance or declared type of the expression to avoid a
            // "SelectExpressionNotEnumerable" InvalidOperationException during generation.
            // Metadata.IsEnumerableType is similar but does not take runtime type into account.
            var realModelType = For.ModelExplorer.ModelType;
            _allowMultiple = typeof(string) != realModelType &&
                typeof(IEnumerable).IsAssignableFrom(realModelType);
            _currentValues = Generator.GetCurrentValues(ViewContext, For.ModelExplorer, For.Name, _allowMultiple);

            // Whether or not (not being highly unlikely) we generate anything, could update contained <option/>
            // elements. Provide selected values for <option/> tag helpers.
            var currentValues = _currentValues == null ? null : new CurrentValues(_currentValues);
            context.Items[typeof(GdsSelectTagHelper)] = currentValues;
        }

        /// <inheritdoc />
        /// <remarks>Does nothing if <see cref="For"/> is <c>null</c>.</remarks>
        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (output == null)
            {
                throw new ArgumentNullException(nameof(output));
            }

            // Pass through attribute that is also a well-known HTML attribute. Must be done prior to any copying
            // from a TagBuilder.
            if (Name != null)
            {
                output.CopyHtmlAttribute(nameof(Name), context);
            }

            // Ensure GenerateSelect() _never_ looks anything up in ViewData.
            var items = Items ?? Enumerable.Empty<GdsSelectListItem>();

            if (For == null)
            {
                var options = GenerateGroupsAndOptions(optionLabel: null, selectList: items);
                output.PostContent.AppendHtml(options);
                return;
            }

            // Ensure Generator does not throw due to empty "fullName" if user provided a name attribute.
            IDictionary<string, object> htmlAttributes = null;
            if (string.IsNullOrEmpty(For.Name) &&
                string.IsNullOrEmpty(ViewContext.ViewData.TemplateInfo.HtmlFieldPrefix) &&
                !string.IsNullOrEmpty(Name))
            {
                htmlAttributes = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase)
                {
                    { "name", Name },
                };
            }

            TagBuilder tagBuilder = GenerateSelect(
                ViewContext,
                For.ModelExplorer,
                optionLabel: null,
                expression: For.Name,
                selectList: items,
                currentValues: _currentValues,
                allowMultiple: _allowMultiple,
                htmlAttributes: htmlAttributes);

            tagBuilder.AddCssClass("gds-select");

            if (tagBuilder != null)
            {
                output.MergeAttributes(tagBuilder);
                if (tagBuilder.HasInnerHtml)
                {
                    output.PostContent.AppendHtml(tagBuilder.InnerHtml);
                }
            }
        }

        public IHtmlContent GenerateGroupsAndOptions(string optionLabel, IEnumerable<GdsSelectListItem> selectList)
        {
            return GenerateGroupsAndOptions(optionLabel, selectList, currentValues: null);
        }

        public TagBuilder GenerateSelect(
            ViewContext viewContext,
            ModelExplorer modelExplorer,
            string optionLabel,
            string expression,
            IEnumerable<GdsSelectListItem> selectList,
            bool allowMultiple,
            object htmlAttributes)
        {
            if (viewContext == null)
            {
                throw new ArgumentNullException(nameof(viewContext));
            }

            var currentValues = Generator.GetCurrentValues(viewContext, modelExplorer, expression, allowMultiple);
            return GenerateSelect(
                viewContext,
                modelExplorer,
                optionLabel,
                expression,
                selectList,
                currentValues,
                allowMultiple,
                htmlAttributes);
        }

        public virtual TagBuilder GenerateSelect(
            ViewContext viewContext,
            ModelExplorer modelExplorer,
            string optionLabel,
            string expression,
            IEnumerable<GdsSelectListItem> selectList,
            ICollection<string> currentValues,
            bool allowMultiple,
            object htmlAttributes)
        {
            if (viewContext == null)
            {
                throw new ArgumentNullException(nameof(viewContext));
            }

            var fullName = NameAndIdProvider.GetFullHtmlFieldName(viewContext, expression);
            var htmlAttributeDictionary = GetHtmlAttributeDictionaryOrNull(htmlAttributes);
            if (!IsFullNameValid(fullName, htmlAttributeDictionary))
            {
                throw new ArgumentNullException("FormatHtmlGenerator_FieldNameCannotBeNullOrEmpty", nameof(expression));
                ////throw new ArgumentException(
                ////    Resources.FormatHtmlGenerator_FieldNameCannotBeNullOrEmpty(
                ////        typeof(IHtmlHelper).FullName,
                ////        nameof(IHtmlHelper.Editor),
                ////        typeof(IHtmlHelper<>).FullName,
                ////        nameof(IHtmlHelper<object>.EditorFor),
                ////        "htmlFieldName"),
                ////    nameof(expression));
            }

            // If we got a null selectList, try to use ViewData to get the list of items.
            if (selectList == null)
            {
                selectList = GetSelectListItems(viewContext, expression);
            }

            modelExplorer = modelExplorer ??
                ExpressionMetadataProvider.FromStringExpression(expression, viewContext.ViewData, _metadataProvider);

            // Convert each ListItem to an <option> tag and wrap them with <optgroup> if requested.
            var listItemBuilder = GenerateGroupsAndOptions(optionLabel, selectList, currentValues);

            var tagBuilder = new TagBuilder("select");
            tagBuilder.InnerHtml.SetHtmlContent(listItemBuilder);
            tagBuilder.MergeAttributes(htmlAttributeDictionary);
            NameAndIdProvider.GenerateId(viewContext, tagBuilder, fullName, IdAttributeDotReplacement);
            if (!string.IsNullOrEmpty(fullName))
            {
                tagBuilder.MergeAttribute("name", fullName, replaceExisting: true);
            }

            if (allowMultiple)
            {
                tagBuilder.MergeAttribute("multiple", "multiple");
            }

            // If there are any errors for a named field, we add the css attribute.
            if (viewContext.ViewData.ModelState.TryGetValue(fullName, out var entry))
            {
                if (entry.Errors.Count > 0)
                {
                    tagBuilder.AddCssClass(HtmlHelper.ValidationInputCssClassName);
                }
            }

            AddValidationAttributes(viewContext, tagBuilder, modelExplorer, expression);

            return tagBuilder;
        }

        /// <summary>
        /// Adds validation attributes to the <paramref name="tagBuilder" /> if client validation
        /// is enabled.
        /// </summary>
        /// <param name="viewContext">A <see cref="ViewContext"/> instance for the current scope.</param>
        /// <param name="tagBuilder">A <see cref="TagBuilder"/> instance.</param>
        /// <param name="modelExplorer">The <see cref="ModelExplorer"/> for the <paramref name="expression"/>.</param>
        /// <param name="expression">Expression name, relative to the current model.</param>
        protected virtual void AddValidationAttributes(
            ViewContext viewContext,
            TagBuilder tagBuilder,
            ModelExplorer modelExplorer,
            string expression)
        {
            modelExplorer = modelExplorer ?? ExpressionMetadataProvider.FromStringExpression(
                expression,
                viewContext.ViewData,
                _metadataProvider);

            _validationAttributeProvider.AddAndTrackValidationAttributes(
                viewContext,
                modelExplorer,
                expression,
                tagBuilder.Attributes);
        }

        private static IEnumerable<GdsSelectListItem> GetSelectListItems(
            ViewContext viewContext,
            string expression)
        {
            if (viewContext == null)
            {
                throw new ArgumentNullException(nameof(viewContext));
            }

            // Method is called only if user did not pass a select list in. They must provide select list items in the
            // ViewData dictionary and definitely not as the Model. (Even if the Model datatype were correct, a
            // <select> element generated for a collection of SelectListItems would be useless.)
            var value = viewContext.ViewData.Eval(expression);

            // First check whether above evaluation was successful and did not match ViewData.Model.
            if (value == null || value == viewContext.ViewData.Model)
            {
                throw new InvalidOperationException("FormatHtmlHelper_MissingSelectData");
                ////throw new InvalidOperationException(Resources.FormatHtmlHelper_MissingSelectData(
                ////    $"IEnumerable<{nameof(GdsSelectListItem)}>",
                ////    expression));
            }

            // Second check the Eval() call returned a collection of SelectListItems.
            var selectList = value as IEnumerable<GdsSelectListItem>;
            if (selectList == null)
            {
                throw new InvalidOperationException("FormatHtmlHelper_WrongSelectDataType");
                ////throw new InvalidOperationException(Resources.FormatHtmlHelper_WrongSelectDataType(
                ////    expression,
                ////    value.GetType().FullName,
                ////    $"IEnumerable<{nameof(GdsSelectListItem)}>"));
            }

            return selectList;
        }

        private static bool IsFullNameValid(string fullName, IDictionary<string, object> htmlAttributeDictionary)
        {
            return IsFullNameValid(fullName, htmlAttributeDictionary, fallbackAttributeName: "name");
        }

        private static bool IsFullNameValid(
            string fullName,
            IDictionary<string, object> htmlAttributeDictionary,
            string fallbackAttributeName)
        {
            if (string.IsNullOrEmpty(fullName))
            {
                // fullName==null is normally an error because name="" is not valid in HTML 5.
                if (htmlAttributeDictionary == null)
                {
                    return false;
                }

                // Check if user has provided an explicit name attribute.
                // Generalized a bit because other attributes e.g. data-valmsg-for refer to element names.
                htmlAttributeDictionary.TryGetValue(fallbackAttributeName, out var attributeObject);
                var attributeString = Convert.ToString(attributeObject, CultureInfo.InvariantCulture);
                if (string.IsNullOrEmpty(attributeString))
                {
                    return false;
                }
            }

            return true;
        }

        // Only need a dictionary if htmlAttributes is non-null. TagBuilder.MergeAttributes() is fine with null.
        private static IDictionary<string, object> GetHtmlAttributeDictionaryOrNull(object htmlAttributes)
        {
            IDictionary<string, object> htmlAttributeDictionary = null;
            if (htmlAttributes != null)
            {
                htmlAttributeDictionary = htmlAttributes as IDictionary<string, object>;
                if (htmlAttributeDictionary == null)
                {
                    htmlAttributeDictionary = HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes);
                }
            }

            return htmlAttributeDictionary;
        }

        private static TagBuilder GenerateOption(GdsSelectListItem item, string text)
        {
            return GenerateOption(item, text, item.Selected);
        }

        private static TagBuilder GenerateOption(GdsSelectListItem item, string text, bool selected)
        {
            var tagBuilder = new TagBuilder("option");
            tagBuilder.InnerHtml.SetContent(text);

            if (item.Value != null)
            {
                tagBuilder.Attributes["value"] = item.Value;
            }

            if (selected)
            {
                tagBuilder.Attributes["selected"] = "selected";
            }

            if (item.Disabled)
            {
                tagBuilder.Attributes["disabled"] = "disabled";
            }

            if (!string.IsNullOrWhiteSpace(item.Description))
            {
                tagBuilder.Attributes["data-description"] = item.Description;
            }

            return tagBuilder;
        }

        private IHtmlContent GenerateOption(GdsSelectListItem item, ICollection<string> currentValues)
        {
            var selected = item.Selected;
            if (currentValues != null)
            {
                var value = item.Value ?? item.Text;
                selected = currentValues.Contains(value);
            }

            var tagBuilder = GenerateOption(item, item.Text, selected);
            return tagBuilder;
        }

        private IHtmlContent GenerateGroupsAndOptions(
            string optionLabel,
            IEnumerable<GdsSelectListItem> selectList,
            ICollection<string> currentValues)
        {
            var itemsList = selectList as IList<GdsSelectListItem>;
            if (itemsList == null)
            {
                itemsList = selectList.ToList();
            }

            var count = itemsList.Count;
            if (optionLabel != null)
            {
                count++;
            }

            // Short-circuit work below if there's nothing to add.
            if (count == 0)
            {
                return HtmlString.Empty;
            }

            var listItemBuilder = new HtmlContentBuilder(count);

            // Make optionLabel the first item that gets rendered.
            if (optionLabel != null)
            {
                listItemBuilder.AppendLine(GenerateOption(
                    new GdsSelectListItem()
                    {
                        Text = optionLabel,
                        Value = string.Empty,
                        Selected = false,
                    },
                    currentValues: null));
            }

            // Group items in the SelectList if requested.
            // The worst case complexity of this algorithm is O(number of groups*n).
            // If there aren't any groups, it is O(n) where n is number of items in the list.
            var optionGenerated = new bool[itemsList.Count];
            for (var i = 0; i < itemsList.Count; i++)
            {
                if (!optionGenerated[i])
                {
                    var item = itemsList[i];
                    var optGroup = item.Group;
                    if (optGroup != null)
                    {
                        var groupBuilder = new TagBuilder("optgroup");
                        if (optGroup.Name != null)
                        {
                            groupBuilder.MergeAttribute("label", optGroup.Name);
                        }

                        if (optGroup.Disabled)
                        {
                            groupBuilder.MergeAttribute("disabled", "disabled");
                        }

                        groupBuilder.InnerHtml.AppendLine();

                        for (var j = i; j < itemsList.Count; j++)
                        {
                            var groupItem = itemsList[j];

                            if (!optionGenerated[j] &&
                                object.ReferenceEquals(optGroup, groupItem.Group))
                            {
                                groupBuilder.InnerHtml.AppendLine(GenerateOption(groupItem, currentValues));
                                optionGenerated[j] = true;
                            }
                        }

                        listItemBuilder.AppendLine(groupBuilder);
                    }
                    else
                    {
                        listItemBuilder.AppendLine(GenerateOption(item, currentValues));
                        optionGenerated[i] = true;
                    }
                }
            }

            return listItemBuilder;
        }
    }
}
