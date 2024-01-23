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

const { ScheduledProcessesManager } = require('../../../../lib/server/services/ScheduledProcessesManager.js');
const { fake } = require('sinon');
const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;

module.exports = () => {
    let clock;

    before(() => {
        clock = sinon.useFakeTimers();
    });

    after(() => {
        clock.restore();
    });

    it('should successfully execute the scheduled process now (and only now) with no parameters', () => {
        const scheduledProcessesManager = new ScheduledProcessesManager();
        const process = fake();
        scheduledProcessesManager.schedule(process);
        expect(process.calledOnce).to.be.true;
        clock.tick(10000);
        expect(process.calledOnce).to.be.true;
    });

    it('should successfully execute the scheduled process once at the given time', () => {
        const scheduledProcessesManager = new ScheduledProcessesManager();
        const process = fake();
        scheduledProcessesManager.schedule(process, { wait: 1000 });
        expect(process.calledOnce).to.be.false;
        clock.tick(1000);
        expect(process.calledOnce).to.be.true;
        clock.tick(1001);
        expect(process.calledOnce).to.be.true;
        clock.tick(10000);
        expect(process.calledOnce).to.be.true;
    });

    it('should successfully execute the scheduled process now and regularly', () => {
        const scheduledProcessesManager = new ScheduledProcessesManager();
        const process = fake();
        scheduledProcessesManager.schedule(process, { every: 1000 });
        expect(process.calledOnce).to.be.true;
        clock.tick(999);
        expect(process.calledOnce).to.be.true;
        clock.tick(10000);
        expect(process.callCount).to.equal(11);
    });

    it('should successfully execute the scheduled process regularly starting at the given time', () => {
        const scheduledProcessesManager = new ScheduledProcessesManager();
        const process = fake();
        scheduledProcessesManager.schedule(process, { every: 1000, wait: 500 });
        expect(process.calledOnce).to.be.false;
        clock.tick(499);
        expect(process.calledOnce).to.be.false;
        clock.tick(500);
        expect(process.calledOnce).to.be.true;
        clock.tick(10500);
        expect(process.callCount).to.equal(11);
    });
};
