namespace calculateFunding.controls {

    export class ExpanderViewModel {
        private items: Array<string>;
        private collapsedIcon: string = 'chevron_right';
        private expandedIcon: string = "expand_more";

        constructor(items: Array<string>) {
            this.items = items;

            this.expanded = ko.observable(false);
            this.icon = ko.observable(this.collapsedIcon);

            this.text = ko.computed(() => {
                if (!this.items) {
                    return '';
                }
                else if (this.items.length === 1) {
                    return this.items[0];
                }
                else if (this.expanded()) {
                    return this.items.join('<br/>');
                }
                else {
                    return this.items[0] + ' and ' + (this.items.length - 1) + ' more';
                }
            });
        }

        expanded: KnockoutObservable<boolean>;

        text: KnockoutComputed<string>;

        icon: KnockoutObservable<string>;

        toggleExpand() {
            let previousState = this.expanded();
            this.expanded(!previousState);

            if (this.expanded()) {
                this.icon(this.expandedIcon);
            }
            else {
                this.icon(this.collapsedIcon);
            }
        }

        canExpand() {
            if (!this.items) {
                return false;
            }
            else {
                return this.items.length > 1;
            }
        }
    }
}