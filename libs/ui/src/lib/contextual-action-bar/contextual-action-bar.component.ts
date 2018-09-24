import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  ContextualActionBarService,
  ContextualTab
} from './contextual-action-bar.service';
import { CommandRunner, Messenger } from '@angular-console/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-contextual-action-bar',
  templateUrl: './contextual-action-bar.component.html',
  styleUrls: ['./contextual-action-bar.component.scss']
})
export class ContextualActionBarComponent {
  constructor(
    readonly contextualActionBarService: ContextualActionBarService,
    readonly commandRunner: CommandRunner,
    readonly messenger: Messenger
  ) {}

  trackByName(_: number, tab: ContextualTab) {
    return tab.name;
  }

  stopCommand() {
    this.commandRunner.stopCommand();
    this.messenger.notify('Command has been canceled');
  }
}
