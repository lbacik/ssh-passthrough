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

      session.on('exec', (accept, reject, info) => {
        console.log('exec - not implemented yet!');
      });

      session.on('shell', (accept, reject) => {
        console.log('shell!');

        const channel = accept();
        channel.write('starting shell...\n\r');

        const passthrough = passThroughFactory(this.options.target);
        passthrough.options(this.options);
        passthrough.init();

        passthrough.setClientChannel(channel, this.userStr);

        channel.on('data', (data) => {
          passthrough.passData(data);
        });

        channel.on('error', (e) => {
          console.log(`channel error ${e}`);
        });

        channel.on('end', () => {
          console.log('channel end...');
        });
      });

      session.on('signal', (accept, reject, info) => {
        console.log(`session signal: ${info.name}`);
      });
    });
  }).on('end', () => {
    console.log('Client disconnected');
  });
}

module.exports = connectionRequest;
