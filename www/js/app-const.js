// @flow
/* global window, IS_PRODUCTION */

const {hostname, origin} = window.location;

const appConst = {
    api: {
        // eslint-disable-next-line id-match
        url: IS_PRODUCTION ? origin : 'http://my-best-site.com'
    }
};

export default appConst;
