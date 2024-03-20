/* eslint-disable require-jsdoc */

const { webUiServer } = await import('./server');

const server = webUiServer;
const { app } = server.http;

export const viteNodeApp = app;
