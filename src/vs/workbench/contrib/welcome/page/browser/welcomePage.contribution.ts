/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from 'vs/nls';
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { WelcomePageContribution, WelcomePageAction, WelcomeInputFactory } from 'sql/workbench/contrib/welcome/page/browser/welcomePage'; // {{SQL CARBON EDIT}} use our welcome page
import { WelcomePageContribution as WelcomePageContribution2, WelcomePageAction as WelcomePageAction2, WelcomeInputFactory as WelcomeInputFactory2 } from 'vs/workbench/contrib/welcome/page/browser/welcomePage'; // {{SQL CARBON EDIT}} use our welcome pag
import { IWorkbenchActionRegistry, Extensions as ActionExtensions } from 'vs/workbench/common/actions';
import { SyncActionDescriptor, MenuRegistry, MenuId } from 'vs/platform/actions/common/actions';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions, ConfigurationScope } from 'vs/platform/configuration/common/configurationRegistry';
import { IEditorInputFactoryRegistry, Extensions as EditorExtensions } from 'vs/workbench/common/editor';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { workbenchConfigurationNodeBase } from 'vs/workbench/common/configuration';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration)
	.registerConfiguration({
		...workbenchConfigurationNodeBase,
		'properties': {
			'workbench.startupEditor': {
				'scope': ConfigurationScope.APPLICATION, // Make sure repositories cannot trigger opening a README for tracking.
				'type': 'string',
				'enum': ['none', 'welcomePage', 'readme', 'newUntitledFile', 'welcomePageInEmptyWorkbench'],
				'enumDescriptions': [
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.none' }, "Start without an editor."),
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.welcomePage' }, "Open the Welcome page"),
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.readme' }, "Open the README when opening a folder that contains one, fallback to 'welcomePage' otherwise."),
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.newUntitledFile' }, "Open a new untitled file (only applies when opening an empty workspace)."),
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.welcomePageInEmptyWorkbench' }, "Open the Welcome page when opening an empty workbench."),
				],
				'default': 'welcomePage',
				'description': localize('workbench.startupEditor', "Controls which editor is shown at startup, if none are restored from the previous session.")
			},
		}
	});

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration)
	.registerConfiguration({
		...workbenchConfigurationNodeBase,
		'properties': {
			'workbench.initialSetup': {
				'type': 'string',
				'enum': ['notInitialSetup', 'isInitialSetup'],
				'enumDescriptions': [
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.initialSetup.isInitialSetup' }, "Start with initial setup wizard"),
				],
				'default': 'isInitialSetup',
				'description': localize('workbench.initialSetup', "Controls whether or not the intial setup wizard is shown.")
			},
		}
	});

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration)
	.registerConfiguration({
		...workbenchConfigurationNodeBase,
		'properties': {
			'workbench.guidedTour': {
				'type': 'string',
				'enum': ['notGuidedTour', 'isGuidedTour'],
				'enumDescriptions': [
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.guidedTour.isGuidedTour' }, "Open the welcome page with Getting Started Tour"),
				],
				'default': 'isGuidedTour',
				'description': localize('workbench.guidedTour', "Controls whether or not to show the guided tour")
			},
		}
	});


class WelcomeContributions {
	constructor(
		@IConfigurationService configurationService: IConfigurationService,
	) {
		const previewFeaturesEnabled: boolean = configurationService.getValue('workbench')['enablePreviewFeatures'];
		if (previewFeaturesEnabled) {
			Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
				.registerWorkbenchContribution(WelcomePageContribution, LifecyclePhase.Restored);

			Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
				.registerWorkbenchAction(SyncActionDescriptor.create(WelcomePageAction, WelcomePageAction.ID, WelcomePageAction.LABEL), 'Help: Welcome', localize('help', "Help"));

			Registry.as<IEditorInputFactoryRegistry>(EditorExtensions.EditorInputFactories).registerEditorInputFactory(WelcomeInputFactory.ID, WelcomeInputFactory);
		} else {
			Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
				.registerWorkbenchContribution(WelcomePageContribution2, LifecyclePhase.Restored);

			Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
				.registerWorkbenchAction(SyncActionDescriptor.create(WelcomePageAction2, WelcomePageAction2.ID, WelcomePageAction2.LABEL), 'Help: Welcome', localize('help', "Help"));

			Registry.as<IEditorInputFactoryRegistry>(EditorExtensions.EditorInputFactories).registerEditorInputFactory(WelcomeInputFactory2.ID, WelcomeInputFactory2);
		}
	}
}

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(WelcomeContributions, LifecyclePhase.Starting);

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
	group: '1_welcome',
	command: {
		id: 'workbench.action.showWelcomePage',
		title: localize({ key: 'miWelcome', comment: ['&& denotes a mnemonic'] }, "&&Welcome")
	},
	order: 1
});
