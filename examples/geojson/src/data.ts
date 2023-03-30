import { FeatureCollection } from 'geojson';

export const simpleFeatures: FeatureCollection = {
    type: 'FeatureCollection',
    features: [ {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Point',
            coordinates: [ -77.35891827299356, 38.958433649794124 ],
        },
    }, {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Polygon',
            coordinates: [ [
                [ -77.36298667802035, 38.960376973353675 ],
                [ -77.35459348700716, 38.96004084970365 ],
                [ -77.35506177663451, 38.95741482879896 ],
                [ -77.36276153877644, 38.95722575153806 ],
            ] ],
        },
    } ],
};

export const antimeridianFeatures: FeatureCollection = {
    type: 'FeatureCollection',
    features: [ {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'MultiPoint',
            coordinates: [
                [ -179.8, -20 ],
                [ -179.9, -20.7 ],
                [ -180.0, -20.2 ],
                [ -180.1, -20.9 ],
                [ -180.2, -20.5 ],
            ],
        },
    }, {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: [
                [ -179.8, -20 ],
                [ -179.9, -20.7 ],
                [ -180.0, -20.2 ],
                [ -180.1, -20.9 ],
                [ -180.2, -20.5 ],
            ],
        },
    }, {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'MultiLineString',
            coordinates: [ [
                [ +172, +28 ],
                [ -172, +28 ],
                [ -172, +12 ],
                [ +172, +12 ],
                [ +172, +20.5 ],
                [ -175, +20.5 ],
            ], [
                [ +172, +27 ],
                [ -173, +27 ],
                [ -173, +13 ],
                [ +173, +13 ],
                [ +173, +19.5 ],
                [ -175, +19.5 ],
            ] ],
        },
    }, {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'MultiPolygon',
            coordinates: [ [
                [ [+170,+30], [-170,+30], [-170,+10], [+170,+10] ],
                [ [+175,+25], [-175,+25], [-175,+22], [+175,+22] ],
                [ [+175,+18], [-175,+18], [-175,+15], [+175,+15] ],
            ], [
                [ [+170,-10], [-170,-10], [-170,-30], [+170,-30] ],
                [ [+175,-15], [+178,-15], [+178,-25], [+175,-25] ],
                [ [-175,-15], [-178,-15], [-178,-25], [-175,-25] ],
            ] ],
        },
    } ],
};

export const polarFeatures: FeatureCollection = {
    type: 'FeatureCollection',
    features: [ {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Polygon',
            coordinates: [
                [ [+45,+70], [+70,+70], [-45,+75], [-40,+80], [+90,+70], [+135,+70], [+225,+70], [+315,+70] ],
            ],
        },
    }, {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: [
                [-45,+60], [+45,+60], [+135,+60], [+225,+60], [+315,+60],
            ],
        },
    }, {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Polygon',
            coordinates: [
                [ [0,-70], [-90,-70], [-180,-70], [-270,-70] ],
                [ [0,-75], [-90,-75], [-180,-75], [-270,-75] ],
            ],
        },
    } ],
};
