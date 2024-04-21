"use strict";
const { getPagination, getPagingData } = require("../../../../../helpers/paging");
const jwt = require("jsonwebtoken");

module.exports = {
    getStatusImport: async (searchComponent, authentication) => {
        try {
            let {
                page,
                size,
                search_name,
            } = searchComponent;

            if (search_name) {
                search_name = search_name.replace(/\s+/g, " ");
            }

            let whereQueryFirst = "";
            let whereQuerySecond = "";
            // let user_id_requested = 0;

            // //Checking User ID yang sedang login
            // if (authentication && authentication.startsWith("Bearer")) {
            //     let access_token = authentication.split(" ")[1];
            //     const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
            //     user_id_favorites = decoded.id;
            // }

            const { limit, offset } = getPagination(page, size);
            let limitOffset = `LIMIT :limit OFFSET :offset`;
            if (!page || !size) {
                limitOffset = ``;
            }

            //Filter Text Search
            if (!search_name) {
                whereQueryFirst = whereQueryFirst + "";
            } else {
                whereQueryFirst =
                    whereQueryFirst +
                    ` (
                    a.nama_file LIKE :searchText OR
                    a.bulan LIKE :searchText
                    a.tahun LIKE :searchText
                )`;
            }

            let query = `
            select * from ( select si.id, si.nama_file, si.bulan, si.tahun, si.status, si.created_by_id_user from status_imports si ) a 
            `

            let result;
            let total;
            if (whereQueryFirst.length != 0) {
                result = await strapi.db.connection.context.raw(
                    `${query} WHERE ${whereQueryFirst} ORDER BY a.id DESC ${limitOffset}`,
                    {
                        limit: Number(limit),
                        offset: Number(offset),
                        searchText: `%${search_name}%`,
                    }
                );
                total = await strapi.db.connection.context.raw(
                    `SELECT COUNT(*) as total from (${query} WHERE ${whereQueryFirst} ORDER BY a.id DESC) b`,
                    {
                        limit: Number(limit),
                        offset: Number(offset),
                        searchText: `%${search_name}%`,
                    }
                );
            } else {
                result = await strapi.db.connection.context.raw(
                    `${query} ORDER BY a.id DESC ${limitOffset}`,
                    {
                        limit: Number(limit),
                        offset: Number(offset),
                        searchText: `%${search_name}%`,
                    }
                );
                total = await strapi.db.connection.context.raw(
                    `SELECT COUNT(*) as total from (${query} ORDER BY a.id DESC) b`,
                    {
                        limit: Number(limit),
                        offset: Number(offset),
                        searchText: `%${search_name}%`,
                    }
                );
            }

            let checkData = {
                rows: result[0],
                count: Number(total[0][0].total),
            };

            const data = getPagingData(checkData, page, limit);

            return data;
        } catch (error) {
            throw error;
        }
    },
};
