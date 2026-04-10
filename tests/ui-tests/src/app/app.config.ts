import {type ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {TestMenuCheckboxRadioFixture} from './fixtures/menu/menu-checkbox-radio-fixture';
import {TestMenuDisableFixture} from './fixtures/menu/menu-disable-fixture';
import {TestMenuNestedFixture} from './fixtures/menu/menu-nested-fixture';
import {TestMenuSimpleFixture} from './fixtures/menu/menu-simple-fixture';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter([
      {
        path: 'menu',
        component: TestMenuSimpleFixture,
      },
      {
        path: 'menu-disable',
        component: TestMenuDisableFixture,
      },
      {
        path: 'menu-nested',
        component: TestMenuNestedFixture,
      },
      {
        path: 'menu-checkbox-radio',
        component: TestMenuCheckboxRadioFixture,
      },
    ]),
  ],
};
