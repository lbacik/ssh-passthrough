//
// Copyright (C) 2015 Lukasz Bacik <mail@luka.sh>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.

const passThroughFactory = require('./passthrough/factory');

function connectionRequest(client) {
  console.log('Client connected!');

  client.on('authentication', (ctx) => {
    this.userStr = ctx.username;
    ctx.accept();
  }).on('ready', () => {
    client.on('session', (accept, reject) => {
      const session = accept();

      session.on('pty', (accept, reject, info) => {
        accept();
        this.termInfo = info;
      });

      session.on('window-change', (accept, reject, info) => {
        passthrough.resizeTerm(info);
      });

      session.once('exec', (accept, reject, info) => {
        const channel = accept();
        passthrough = createPassthrough(
          this.options, 
          this.termInfo,
          channel,
          this.userStr
        );
        passthrough.executeCommand(channel, info.command);
        execute(channel, passthrough)
      });

      session.on('shell', (accept, reject) => {
        const channel = accept();
        passthrough = createPassthrough(
          this.options, 
          this.termInfo,
          channel,
          this.userStr
        );        
        passthrough.executeShell(channel);  
        execute(channel, passthrough)  
      });

      session.on('signal', (accept, reject, info) => {
        console.log(`session signal: ${info.name}`);
      });
    });
  }).on('end', () => {
    console.log('Client disconnected');
  });
}

function execute(channel, passthrough) {  
  channel.on('data', (data) => {
    passthrough.passData(data);
  });

  channel.on('error', (e) => {
    console.log(`channel error ${e}`);
  });

  channel.on('end', () => {
    console.log('channel end...');
  });
}

function createPassthrough(options, termInfo, channel, userStr) {
  const passthrough = passThroughFactory(options.target);
  options.termInfo = termInfo;
  passthrough.options(options);
  passthrough.init();
  passthrough.setClientChannel(channel, userStr);
  return passthrough;
}

module.exports = connectionRequest;
