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

const Passthrough = require('../passthrough');
const exec = require('child_process').exec;

// it is only a placeholder for the time being
class Shell extends Passthrough {
  constructor() {
    super();
    this.buffor = '';
  }

  passData(data) {
    console.log(data.toString('hex'));

    if (data.toString('hex') === '0d') {
      console.log(this.buffor);
      exec(this.buffor, function (error, stdout, stderr) {
        console.log(`command stdout: ${stdout}`);
        console.log(`command stderr: ${stderr}`);

        this.clientStream.write(stdout);
        this.clientStream.write('\n\r');

        this.buffor = '';
      });
    }

    this.buffor = this.buffor + data.toString();
  }
}

module.exports = Shell;
