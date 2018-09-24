import { HttpClientModule } from '@angular/common/http';
import { NgModule, InjectionToken, Optional } from '@angular/core';
import {
  MatIconModule,
  MatIconRegistry,
  MatSnackBarModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  FeatureWorkspacesModule,
  workspaceRoutes
} from '@angular-console/feature-workspaces';
import { UiModule } from '@angular-console/ui';
import {
  AnalyticsCollector,
  CancelCommandGuard,
  Messenger
} from '@angular-console/utils';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule, Options as ApolloLinkOptions } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';

import { AppComponent } from './app.component';
import {
  appShellRoutes,
  FeatureAppShellModule
} from '@angular-console/feature-app-shell';

export const BACKEND_PORT = new InjectionToken<number>('BACKEND_PORT');

export function initApollo(
  analytics: AnalyticsCollector,
  messenger: Messenger,
  httpLink: HttpLink,
  port?: number
) {
  analytics.setUpRouterLogging();

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message }) => {
        messenger.error(message);
        analytics.reportException(message);
      });
    } else if (networkError) {
      const n: any = networkError;
      if (n.error && n.error.errors && n.error.errors.length > 0) {
        const message = n.error.errors[0].message;
        messenger.error(message);
        analytics.reportException(message);
      } else {
        messenger.error(n.message);
        analytics.reportException(n.message);
      }
    }
  });

  const linkOptions: ApolloLinkOptions = {};
  if (port) {
    linkOptions.uri = `http://localhost:${port}/graphql`;
  }

  return {
    defaultOptions: {
      query: { fetchPolicy: 'network-only' },
      watchQuery: { fetchPolicy: 'network-only' }
    },
    link: errorLink.concat(httpLink.create(linkOptions)),
    cache: new InMemoryCache()
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    MatIconModule,
    MatSnackBarModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    ApolloModule,
    HttpLinkModule,
    HttpClientModule,
    FeatureAppShellModule,
    FeatureWorkspacesModule,
    UiModule,
    RouterModule.forRoot(
      [
        { path: '', pathMatch: 'full', redirectTo: '/workspaces' },
        ...appShellRoutes,
        {
          path: '',
          children: workspaceRoutes,
          canActivateChild: [CancelCommandGuard]
        }
      ],
      { paramsInheritanceStrategy: 'always', initialNavigation: 'disabled' }
    )
  ],
  providers: [
    CancelCommandGuard,
    AnalyticsCollector,
    {
      provide: APOLLO_OPTIONS,
      useFactory: initApollo,
      deps: [AnalyticsCollector, Messenger, HttpLink, [new Optional(), BACKEND_PORT]]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry) {
    matIconRegistry.setDefaultFontSetClass('material-icons-extended');
  }
}
