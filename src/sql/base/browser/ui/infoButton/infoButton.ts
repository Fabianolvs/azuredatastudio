/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Button as sqlButton } from 'sql/base/browser/ui/button/button';
import * as DOM from 'vs/base/browser/dom';
import { IButtonOptions } from 'vs/base/browser/ui/button/button';
import { URI } from 'vs/base/common/uri';

type IUserFriendlyIcon = string | URI | { light: string | URI; dark: string | URI };

export interface IInfoButtonOptions extends IButtonOptions {
	description: string,
	buttonMaxHeight: number,
	iconClass: string,
	iconHeight: string | number,
	iconWidth: string | number,
	iconPath: IUserFriendlyIcon,
	textTitle: string,
	buttonMaxWidth: number,
}

export class InfoButton extends sqlButton {
	private _main: HTMLElement;
	private _iconContainer: HTMLElement;
	private _iconElement: HTMLElement;
	private _textContainer: HTMLElement;
	private _pTitle: HTMLElement;
	private _pDesc: HTMLElement;

	private _description?: string;
	private _buttonMaxHeight?: number;
	private _iconClass?: string;
	private _iconHeight?: string | number;
	private _iconWidth?: string | number;
	private _iconPath?: IUserFriendlyIcon;
	private _textTitle?: string;
	private _buttonMaxWidth?: number;

	constructor(container: HTMLElement, options?: IInfoButtonOptions) {
		super(container, options);

		{ // Creates the elements
			this._main = document.createElement('div');
			DOM.addClass(this._main, 'divContainer');
			this._main.style.cursor = 'pointer';
			this._main.style.backgroundColor = '#FFFFFF';
			this._main.style.borderRadius = '4px';
			this._main.style.boxShadow = '0px 1px 4px rgba(0, 0, 0, 0.14)';
			this._main.style.padding = '10px';
			this._main.style.display = 'flex';

			this._iconContainer = document.createElement('div');
			// DOM.addClass(this._iconContainer, 'flexContainer');
			this._iconContainer.style.alignItems = 'flex-start';
			this._iconContainer.style.display = 'flex';
			this._iconContainer.style.flexFlow = 'column';
			this._iconContainer.style.paddingTop = '10px';
			this._iconContainer.style.paddingRight = '10px';

			this._iconElement = document.createElement('div');
			DOM.addClass(this._iconElement, 'icon');

			this._textContainer = document.createElement('div');
			// DOM.addClass(this._textContainer, 'flexContainer');
			this._textContainer.style.color = '#006ab1';
			this._textContainer.style.display = 'flex';
			this._textContainer.style.flexFlow = 'column';
			this._textContainer.style.justifyContent = 'space-between';
			this._textContainer.style.padding = '0 0 5px 12px';
			this._textContainer.style.margin = '0px';

			this._pTitle = document.createElement('p');
			this._pTitle.setAttribute('aria-hidden', 'false');
			this._pTitle.style.fontSize = '14px';
			this._pTitle.style.fontWeight = 'bold';
			this._pTitle.style.margin = '0px';

			this._pDesc = document.createElement('p');
			this._pDesc.setAttribute('aria-hidden', 'false');
			this._pDesc.style.fontSize = '13px';
			this._pDesc.style.margin = '0px';

			this._textContainer.appendChild(this._pTitle);
			this._textContainer.appendChild(this._pDesc);

			this._iconContainer.appendChild(this._iconElement);

			this._main.appendChild(this._iconContainer);
			this._main.appendChild(this._textContainer);
			this.element.appendChild(this._main);
		}
		this.infoButtonOptions = options;
	}

	public get textTitle(): string {
		return this._textTitle;
	}
	public set textTitle(value: string | undefined) {
		this._textTitle = value;
		this._pTitle.innerText = this.textTitle;
	}

	public get description(): string | undefined {
		return this._description;
	}
	public set description(value: string | undefined) {
		this._description = value;
		this._pDesc.innerText = this.description;
	}

	public get buttonMaxHeight(): number | undefined {
		return this._buttonMaxHeight;
	}
	public set buttonMaxHeight(value: number | undefined) {
		this._buttonMaxHeight = value;
		this._main.style.height = this._buttonMaxHeight.toString() + 'px';
		this._iconContainer.style.height = this._buttonMaxHeight.toString() + 'px';
		this._textContainer.style.height = this._buttonMaxHeight.toString() + 'px';
	}

	public get buttonMaxWidth(): number | undefined {
		return this._buttonMaxWidth;
	}
	public set buttonMaxWidth(value: number | undefined) {
		this._buttonMaxWidth = value;
		this._main.style.width = this._buttonMaxWidth.toString() + 'px';
		this._iconContainer.style.width = (this._buttonMaxWidth - 200).toString() + 'px';
		this._textContainer.style.width = (this._buttonMaxWidth - 50).toString() + 'px';
	}

	public get iconHeight(): string | number | undefined {
		return this._iconHeight;
	}
	public set iconHeight(value: string | number | undefined) {
		this._iconHeight = value;
		// console.log('---------------------> ', this._iconHeight.toString() );
		this._iconElement.style.height = this._iconHeight.toString();
	}

	public get iconWidth(): string | number | undefined {
		return this._iconWidth;
	}
	public set iconWidth(value: string | number | undefined) {
		this._iconWidth = value;
		// console.log('---------------------> ', this._iconWidth.toString() );
		// Not working
		this._iconElement.style.width = this._iconWidth.toString();
	}

	public get iconClass(): string | undefined {
		return this._iconClass;
	}
	public set iconClass(value: string | undefined) {
		this._iconClass = value;
	}

	public get iconPath(): IUserFriendlyIcon | undefined {
		return this._iconPath;
	}
	public set iconPath(value: IUserFriendlyIcon | undefined) {
		this._iconPath = value;
		DOM.addClass(this._iconElement, this._iconPath.toString());
	}

	public set infoButtonOptions(options: IInfoButtonOptions | undefined) {
		if (!options) {
			return;
		}
		this.buttonMaxHeight = options.buttonMaxHeight;
		this.buttonMaxWidth = options.buttonMaxWidth;
		this.description = options.description;
		this.iconHeight = options.iconHeight;
		this.iconWidth = options.iconWidth;
		this.iconClass = options.iconClass;
		this.iconPath = options.iconPath;
		this.textTitle = options.textTitle;
	}
}