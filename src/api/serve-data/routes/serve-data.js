module.exports = {
  routes: [
    {
      method: "GET",
      path: "/serve-data/tingkat-kehadiran",
      handler: "serve-data.getTingkatKehadiranCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/serve-data/disiplin-kerja",
      handler: "serve-data.getDisiplinKerjaCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/serve-data/hazard-report",
      handler: "serve-data.getHazardReportCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/serve-data/hours-meter",
      handler: "serve-data.getHoursMeterCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/serve-data/keseringan-insiden",
      handler: "serve-data.getKeseringanInsidenCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/serve-data/productivity-individu",
      handler: "serve-data.getProductivityIndividuCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/serve-data/database-user",
      handler: "serve-data.getDatabaseKaryawanCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/serve-data/nilai-mor",
      handler: "serve-data.getNilaiMorKaryawanCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/serve-data/login",
      handler: "serve-data.loginServiceCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/serve-data/import",
      handler: "serve-data.importDataMorCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/serve-data/status-import",
      handler: "serve-data.getStatusImportCtr",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
