"use strict";
const { getPagination, getPagingData } = require("../../../../../helpers/paging");
const jwt = require("jsonwebtoken");

module.exports = {
    getSuratPeringatan: async (searchComponent, authentication) => {
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

            let query = `
            select * from (
                SELECT uu.name, uu.nrp ,uu.jabatan ,uu.versatility , uu.grade , dsp.start_date ,dsp.end_date , dsp.jenis_disiplin_report , dsp.pasal_pelanggaran  FROM data_surat_peringatans dsp 
                left join data_surat_peringatans_user_name_links dspunl on dspunl.data_surat_peringatan_id = dsp.id 
                left join up_users uu on uu.id = dspunl.user_id ) a
            `

            let result
            let total

            if (whereQueryFirst.length === 0) {
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
            } else {
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
