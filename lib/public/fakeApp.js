/* eslint-disable */
import { h, Observable } from '/js/src/index.js';

export class Model extends Observable{
    constructor() {
        super();
        this.runsOverview = new RunsOverviewModel();
        this.environmentDetails = new EnvironmentDetailsModel();
    }
}

export class RunsOverviewModel {
    constructor() {
        // Fake runs list
        this._runs = [1, 2, 3];
        this.runsTableModel = new RunsTableModel(this._runs);
    }
}

export class EnvironmentDetailsModel {
    constructor() {
        this._environment = {
            runs: [5, 6, 7],
        };
        this.runsTableModel = new RunsTableModel(this._environment.runs);
    }
}

export class RunsTableModel {
    /**
     * Dummy runs table model, runs are simply numbers...
     * @param {number[]} runs
     */
    constructor(runs) {
        this.runs = runs;
    }
}

/**
 * @param {Model} model
 */
export const View = (model) => {
    return RunsOverviewPage(model);
    // return EnvironmentDetailsPage(model);
}

/**
 * @param {Model} model
 */
export const RunsOverviewPage = (model) => {
    // Works fine with not reusable runs table, because it uses the right model
    return h('', [
        h('h1'),
        NotReusableRunsTable(model),
        // ReusableRunsTable(model.runsOverview.runsTableModel),
    ]);
};

/**
 * @param {Model} model
 */
export const EnvironmentDetailsPage = (model) => {
    // Will not work at all: not reusable component will use the runs overview component!
    return h('', [
        h('h1'),
        NotReusableRunsTable(model),
        // ReusableRunsTable(model.environmentDetails.runsTableModel),
    ]);
};

/**
 * @param {Model} model
 */
export const NotReusableRunsTable = (model) => {
    // Hard coded extraction of runs table model from model. This will ALWAYS use the runs overview model
    const runs = model.runsOverview.runsTableModel.runs;
    return h('', h('ul', runs.map((run) => h('li', { key: run }, run))));
};

/**
 * @param {RunsTableModel} model
 */
export const ReusableRunsTable = (runsTableModel) => {
    // Has no expectations about where runsTableModel comes from
    const runs = runsTableModel.runs;
    return h('', h('ul', runs.map((run) => h('li', { key: run }, run))));
};
