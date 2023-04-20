const { app, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');
const contextMenu = require('electron-context-menu');

const server = express();

// Serve the Next.js files
server.use(express.static(path.join(__dirname, 'public')));

let mainWindow;

contextMenu({
  prepend: (params, browserWindow) => [
    {
      label: 'Inspect element',
      click() {
        // Open the Developer Tools and focus on the 'Elements' tab
        browserWindow.webContents.inspectElement(params.x, params.y);
      }
    }
  ]
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true
    }
  });

  mainWindow.loadURL('http://localhost:3000');

  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', function () {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// Start the server
server.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});

// // main.js
// const { app, BrowserWindow } = require('electron');
// const path = require('path');
// const url = require('url');

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true
//     }
//   });

//   mainWindow.loadURL(
//     url.format({
//       pathname: path.join(__dirname, 'public', '[[...componentName]].html'),
//       protocol: 'file:',
//       slashes: true
//     })
//   );

//   mainWindow.on('closed', function () {
//     mainWindow = null;
//   });
// }

// app.on('ready', createWindow);
