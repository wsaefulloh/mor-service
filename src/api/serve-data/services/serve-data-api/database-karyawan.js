"use strict";
const { getPagination, getPagingData } = require("../../../../../helpers/paging");
const jwt = require("jsonwebtoken");

module.exports = {
    getDatabaseKaryawan: async (searchComponent, authentication) => {
        try {
            let {
                page,
                size,
                search_name,
            } = searchComponent;

            if (search_name) {
                search_name = search_name.replace(/\s+/g, " ");
            }

            let whereQuery = "";
            // let user_id_requested = 0;

            // //Checking User ID yang sedang login
            // if (authentication && authentication.startsWith("Bearer")) {
            //     let access_token = authentication.split(" ")[1];
            //     const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
            //     user_id_requested = decoded.id;
            // }

            const { limit, offset } = getPagination(page, size);
            let limitOffset = `LIMIT :limit OFFSET :offset`;
            if (!page || !size) {
                limitOffset = ``;
            }

            //Filter Text Search
            if (!search_name) {
                whereQuery = whereQuery + "";
            } else {
                whereQuery =
                    whereQuery +
                    ` (
                    a.name LIKE :searchText OR
                    a.nrp LIKE :searchText
                )`;
            }

            let query = `
            select * from (
                select uu.name, uu.nrp, uu.email, uu.password_mor from up_users uu
                left join up_users_role_mor_links uurml on uurml.user_id = uu.id 
                left join role_mors rm on rm.id = uurml.role_mor_id 
                where rm.id = 2  ) a
            `

            let result;
            let total;
            if (whereQuery.length != 0) {
                result = await strapi.db.connection.context.raw(
                    `${query} WHERE ${whereQuery} ORDER BY a.name ASC ${limitOffset}`,
                    {
                        limit: Number(limit),
                        offset: Number(offset),
                        searchText: `%${search_name}%`,
                    }
                );
                total = await strapi.db.connection.context.raw(
                    `SELECT COUNT(*) as total from (${query} WHERE ${whereQuery} ORDER BY a.name ASC) b`,
                    {
                        limit: Number(limit),
                        offset: Number(offset),
                        searchText: `%${search_name}%`,
                    }
                );
            } else {
                result = await strapi.db.connection.context.raw(
                    `${query} ORDER BY a.name ASC ${limitOffset}`,
                    {
                        limit: Number(limit),
                        offset: Number(offset),
                        searchText: `%${search_name}%`,
                    }
                );
                total = await strapi.db.connection.context.raw(
                    `SELECT COUNT(*) as total from (${query} ORDER BY a.name ASC) b`,
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
