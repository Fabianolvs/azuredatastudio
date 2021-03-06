/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	Component, Input, Inject, ChangeDetectorRef, forwardRef,
	ViewChild, ElementRef, OnDestroy, AfterViewInit
} from '@angular/core';

import * as azdata from 'azdata';

import { ComponentBase } from 'sql/workbench/browser/modelComponents/componentBase';
import { Dropdown, IDropdownOptions } from 'sql/base/parts/editableDropdown/browser/dropdown';
import { SelectBox } from 'sql/base/browser/ui/selectBox/selectBox';
import { attachEditableDropdownStyler } from 'sql/platform/theme/common/styler';
import { attachSelectBoxStyler } from 'vs/platform/theme/common/styler';

import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IComponent, IComponentDescriptor, IModelStore, ComponentEventType } from 'sql/platform/dashboard/browser/interfaces';
import { localize } from 'vs/nls';

@Component({
	selector: 'modelview-dropdown',
	template: `

	<div [style.width]="getWidth()">
		<div [style.display]="getLoadingDisplay()" style="width: 100%; position: relative">
			<div class="modelview-loadingComponent-spinner" style="position:absolute; right: 0px; margin-right: 5px; height:15px; z-index:1" #spinnerElement></div>
			<div [style.display]="getLoadingDisplay()" #loadingBox style="width: 100%;"></div>
		</div>
		<div [style.display]="getEditableDisplay()" #editableDropDown style="width: 100%;"></div>
		<div [style.display]="getNotEditableDisplay()" #dropDown style="width: 100%;"></div>
	</div>
	`
})
export default class DropDownComponent extends ComponentBase<azdata.DropDownProperties> implements IComponent, OnDestroy, AfterViewInit {
	@Input() descriptor: IComponentDescriptor;
	@Input() modelStore: IModelStore;
	private _editableDropdown: Dropdown;
	private _selectBox: SelectBox;
	private _isInAccessibilityMode: boolean;
	private _loadingBox: SelectBox;

	@ViewChild('editableDropDown', { read: ElementRef }) private _editableDropDownContainer: ElementRef;
	@ViewChild('dropDown', { read: ElementRef }) private _dropDownContainer: ElementRef;
	@ViewChild('loadingBox', { read: ElementRef }) private _loadingBoxContainer: ElementRef;
	constructor(
		@Inject(forwardRef(() => ChangeDetectorRef)) changeRef: ChangeDetectorRef,
		@Inject(IWorkbenchThemeService) private themeService: IWorkbenchThemeService,
		@Inject(IContextViewService) private contextViewService: IContextViewService,
		@Inject(forwardRef(() => ElementRef)) el: ElementRef,
		@Inject(IConfigurationService) private readonly configurationService: IConfigurationService
	) {
		super(changeRef, el);

		if (this.configurationService) {
			this._isInAccessibilityMode = this.configurationService.getValue('editor.accessibilitySupport') === 'on';
		}
	}

	ngOnInit(): void {
		this.baseInit();
	}

	ngAfterViewInit(): void {
		if (this._editableDropDownContainer) {
			let dropdownOptions: IDropdownOptions = {
				values: [],
				strictSelection: false,
				placeholder: '',
				maxHeight: 125,
				ariaLabel: '',
				actionLabel: ''
			};
			this._editableDropdown = new Dropdown(this._editableDropDownContainer.nativeElement, this.contextViewService,
				dropdownOptions);

			this._register(this._editableDropdown);
			this._register(attachEditableDropdownStyler(this._editableDropdown, this.themeService));
			this._register(this._editableDropdown.onValueChange(async e => {
				if (this.editable) {
					this.setSelectedValue(this._editableDropdown.value);
					await this.validate();
					this.fireEvent({
						eventType: ComponentEventType.onDidChange,
						args: e
					});
				}
			}));
			this._validations.push(() => !this.required || !this.editable || !!this._editableDropdown.value);
		}
		if (this._dropDownContainer) {
			this._selectBox = new SelectBox(this.getValues(), this.getSelectedValue(), this.contextViewService, this._dropDownContainer.nativeElement);
			this._selectBox.render(this._dropDownContainer.nativeElement);
			this._register(this._selectBox);
			this._register(attachSelectBoxStyler(this._selectBox, this.themeService));
			this._register(this._selectBox.onDidSelect(async e => {
				if (!this.editable) {
					this.setSelectedValue(this._selectBox.value);
					await this.validate();
					this.fireEvent({
						eventType: ComponentEventType.onDidChange,
						args: e
					});
				}
			}));
			this._validations.push(() => !this.required || this.editable || !!this._selectBox.value);
		}

		this._loadingBox = new SelectBox([this.getStatusText()], this.getStatusText(), this.contextViewService, this._loadingBoxContainer.nativeElement);
		this._loadingBox.render(this._loadingBoxContainer.nativeElement);
		this._register(this._loadingBox);
		this._register(attachSelectBoxStyler(this._loadingBox, this.themeService));
		this._loadingBoxContainer.nativeElement.className = ''; // Removing the dropdown arrow icon from the right
	}

	ngOnDestroy(): void {
		this.baseDestroy();
	}

	/// IComponent implementation

	public setLayout(layout: any): void {
		// TODO allow configuring the look and feel
		this.layout();
	}

	public setProperties(properties: { [key: string]: any; }): void {
		super.setProperties(properties);

		if (this.ariaLabel !== '') {
			this._selectBox.setAriaLabel(this.ariaLabel);
			this._editableDropdown.ariaLabel = this.ariaLabel;
			this._loadingBox.setAriaLabel(this.ariaLabel);
		}

		if (this.editable && !this._isInAccessibilityMode) {
			this._editableDropdown.values = this.getValues();
			if (this.value) {
				this._editableDropdown.value = this.getSelectedValue();
			}
			this._editableDropdown.enabled = this.enabled;
			this._editableDropdown.fireOnTextChange = this.fireOnTextChange;
		} else {
			this._selectBox.setOptions(this.getValues());
			this._selectBox.selectWithOptionName(this.getSelectedValue());
			if (this.enabled) {
				this._selectBox.enable();
			} else {
				this._selectBox.disable();
			}
		}

		if (this.loading) {
			this._loadingBox.setOptions([this.getStatusText()]);
			this._loadingBox.selectWithOptionName(this.getStatusText());
			this._loadingBox.enable();
		} else {
			this._loadingBox.disable();
		}

		this._selectBox.selectElem.required = this.required;
		this._editableDropdown.inputElement.required = this.required;
		this.validate();
	}

	private getValues(): string[] {
		if (this.values && this.values.length > 0) {
			if (!this.valuesHaveDisplayName()) {
				return this.values as string[];
			} else {
				return (<azdata.CategoryValue[]>this.values).map(v => v.displayName);
			}
		}
		return [];
	}

	private valuesHaveDisplayName(): boolean {
		return typeof (this.values[0]) !== 'string';
	}

	private getSelectedValue(): string {
		if (this.values && this.values.length > 0 && this.valuesHaveDisplayName()) {
			let selectedValue = <azdata.CategoryValue>this.value || <azdata.CategoryValue>this.values[0];
			let valueCategory = (<azdata.CategoryValue[]>this.values).find(v => v.name === selectedValue.name);
			return valueCategory && valueCategory.displayName;
		} else {
			if (!this.value && this.values && this.values.length > 0) {
				return <string>this.values[0];
			}
			return <string>this.value;
		}
	}

	private setSelectedValue(newValue: string): void {
		if (this.values && this.valuesHaveDisplayName()) {
			let valueCategory = (<azdata.CategoryValue[]>this.values).find(v => v.displayName === newValue);
			this.value = valueCategory;
		} else {
			this.value = newValue;
		}
	}

	// CSS-bound properties

	private get value(): string | azdata.CategoryValue {
		return this.getPropertyOrDefault<string | azdata.CategoryValue>((props) => props.value, '');
	}

	private get editable(): boolean {
		return this.getPropertyOrDefault<boolean>((props) => props.editable, false);
	}

	private get fireOnTextChange(): boolean {
		return this.getPropertyOrDefault<boolean>((props) => props.fireOnTextChange, false);
	}

	public getEditableDisplay(): string {
		return (this.editable && !this._isInAccessibilityMode) && !this.loading ? '' : 'none';
	}

	public getNotEditableDisplay(): string {
		return (!this.editable || this._isInAccessibilityMode) && !this.loading ? '' : 'none';
	}

	public getLoadingDisplay(): string {
		return this.loading ? '' : 'none';
	}

	private set value(newValue: string | azdata.CategoryValue) {
		this.setPropertyFromUI<string | azdata.CategoryValue>(this.setValueProperties, newValue);
	}

	private get values(): string[] | azdata.CategoryValue[] {
		return this.getPropertyOrDefault<string[] | azdata.CategoryValue[]>((props) => props.values, []);
	}

	private set values(newValue: string[] | azdata.CategoryValue[]) {
		this.setPropertyFromUI<string[] | azdata.CategoryValue[]>(this.setValuesProperties, newValue);
	}

	private setValueProperties(properties: azdata.DropDownProperties, value: string | azdata.CategoryValue): void {
		properties.value = value;
	}

	private setValuesProperties(properties: azdata.DropDownProperties, values: string[] | azdata.CategoryValue[]): void {
		properties.values = values;
	}

	public get required(): boolean {
		return this.getPropertyOrDefault<boolean>((props) => props.required, false);
	}

	public set required(newValue: boolean) {
		this.setPropertyFromUI<boolean>((props, value) => props.required = value, newValue);
	}

	public focus(): void {
		if (this.editable && !this._isInAccessibilityMode) {
			this._editableDropdown.focus();
		} else {
			this._selectBox.focus();
		}
	}

	public get showText(): boolean {
		return this.getPropertyOrDefault<boolean>((props) => props.showText, false);
	}

	public get loading(): boolean {
		return this.getPropertyOrDefault<boolean>((props) => props.loading, false);
	}

	public get loadingText(): string {
		return this.getPropertyOrDefault<string>((props) => props.loadingText, localize('loadingMessage', "Loading"));
	}

	public get loadingCompletedText(): string {
		return this.getPropertyOrDefault<string>((props) => props.loadingCompletedText, localize('loadingCompletedMessage', "Loading completed"));
	}

	public getStatusText(): string {
		return this.loading ? this.loadingText : this.loadingCompletedText;
	}
}
