require('zone.js/dist/zone-node');
const {
  AppServerModuleNgFactory
} = require('../../dist/apps/angular-console-server/main');
const { renderModuleFactory } = require('@angular/platform-server');
const fs = require('fs');
const path = require('path');

(async () => {
  let html = await renderModuleFactory(AppServerModuleNgFactory, {
    document: fs.readFileSync(path.join(__dirname, '../../dist/apps/angular-console/index.html')),
    url: '/_app-shell'
  });
  html = html.replace('<base href="/">', '').replace(/<script.*<\/script>/g, '');
  fs.writeFileSync(
    path.join(__dirname, '../../dist/apps/angular-console/splash-screen.html'),
    html
  );
  console.log('Generated Splash Screen');
})();
