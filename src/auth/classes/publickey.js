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

const fs = require('fs')
const ssh2Streams = require('ssh2-streams')
const crypto = require('crypto')
const buffersEqual = require('buffer-equal-constant-time')

class PublicKey {

  constructor(authorizedKeys) {
    this.authorizedKeys = authorizedKeys
  }

  auth(context, overrideValues) {
    let result = false
    const keys = PublicKey.readKeyFile(this.authorizedKeys)
    for (let i = 0, len = keys.length; i < len; i += 1) {
      if (keys[i].length > 0) {
        const pubKey = PublicKey.getPubKey(keys[i])
        if (pubKey
            && context.key.algo === pubKey.fulltype
            && PublicKey.compareBuffers(context.key.data, pubKey.public)) {
          if (context.signature) {
            result = PublicKey.verifySignature(context, pubKey)
          } else {
            result = true
          }
          break
        }
      }
    }
    return result
  }

  static readKeyFile(filePath) {
    let keys = []
    try {
      keys = fs.readFileSync(filePath).toString().split('\n')
    } catch (e) {
      PublicKey.error = e
    }
    return keys
  }

  static getPubKey(keyStr) {
    let pubKey = null
    try {
      const parsedKey = ssh2Streams.utils.parseKey(keyStr)
      pubKey = ssh2Streams.utils.genPublicKey(parsedKey)
    } catch (e) {
      PublicKey.error = e
    }
    return pubKey
  }

  static verifySignature(context, pubKey) {
    let result = false
    try {
      const verifier = crypto.createVerify(context.sigAlgo)
      verifier.update(context.blob)
      if (verifier.verify(pubKey.publicOrig, context.signature)) {
        result = true
      }
    } catch (e) {
      PublicKey.error = e
    }
    return result
  }

  static compareBuffers(buffer1, buffer2) {
    return buffersEqual(buffer1, buffer2)
  }
}

module.exports = PublicKey
