'use strict';

const { getTingkatKehadiran } = require("./serve-data-api/tingkat-kehadiran");
const { getDisiplinKerja } = require("./serve-data-api/disiplin-waktu");
const { getHazardReport } = require("./serve-data-api/hazard-report");
const { getHoursMeter } = require("./serve-data-api/hours-meter");
const { getKeseringanInsiden } = require("./serve-data-api/keseringan-insiden");
const { getProductivityIndividu } = require("./serve-data-api/productivity-individu");
const { getDatabaseKaryawan } = require("./serve-data-api/database-karyawan");
const { getNilaiMorKaryawan } = require("./serve-data-api/nilai-mor");
const { login } = require("./serve-data-api/login");

/**
 * serve-data service
 */

module.exports = () => ({
    getTingkatKehadiranAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.query;

            let result = await getTingkatKehadiran(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: {
                    data: {
                        itemCount: result.itemCount,
                        data: result.data,
                        pageCount: result.pageCount,
                        currentPage: result.currentPage,
                    },
                },
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 500,
                message: error,
            };
            return payload;
        }
    },

    getDisiplinKerjaAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.query;

            let result = await getDisiplinKerja(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: {
                    data: {
                        itemCount: result.itemCount,
                        data: result.data,
                        pageCount: result.pageCount,
                        currentPage: result.currentPage,
                    },
                },
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 500,
                message: error,
            };
            return payload;
        }
    },

    getHazardReportAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.query;

            let result = await getHazardReport(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: {
                    data: {
                        itemCount: result.itemCount,
                        data: result.data,
                        pageCount: result.pageCount,
                        currentPage: result.currentPage,
                    },
                },
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 500,
                message: error,
            };
            return payload;
        }
    },

    getHoursMeterAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.query;

            let result = await getHoursMeter(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: {
                    data: {
                        itemCount: result.itemCount,
                        data: result.data,
                        pageCount: result.pageCount,
                        currentPage: result.currentPage,
                    },
                },
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 500,
                message: error,
            };
            return payload;
        }
    },

    getKeseringanInsidenAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.query;

            let result = await getKeseringanInsiden(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: {
                    data: {
                        itemCount: result.itemCount,
                        data: result.data,
                        pageCount: result.pageCount,
                        currentPage: result.currentPage,
                    },
                },
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 500,
                message: error,
            };
            return payload;
        }
    },

    getProductivityIndividuAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.query;

            let result = await getProductivityIndividu(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: {
                    data: {
                        itemCount: result.itemCount,
                        data: result.data,
                        pageCount: result.pageCount,
                        currentPage: result.currentPage,
                    },
                },
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 500,
                message: error,
            };
            return payload;
        }
    },

    getDatabaseKaryawanAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.query;

            let result = await getDatabaseKaryawan(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: {
                    data: {
                        itemCount: result.itemCount,
                        data: result.data,
                        pageCount: result.pageCount,
                        currentPage: result.currentPage,
                    },
                },
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 500,
                message: error,
            };
            return payload;
        }
    },

    getNilaiMorKaryawanAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.query;

            let result = await getNilaiMorKaryawan(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: result
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 500,
                message: error,
            };
            return payload;
        }
    },

    loginAPI: async (req) => {
        try {
            let authentication = req.headers.authorization;
            let searchComponent = req.body;

            let result = await login(
                searchComponent,
                authentication
            );

            let payload = {
                status: 200,
                message: "OK",
                data: result
            };

            return payload;
        } catch (error) {
            console.log(error);
            let payload = {
                status: 403,
                message: error,
            };
            return payload;
        }
    },

    getDatabaseKaryawan
});
