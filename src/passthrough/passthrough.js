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

class Passthrough {
  passData(data) {
    console.log(`Passthrough data: (${data.toString('hex')}) ${data.toString()}`);
    this.clientStream.write(data.toString());
  }

  setClientChannel(channel, data) {
    this.clientStream = channel;
  }

  options(data) {}

  init() {}
}

module.exports = Passthrough;
