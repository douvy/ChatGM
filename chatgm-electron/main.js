const { app, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');

const server = express();

// Serve the Next.js files
server.use(express.static(path.join(__dirname, 'public')));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL('http://localhost:3000');

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
