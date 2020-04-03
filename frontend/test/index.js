/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const assert = require('assert')
const puppeteer = require('puppeteer')

const PORT = 3000

describe('Frontend', () => {
    let page;
    let http;

    before(() => {
        http = require('./../lib/server');
    })

    before(async () => {
        const browser = await puppeteer.launch()
        page = await browser.newPage()
    })

    after(() => {
        http.close()
    })

    it('loads the page successfully', async () => {
        const response = await page.goto(`http://localhost:${PORT}`)
        // We expect the page to return the correct status code, making sure the server is running properly
        assert.equal(response.status(), 200)
        const title = await page.title()
        // We expect the page to return the correct title, making sure there isn't another server running on this port
        assert.equal(title, 'AliceO2 Logbook 2020')
    })

    describe('Overview', () => {
        it('can filter logs dynamically', async () => {
            const checkbox = await page.$('.form-check input')
            const label = await page.$('.form-check label div')

            const id = await page.evaluate(element => element.id, checkbox)
            const amount = await page.evaluate(element => element.innerText, label)
            // We expect to have captured the first checkbox in the list
            assert.equal(id, 'filtersCheckbox1')

            await page.click(`#${id}`)
            await page.waitFor(1000)
            const newTableRows = await page.$$('table tr')
            // We expect the amount of logs in this filter to match the advertised amount in the filters component
            assert.equal(true, newTableRows.length - 1 === parseInt(amount.substring(1, amount.length - 1)))
        })
    })
})
