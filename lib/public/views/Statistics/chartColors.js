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

export const ChartColors = {
    Blue: {
        dark: '#4285f4',
        light: '#c6dafc',
    },
    Red: {
        dark: '#ea4335',
        light: '#f9c6c2',
    },
    SeaGreen: {
        dark: '#20B2AA',
    },
    Coral: {
        dark: '#FF7F50',
    },
    Gray: {
        dark: '#808080',
    },
    RedBrown: {
        dark: '#A52A2A',
    },
    Green: {
        dark: '#006400',
    },
    Magenta: {
        dark: '#8B008B',
    },
    Orange: {
        dark: '#FFA500',
    },
    Orchid: {
        dark: '#9932CC',
    },
    Black: {
        dark: '#000000',
    },
    LightSeaGreen: {
        dark: '#20B2AA',
    },
    Olive: {
        dark: '#808000',
    },
    VioletRed: {
        dark: '#DB7093',
    },
    Teal: {
        dark: '#008080',
    },
    Sienna: {
        dark: '#A0522D',
    },
    SteelBlue: {
        dark: '#4682B4',
    },
};

export const ChartDarkColors = Object.values(ChartColors).map(({ dark }) => dark).filter((color) => color);
