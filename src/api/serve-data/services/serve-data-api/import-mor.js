"use strict";
const { getPagination, getPagingData } = require("../../../../../helpers/paging");
const readXlsxFile = require("read-excel-file/node");
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator')
const fs = require('fs');
const path = require("path");
const { decodeToken } = require("../../../../../helpers/decode-token");

module.exports = {
    importMor: async (searchComponent, authentication) => {
        try {
            let {
                month,
                year,
                name_file,
            } = searchComponent;

            let id_user = decodeToken(authentication)

            await strapi.db.connection.context.raw(
                `INSERT INTO status_imports (nama_file, bulan, tahun, status, created_by_id_user) VALUES (:nama_file, :bulan, :tahun, "Pending", :created_by_id_user)`, {
                nama_file: `${name_file}`,
                bulan: `${month}`,
                tahun: `${year}`,
                created_by_id_user: `${id_user}`
            }
            );

        } catch (error) {
            throw error;
        }
    },
};
