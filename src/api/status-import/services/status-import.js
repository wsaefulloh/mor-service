'use strict';

/**
 * status-import service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::status-import.status-import');
