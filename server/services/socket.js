const axios = require('axios');

const sendEvent = async(data) => {
    try {
        const res = await axios.post(`${process.env.SOCKET_HOST}/socket`, {
            domain: process.env.APP_DOMAIN,
            subdomain: process.env.APP_SUBDOMAIN,
            data
        });
        console.log('sendEvent', res.data);
    } catch (err) {
        console.error('sendEvent', err.message);
    }
}

module.exports = {
    sendEvent
};