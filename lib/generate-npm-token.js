#!/usr/bin/env node

const url = require('url');

const _ = require('lodash');
const { promisify } = require('bluebird');
const inquirer = require('inquirer');
const npm = require('npm');
const RegClient = require('npm-registry-client');
const validator = require('validator');

(async () => {
  await promisify(npm.load.bind(npm))({ progress: false });
  const npmConfig = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'What is your npm username?',
      validate: _.ary(_.bind(validator.isLength, null, _, 1), 1),
    },
    {
      type: 'password',
      name: 'password',
      message: 'What is your npm password?',
      validate: _.ary(_.bind(validator.isLength, null, _, 1), 1),
    },
  ]);
  const client = new RegClient({
    log: {
      info() {},
      verbose() {},
      http() {},
    },
  });

  const body = {
    _id: `org.couchdb.user:${npmConfig.username}`,
    name: npmConfig.username,
    password: npmConfig.password,
    type: 'user',
    roles: [],
    date: new Date().toISOString(),
  };

  const uri = url.resolve(
    'https://registry.npmjs.org/',
    `-/user/org.couchdb.user:${encodeURIComponent(npmConfig.username)}`
  );
  try {
    const { token } = await promisify(client.request.bind(client, uri))({
      method: 'PUT',
      body,
    });
    console.log(token);
  } catch (err) {
    console.error('npm authentication failed');
  }
})();
