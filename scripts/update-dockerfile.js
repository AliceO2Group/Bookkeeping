/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { spawn } = require('node:child_process');
const fs = require('fs');
const path = require('path');

const DOCKERFILE_SRC = path.join(__dirname, '..', 'Dockerfile');

// eslint-disable-next-line no-console
const { log } = console;

/**
 * Fetch the latest version of a given package
 *
 * @param {string} pkg the package for which version should be fetched
 * @return {Promise<string>} resolves with the version
 */
const getPkgVersion = (pkg) => new Promise((resolve, reject) => {
    const process = spawn(
        'docker',
        ['run', 'alpine:3.18', 'apk', 'info', '--no-cache', pkg],
    );

    // The version we received from docker
    let version;

    process.stdout.on('data', (bufferedData) => {
        if (version !== undefined) {
            reject(new Error(`Several output lines received from ${pkg}`));
        }
        const data = `${bufferedData}`;
        const [, parsedVersion] = new RegExp(`${pkg}-(.*) description:\n?`).exec(data) ?? [];
        if (parsedVersion) {
            version = parsedVersion;
        }
    });

    process.stderr.on('data', (data) => {
        reject(new Error(`Get version for ${pkg} stderr: ${data}`));
    });

    process.stdout.on('close', (code) => {
        if (code) {
            reject(new Error(`An error occurred when fetching version of ${pkg}`));
        }

        if (version === undefined) {
            reject(new Error(`No version found for ${pkg}`));
        }

        resolve(version);
    });
});

// Read the docker file to extract pkg dependencies
const dockerFileLines = fs.readFileSync(DOCKERFILE_SRC).toString().split('\n');

let inBlockToUpdate = false;

// Map that will store all the text tokens that need to be replaced
const replaceTokens = new Map();

(async () => Promise.all(dockerFileLines.map(async (_, lineIndex) => {
    const line = dockerFileLines[lineIndex];

    // All the packages to update are continuous and start with RUN apk add command
    inBlockToUpdate = Boolean(RegExp(/^RUN apk add --no-cache/).exec(line) || inBlockToUpdate);

    if (inBlockToUpdate) {
        const matches = line.matchAll(/([^= ]*)=([^= ]*)/g);

        /*
         * Index provided by the regex match is from the original line, but we need to consider that the replacement versions may not have
         * the same size and adapt index if there is several dependencies on one line
         */
        let offset = 0;

        for (const match of matches) {
            const [full, pkg, currentVersion] = match;
            const { index: matchIndex } = match;
            log(`Fetching newer version for ${pkg}`);
            const newVersion = await getPkgVersion(pkg);

            if (newVersion === currentVersion) {
                log(`Version ${currentVersion} is already the last for ${pkg}`);
                continue;
            }
            log(`Updating from ${currentVersion} to ${newVersion}`);

            const replaceToken = replaceTokens.get(lineIndex) ?? [];
            if (replaceToken.length === 0) {
                replaceTokens.set(lineIndex, replaceToken);
            }

            const replacement = `${pkg}=${newVersion}`;

            replaceToken.push({
                start: matchIndex + offset,
                end: matchIndex + offset + full.length,
                replacement,
            });

            // Adapt the offset
            offset += replacement.length - full.length;
        }

        // If we have newline without backslash, we are not in the apk add command
        inBlockToUpdate = line.endsWith('\\');
    }
})))().then(
    () => {
        const recomposedDockerfile = dockerFileLines.map((line, lineIndex) => {
            const replaceToken = replaceTokens.get(lineIndex);
            if (replaceToken) {
                let updatedLine = line;
                for (const { start, end, replacement } of replaceToken) {
                    updatedLine = `${updatedLine.substring(0, start)}${replacement}${updatedLine.substring(end)}`;
                }
                return updatedLine;
            }
            return line;
        }).join('\n');
        fs.writeFileSync(DOCKERFILE_SRC, recomposedDockerfile);
    },
    () => {
        log('An error occurred');
    },
);
