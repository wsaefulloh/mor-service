"use strict";
const { getNilaiAkhirMOR, getMorKombinasi, getFormatDate, getStatus } = require("../../../../../helpers/calculate");
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
                    tingkat_kehadiran_hasil: newResult[0][0]?.hasil.toFixed(2) ?? 0,
                    tingkat_kehadiran_nilai_mor: newResult[0][0]?.nilai_mor.toFixed(2) ?? 0,
                    tingkat_kehadiran_bobot: 20,
                    tingkat_kehadiran_nilai_akhir: ((newResult[0][0]?.nilai_mor ?? 0) * (20 / 100)).toFixed(2),
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
                    hours_meter_hasil: newResult[0][0]?.total_hm.toFixed(2) ?? 0,
                    hours_meter_nilai_mor: newResult[0][0]?.nilai_mor.toFixed(2) ?? 0,
                    hours_meter_bobot: 20,
                    hours_meter_nilai_akhir: ((newResult[0][0]?.nilai_mor ?? 0) * (20 / 100)).toFixed(2),
                    hours_meter_kategori: newResult[0][0]?.total_hm >= 0 && newResult[0][0]?.total_hm <= 20.99 ? "K" : newResult[0][0]?.total_hm >= 21.00 && newResult[0][0]?.total_hm <= 40.99 ? "C" : newResult[0][0]?.total_hm >= 41.00 && newResult[0][0]?.total_hm <= 60.99 ? "B" : newResult[0][0]?.total_hm >= 61.00 && newResult[0][0]?.total_hm <= 80.99 ? "BS" : newResult[0][0]?.total_hm >= 81.00 && newResult[0][0]?.total_hm <= 150.00 ? "IST" : "error",
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
                    keseringan_insiden_hasil: newResult[0][0]?.hasil.toFixed(2) ?? 0,
                    keseringan_insiden_nilai_mor: newResult[0][0]?.nilai_mor.toFixed(2) ?? 0,
                    keseringan_insiden_bobot: 20,
                    keseringan_insiden_nilai_akhir: ((newResult[0][0]?.nilai_mor ?? 0) * (20 / 100)).toFixed(2),
                    keseringan_insiden_kategori: newResult[0][0]?.hasil >= 4 ? "K" : newResult[0][0]?.hasil == 3 ? "C" : newResult[0][0]?.hasil == 2 ? "B" : newResult[0][0]?.hasil == 1 ? "BS" : newResult[0][0]?.hasil == 0 ? "IST" : "error",
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
                    select * from (select uu.id as user_id, tk.id as pencapaian_produksi_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun from pencapaian_produksis tk 
                        left join pencapaian_produksis_user_name_links tkunl on tkunl.pencapaian_produksi_id = tk.id 
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
                    pencapaian_produksi_id: newResult[0][0]?.pencapaian_produksi_id ?? 0,
                    pencapaian_produksi_hasil: newResult[0][0]?.hasil.toFixed(2) ?? 0,
                    pencapaian_produksi_nilai_mor: newResult[0][0]?.nilai_mor.toFixed(2) ?? 0,
                    pencapaian_produksi_bobot: 25,
                    pencapaian_produksi_nilai_akhir: ((newResult[0][0]?.nilai_mor ?? 0) * (25 / 100)).toFixed(2),
                    pencapaian_produksi_kategori: newResult[0][0]?.hasil <= 75.99 ? "K" : (newResult[0][0]?.hasil >= 76 && newResult[0][0]?.hasil <= 90.99) ? "C" : (newResult[0][0]?.hasil >= 91 && newResult[0][0]?.hasil <= 100.99) ? "B" : (newResult[0][0]?.hasil >= 101 && newResult[0][0]?.hasil <= 105.99) ? "BS" : newResult[0][0]?.hasil >= 106 ? "IST" : "error",
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
                    hazard_report_hasil: newResult[0][0]?.hasil.toFixed(2) ?? 0,
                    hazard_report_nilai_mor: newResult[0][0]?.nilai_mor.toFixed(2) ?? 0,
                    hazard_report_bobot: 15,
                    hazard_report_nilai_akhir: ((newResult[0][0]?.nilai_mor ?? 0) * (15 / 100)).toFixed(2),
                    hazard_report_kategori: newResult[0][0]?.hasil == 1 || newResult[0][0]?.hasil == 0 ? "K" : newResult[0][0]?.hasil == 2 ? "C" : newResult[0][0]?.hasil == 3 ? "B" : newResult[0][0]?.hasil == 4 ? "BS" : newResult[0][0]?.hasil >= 5 ? "IST" : "error",
                    bulan: newResult[0][0]?.bulan ?? `${month}`,
                    tahun: newResult[0][0]?.tahun ?? `${year}`,
                }

                resultWithTingkatKehadiran.push(objResult)
            }

            arrayResult = resultWithTingkatKehadiran
            resultWithTingkatKehadiran = []

            for (let i = 0; i < arrayResult.length; i++) {
                let e = arrayResult[i];

                let objResult = {
                    ...e,
                    hmxproduksi_hasil: (Number(e.hours_meter_nilai_mor).toFixed(2) * Number(e.pencapaian_produksi_nilai_mor).toFixed(2)).toFixed(2),
                    hmxproduksi_nilai_mor: (Number(getMorKombinasi(Number(e.hours_meter_nilai_mor).toFixed(2) * Number(e.pencapaian_produksi_nilai_mor).toFixed(2)))).toFixed(2),
                    hmxproduksi_bobot: 45,
                    hmxproduksi_nilai_akhir: ((Number(getMorKombinasi(Number(e.hours_meter_nilai_mor).toFixed(2) * Number(e.pencapaian_produksi_nilai_mor).toFixed(2)))) * (45 / 100)).toFixed(2),
                    ifrxhazard_hasil: (Number(e.keseringan_insiden_nilai_mor).toFixed(2) * Number(e.hazard_report_nilai_mor).toFixed(2)).toFixed(2),
                    ifrxhazard_nilai_mor: (Number(getMorKombinasi(Number(e.keseringan_insiden_nilai_mor).toFixed(2) * Number(e.hazard_report_nilai_mor).toFixed(2)))).toFixed(2),
                    ifrxhazard_bobot: 35,
                    ifrxhazard_nilai_akhir: ((Number(getMorKombinasi(Number(e.keseringan_insiden_nilai_mor).toFixed(2) * Number(e.hazard_report_nilai_mor).toFixed(2)))) * (35 / 100)).toFixed(2),
                }

                resultWithTingkatKehadiran.push(objResult)
            }

            arrayResult = resultWithTingkatKehadiran
            resultWithTingkatKehadiran = []

            for (let i = 0; i < arrayResult.length; i++) {
                let e = arrayResult[i];

                let objResult = {
                    ...e,
                    total_nilai_akhir: (Number(e.hmxproduksi_nilai_akhir) + Number(e.ifrxhazard_nilai_akhir) + Number(e.tingkat_kehadiran_nilai_akhir)).toFixed(2),
                    total_keterangan: getNilaiAkhirMOR(Number(e.hmxproduksi_nilai_mor), Number(e.ifrxhazard_nilai_mor), Number(e.tingkat_kehadiran_nilai_mor)),
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
                    select * from (select uu.id as user_id, tk.id as indispliner_id, tk.jenis_disiplin_report , tk.pasal_pelanggaran , tk.start_date , tk.end_date from data_surat_peringatans tk 
                        left join data_surat_peringatans_user_name_links tkunl on tkunl.data_surat_peringatan_id = tk.id 
                        left join up_users uu on uu.id = tkunl.user_id 
                        where uu.id = ${e.user_id}) a ORDER BY indispliner_id desc
                    `

                newResult = await strapi.db.connection.context.raw(
                    `${tingkatKehadiranQuery}`
                );

                let objResult = { ...e }

                if (newResult[0].length !== 0) {
                    objResult = {
                        ...e,
                        indisipliner_tanggal_berlaku: newResult[0][0]?.start_date !== "Invalid Date" ? getFormatDate(newResult[0][0].start_date) : "-",
                        indisipliner_tanggal_berakhir: newResult[0][0]?.end_date !== "Invalid Date" ? getFormatDate(newResult[0][0].end_date) : "-",
                        indisipliner_jenis: newResult[0][0]?.jenis_disiplin_report,
                        indisipliner_pasal: newResult[0][0]?.pasal_pelanggaran,
                        indisipliner_status: newResult[0][0]?.end_date !== "Invalid Date" ? getStatus(newResult[0][0].end_date) : "-"
                    }
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
