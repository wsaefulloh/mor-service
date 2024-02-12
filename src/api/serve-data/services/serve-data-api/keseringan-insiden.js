"use strict";
const { getPagination, getPagingData } = require("../../../../../helpers/paging");
const jwt = require("jsonwebtoken");

module.exports = {
    getKeseringanInsiden: async (searchComponent, authentication) => {
        try {
            let {
                page,
                size,
                month,
                year,
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
                    a.name LIKE :searchText OR
                    a.nrp LIKE :searchText
                )`;
            }

            //Filter Month
            if (whereQuerySecond.length != 0) {
                if (month) {
                    whereQuerySecond =
                        whereQuerySecond +
                        ` AND (a.bulan = '${month}')`;
                }
            } else {
                if (month) {
                    whereQuerySecond =
                        whereQuerySecond +
                        ` (a.bulan = '${month}')`;
                }
            }

            //Filter Year
            if (whereQuerySecond.length != 0) {
                if (month) {
                    whereQuerySecond =
                        whereQuerySecond +
                        ` AND (a.tahun = '${year}')`;
                }
            } else {
                if (month) {
                    whereQuerySecond =
                        whereQuerySecond +
                        ` (a.tahun = '${year}')`;
                }
            }

            let query = `
            select * from (
            select uu.id as user_id, uu.name, uu.nrp, uu.jabatan,
            uu.versatility, uu.grade from up_users uu
            left join up_users_role_mor_links uurml on uurml.user_id = uu.id 
            left join role_mors rm on rm.id = uurml.role_mor_id 
            where rm.id = 2 ) a
            `

            let result;
            let total;
            if (whereQueryFirst.length != 0) {
                result = await strapi.db.connection.context.raw(
                    `${query} WHERE ${whereQueryFirst} ORDER BY a.name ASC ${limitOffset}`,
                    {
                        limit: Number(limit),
                        offset: Number(offset),
                        searchText: `%${search_name}%`,
                    }
                );
                total = await strapi.db.connection.context.raw(
                    `SELECT COUNT(*) as total from (${query} WHERE ${whereQueryFirst} ORDER BY a.name ASC) b`,
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

            let resultWithTingkatKehadiran = []
            let arrayResult = result[0]

            for (let i = 0; i < arrayResult.length; i++) {
                let e = arrayResult[i];

                let newResult

                let tingkatKehadiranQuery =
                    `
                    select * from (select uu.id as user_id, tk.id as keseringan_insiden_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun from keseringan_insidens tk 
                        left join keseringan_insidens_user_name_links tkunl on tkunl.keseringan_insiden_id = tk.id 
                        left join up_users uu on uu.id = tkunl.user_id 
                        where uu.id = ${e.user_id}) a
                    `

                if (whereQuerySecond.length != 0) {
                    newResult = await strapi.db.connection.context.raw(
                        `${tingkatKehadiranQuery} WHERE ${whereQuerySecond}`
                    );
                } else {
                    newResult = await strapi.db.connection.context.raw(
                        `${tingkatKehadiranQuery}`
                    );
                }

                let objResult = {
                    ...e,
                    keseringan_insiden_id: newResult[0][0]?.keseringan_insiden_id ?? 0,
                    hasil: newResult[0][0]?.hasil ?? 0,
                    nilai_mor: newResult[0][0]?.nilai_mor ?? 0,
                    nilai_akhir: newResult[0][0]?.nilai_akhir ?? 0,
                    bulan: newResult[0][0]?.bulan ?? `${month}`,
                    tahun: newResult[0][0]?.tahun ?? `${year}`,
                }

                resultWithTingkatKehadiran.push(objResult)
            }

            let checkData = {
                rows: resultWithTingkatKehadiran,
                count: Number(total[0][0].total),
            };

            const data = getPagingData(checkData, page, limit);

            return data;
        } catch (error) {
            throw error;
        }
    },
};
