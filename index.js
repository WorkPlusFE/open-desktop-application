'use strict';

import protocolDetection from 'custom-protocol-detection';
import invariant from 'invariant';
import { stringify } from '@w6s/query-string';
import isString from 'lodash.isstring';
import isFunction from 'lodash.isstring';
import isObject from 'lodash.isobject';

/**
 * open-desktop-application
 *
 * @param object { protocol, action, query, fail, success }
 * 
 * protocol: string (eg, workplus)
 * action: string (eg, joinchat)
 * query: object (eg, { id: 1, name: 'test' })
 * fail: function
 * success: function
 *  
 * return => workplus://joinchat/?id=1&name=test
 */
function openDesktopApplication(params) {
    try {
        const { protocol, action, query, fail, success } = params;
        invariant(isString(protocol), '[protocol] Must be a non-empty string');
        invariant(isString(action), '[action] Must be a non-empty string');
        
        let openUri = `${protocol}://${action}`;
        if (isObject(query)) {
            openUri += `?${stringify(query)}`;
        }
        protocolDetection(
            openUri, 
            function failCb(e) {
                isFunction(fail) && fail(e);
            },
            function successCb() {
                isFunction(success) && success();
            },
            function unsupportedCb() {
                isFunction(fail) && fail({ supported: false });
            }
        );
    } catch (error) {
        console.log(error);
    }
}

export default openDesktopApplication;
