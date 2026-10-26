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

const { expect } = require('chai');

let formatLogSnippet;

module.exports = () => {
    before(async () => {
        ({ formatLogSnippet } = await import('../../../../../lib/public/utilities/formatting/formatLogSnippet.js'));
    });

    it('should return an empty string for missing or blank content', () => {
        expect(formatLogSnippet(null)).to.equal('');
        expect(formatLogSnippet(undefined)).to.equal('');
        expect(formatLogSnippet('  \n \n')).to.equal('');
    });

    it('should strip markdown syntax', () => {
        expect(formatLogSnippet('# Heading\n**bold** and _italic_ with `code`')).to.equal('Heading bold and italic with code');
        expect(formatLogSnippet('See [the run](http://x.cern/run/1) ![img](http://x.cern/i.png)')).to.equal('See the run img');
        expect(formatLogSnippet('- first\n- second\n1. third')).to.equal('first second third');
    });

    it('should keep identifiers containing underscores or asterisks untouched', () => {
        expect(formatLogSnippet('Failed pass LHC22b_apass1')).to.equal('Failed pass LHC22b_apass1');
        expect(formatLogSnippet('Set RUN_NUMBER and OTHER_VAR_NAME')).to.equal('Set RUN_NUMBER and OTHER_VAR_NAME');
        expect(formatLogSnippet('rate is 2 * 3 and a_b_c')).to.equal('rate is 2 * 3 and a_b_c');
    });

    it('should keep the content of inline code spans as is', () => {
        expect(formatLogSnippet('Failed to open `TPC_raw_data.root`')).to.equal('Failed to open TPC_raw_data.root');
        expect(formatLogSnippet('Run `o2-sim --run RUN_NUMBER` now')).to.equal('Run o2-sim --run RUN_NUMBER now');
        expect(formatLogSnippet('`**not bold** and _not italic_`')).to.equal('**not bold** and _not italic_');
    });

    it('should still strip emphasis delimiters around words', () => {
        expect(formatLogSnippet('__strong__ *em* ~~gone~~ _it_ and **LHC22b_apass1**')).to.equal('strong em gone it and LHC22b_apass1');
    });

    it('should keep the content of code fences without the fences', () => {
        expect(formatLogSnippet('```\nls -la\n```\nDone')).to.equal('ls -la Done');
    });

    it('should skip a first line identical to the title', () => {
        expect(formatLogSnippet('Run 1 failed\nDetector crashed', 'run 1 FAILED')).to.equal('Detector crashed');
        expect(formatLogSnippet('Run 1 failed', 'Run 1 failed')).to.equal('');
        expect(formatLogSnippet('Other\nRun 1 failed', 'Run 1 failed')).to.equal('Other Run 1 failed');
    });

    it('should truncate on a word boundary with an ellipsis', () => {
        const snippet = formatLogSnippet('word '.repeat(50), '', 20);
        expect(snippet).to.equal('word word word…');
        expect(formatLogSnippet('short text', '', 20)).to.equal('short text');
    });
};
