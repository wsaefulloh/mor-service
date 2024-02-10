'use strict';

/**
 * A set of functions called "actions" for `serve-data`
 */

module.exports = {
  getTingkatKehadiranCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .getTingkatKehadiranAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },
  getDisiplinKerjaCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .getDisiplinKerjaAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },
  getHazardReportCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .getHazardReportAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },
  getHoursMeterCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .getHoursMeterAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },
  getKeseringanInsidenCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .getKeseringanInsidenAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },
  getProductivityIndividuCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .getProductivityIndividuAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },
  getDatabaseKaryawanCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .getDatabaseKaryawanAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },

  getNilaiMorKaryawanCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .getNilaiMorKaryawanAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },

  loginServiceCtr: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::serve-data.serve-data")
        .loginAPI(ctx.request);
      ctx.response.status = data.status;
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Location Name controller error", { moreDetails: err });
    }
  },


};
