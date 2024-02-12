"use strict";
const { getPagination, getPagingData } = require("../../../../../helpers/paging");
const jwt = require("jsonwebtoken");

module.exports = {
    getDatabaseKaryawan: async (searchComponent, authentication) => {
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

            let whereQuery = "";
            let whereQuerySecond = "";
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
                select uu.id as user_id, uu.name, uu.nrp, uu.email, uu.versatility, uu.grade, uu.jabatan from up_users uu
                left join up_users_role_mor_links uurml on uurml.user_id = uu.id 
                left join role_mors rm on rm.id = uurml.role_mor_id 
                where rm.id = 2) a
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

            let resultWithTingkatKehadiran = []
            let arrayResult = result[0]

            for (let i = 0; i < arrayResult.length; i++) {
                let e = arrayResult[i];

                let newResult

                let tingkatKehadiranQuery =
                    `
                    select * from (select uu.id as user_id, tk.id as tingkat_kehadiran_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun from tingkat_kehadirans tk 
                        left join tingkat_kehadirans_user_name_links tkunl on tkunl.tingkat_kehadiran_id = tk.id 
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
                    tingkat_kehadiran_id: newResult[0][0]?.tingkat_kehadiran_id ?? 0,
                    tingkat_kehadiran_hasil: newResult[0][0]?.hasil ?? 0,
                    tingkat_kehadiran_nilai_mor: newResult[0][0]?.nilai_mor ?? 0,
                    tingkat_kehadiran_nilai_akhir: newResult[0][0]?.nilai_akhir ?? 0,
                    tingkat_kehadiran_kategori: newResult[0][0]?.hasil >= 0 && newResult[0][0]?.hasil <= 95.90 ? "K" : newResult[0][0]?.hasil >= 96.00 && newResult[0][0]?.hasil <= 96.90 ? "C" : newResult[0][0]?.hasil >= 97 && newResult[0][0]?.hasil <= 97.90 ? "B" : newResult[0][0]?.hasil >= 98 && newResult[0][0]?.hasil <= 98.90 ? "BS" : newResult[0][0]?.hasil >= 99 && newResult[0][0]?.hasil <= 100 ? "IST" : "error",
                    bulan: newResult[0][0]?.bulan ?? `${month}`,
                    tahun: newResult[0][0]?.tahun ?? `${year}`,
                }

                resultWithTingkatKehadiran.push(objResult)
            }

            arrayResult = resultWithTingkatKehadiran
            resultWithTingkatKehadiran = []

            for (let i = 0; i < arrayResult.length; i++) {
                let e = arrayResult[i];

                let newResult

                let tingkatKehadiranQuery =
                    `
                    select * from (select uu.id as user_id, tk.id as disiplin_kerja_id, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun from disiplin_kerjas tk 
                        left join disiplin_kerjas_user_name_links tkunl on tkunl.disiplin_kerja_id = tk.id 
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
                    disiplin_kerja_id: newResult[0][0]?.disiplin_kerja_id ?? 0,
                    disiplin_kerja_nilai_mor: newResult[0][0]?.nilai_mor ?? 0,
                    disiplin_kerja_nilai_akhir: newResult[0][0]?.nilai_akhir ?? 0,
                    disiplin_kerja_kategori: newResult[0][0]?.nilai_mor >= 0 && newResult[0][0]?.nilai_mor <= 1 ? "K" : newResult[0][0]?.nilai_mor >= 2 && newResult[0][0]?.nilai_mor <= 2 ? "C" : newResult[0][0]?.nilai_mor >= 3 && newResult[0][0]?.nilai_mor <= 3 ? "B" : newResult[0][0]?.nilai_mor >= 4 && newResult[0][0]?.nilai_mor <= 4 ? "BS" : newResult[0][0]?.nilai_mor >= 5 && newResult[0][0]?.nilai_mor <= 5 ? "IST" : "error",
                    bulan: newResult[0][0]?.bulan ?? `${month}`,
                    tahun: newResult[0][0]?.tahun ?? `${year}`,
                }

                resultWithTingkatKehadiran.push(objResult)
            }

            arrayResult = resultWithTingkatKehadiran
            resultWithTingkatKehadiran = []

            for (let i = 0; i < arrayResult.length; i++) {
                let e = arrayResult[i];

                let newResult

                let tingkatKehadiranQuery =
                    `
                    select * from (select uu.id as user_id, tk.id as hours_meter_id, tk.total_hm, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun from hours_meters tk 
                        left join hours_meters_user_name_links tkunl on tkunl.hours_meter_id = tk.id 
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
                    hours_meter_id: newResult[0][0]?.hours_meter_id ?? 0,
                    hours_meter_hasil: newResult[0][0]?.total_hm ?? 0,
                    hours_meter_nilai_mor: newResult[0][0]?.nilai_mor ?? 0,
                    hours_meter_nilai_akhir: newResult[0][0]?.nilai_akhir ?? 0,
                    hours_meter_kategori: newResult[0][0]?.total_hm >= 0 && newResult[0][0]?.total_hm <= 129 ? "K" : newResult[0][0]?.total_hm >= 130 && newResult[0][0]?.total_hm <= 179 ? "C" : newResult[0][0]?.total_hm >= 180 && newResult[0][0]?.total_hm <= 229 ? "B" : newResult[0][0]?.total_hm >= 230 && newResult[0][0]?.total_hm <= 279 ? "BS" : newResult[0][0]?.total_hm >= 280 && newResult[0][0]?.total_hm <= 500 ? "IST" : "error",
                    bulan: newResult[0][0]?.bulan ?? `${month}`,
                    tahun: newResult[0][0]?.tahun ?? `${year}`,
                }

                resultWithTingkatKehadiran.push(objResult)
            }

            arrayResult = resultWithTingkatKehadiran
            resultWithTingkatKehadiran = []

            for (let i = 0; i < arrayResult.length; i++) {
                let e = arrayResult[i];

                let newResult

                let tingkatKehadiranQuery =
                    `
                    select * from (select uu.id as user_id, tk.id as productivity_individu_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun from productivity_individus tk 
                        left join productivity_individus_user_name_links tkunl on tkunl.productivity_individu_id = tk.id 
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
                    productivity_individu_id: newResult[0][0]?.productivity_individu_id ?? 0,
                    productivity_individu_hasil: newResult[0][0]?.hasil ?? 0,
                    productivity_individu_nilai_mor: newResult[0][0]?.nilai_mor ?? 0,
                    productivity_individu_nilai_akhir: newResult[0][0]?.nilai_akhir ?? 0,
                    productivity_individu_kategori: newResult[0][0]?.hasil >= 0 && newResult[0][0]?.hasil <= 84.99 ? "K" : newResult[0][0]?.hasil >= 85.00 && newResult[0][0]?.hasil <= 89.99 ? "C" : newResult[0][0]?.hasil >= 89 && newResult[0][0]?.hasil <= 94.99 ? "B" : newResult[0][0]?.hasil >= 95 && newResult[0][0]?.hasil <= 99.99 ? "BS" : newResult[0][0]?.hasil >= 100 && newResult[0][0]?.hasil <= 150 ? "IST" : "error",
                    bulan: newResult[0][0]?.bulan ?? `${month}`,
                    tahun: newResult[0][0]?.tahun ?? `${year}`,
                }

                resultWithTingkatKehadiran.push(objResult)
            }

            arrayResult = resultWithTingkatKehadiran
            resultWithTingkatKehadiran = []

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
                    keseringan_insiden_hasil: newResult[0][0]?.hasil ?? 0,
                    keseringan_insiden_nilai_mor: newResult[0][0]?.nilai_mor ?? 0,
                    keseringan_insiden_nilai_akhir: newResult[0][0]?.nilai_akhir ?? 0,
                    keseringan_insiden_kategori: newResult[0][0]?.hasil == 4 ? "K" : newResult[0][0]?.hasil == 3 ? "C" : newResult[0][0]?.hasil == 2 ? "B" : newResult[0][0]?.hasil == 1 ? "BS" : newResult[0][0]?.hasil == 0 ? "IST" : "error",
                    bulan: newResult[0][0]?.bulan ?? `${month}`,
                    tahun: newResult[0][0]?.tahun ?? `${year}`,
                }

                resultWithTingkatKehadiran.push(objResult)
            }

            arrayResult = resultWithTingkatKehadiran
            resultWithTingkatKehadiran = []

            for (let i = 0; i < arrayResult.length; i++) {
                let e = arrayResult[i];

                let newResult

                let tingkatKehadiranQuery =
                    `
                    select * from (select uu.id as user_id, tk.id as hazard_report_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun from hazard_reports tk 
                        left join hazard_reports_user_name_links tkunl on tkunl.hazard_report_id = tk.id 
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
                    hazard_report_id: newResult[0][0]?.hazard_report_id ?? 0,
                    hazard_report_hasil: newResult[0][0]?.hasil ?? 0,
                    hazard_report_nilai_mor: newResult[0][0]?.nilai_mor ?? 0,
                    hazard_report_nilai_akhir: newResult[0][0]?.nilai_akhir ?? 0,
                    hazard_report_kategori: newResult[0][0]?.hasil == 1 || newResult[0][0]?.hasil == 0 ? "K" : newResult[0][0]?.hasil == 2 ? "C" : newResult[0][0]?.hasil == 3 ? "B" : newResult[0][0]?.hasil == 4 ? "BS" : newResult[0][0]?.hasil == 5 ? "IST" : "error",
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
