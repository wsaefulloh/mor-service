"use strict";
const { getPagination, getPagingData } = require("../../../../../helpers/paging");
const jwt = require("jsonwebtoken");

module.exports = {
    getNilaiMorKaryawan: async (searchComponent, authentication) => {
        try {
            let {
                id_user,
                month,
                year,
            } = searchComponent;

            let resultTingkatKehadiran = await strapi.db.connection.context.raw(
                `select * from (
                    select uu.id as user_id, tk.id as tingkat_kehadiran_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun  from up_users uu 
                    left join tingkat_kehadirans_user_name_links tkunl on tkunl.user_id = uu.id
                    left join tingkat_kehadirans tk on tk.id = tkunl.tingkat_kehadiran_id  
                    where tk.bulan = '${month}' AND tk.tahun = '${year}' and uu.id = ${id_user}) a`
            );

            let disiplinWaktuKerja = await strapi.db.connection.context.raw(
                `select * from (
                    select uu.id as user_id, tk.id as disiplin_kerja_id, tk.nilai_mor as hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun  from up_users uu 
                    left join disiplin_kerjas_user_name_links tkunl on tkunl.user_id = uu.id
                    left join disiplin_kerjas tk on tk.id = tkunl.disiplin_kerja_id  
                    where tk.bulan = '${month}' AND tk.tahun = '${year}' and uu.id = ${id_user}) a`
            );

            let pencapaianHoursMeter = await strapi.db.connection.context.raw(
                `select * from (
                    select uu.id as user_id, tk.id as hours_meter_id, tk.total_hm as hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun  from up_users uu 
                    left join hours_meters_user_name_links tkunl on tkunl.user_id = uu.id
                    left join hours_meters tk on tk.id = tkunl.hours_meter_id  
                    where tk.bulan = '${month}' AND tk.tahun = '${year}' and uu.id = ${id_user}) a`
            );

            let productivityIndividu = await strapi.db.connection.context.raw(
                `select * from (
                    select uu.id as user_id, tk.id as productivity_individu_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun  from up_users uu 
                    left join productivity_individus_user_name_links tkunl on tkunl.user_id = uu.id
                    left join productivity_individus tk on tk.id = tkunl.productivity_individu_id  
                    where tk.bulan = '${month}' AND tk.tahun = '${year}' and uu.id = ${id_user}) a`
            );

            let keseringanInsiden = await strapi.db.connection.context.raw(
                `select * from (
                    select uu.id as user_id, tk.id as keseringan_insiden_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun  from up_users uu 
                    left join keseringan_insidens_user_name_links tkunl on tkunl.user_id = uu.id
                    left join keseringan_insidens tk on tk.id = tkunl.keseringan_insiden_id  
                    where tk.bulan = '${month}' AND tk.tahun = '${year}' and uu.id = ${id_user}) a`
            );

            let hazardReport = await strapi.db.connection.context.raw(
                `select * from (
                    select uu.id as user_id, tk.id as hazard_report_id, tk.hasil, tk.nilai_mor, tk.nilai_akhir, tk.bulan, tk.tahun  from up_users uu 
                    left join hazard_reports_user_name_links tkunl on tkunl.user_id = uu.id
                    left join hazard_reports tk on tk.id = tkunl.hazard_report_id  
                    where tk.bulan = '${month}' AND tk.tahun = '${year}' and uu.id = ${id_user}) a`
            );

            if (resultTingkatKehadiran[0][0]?.hasil >= 0 && resultTingkatKehadiran[0][0]?.hasil <= 95) {

            }

            let resultRapi = [{
                parameter: "Tingkat Kehadiran",
                bobot: "20%",
                hasil: resultTingkatKehadiran[0][0]?.hasil ?? null,
                nilai_mor: resultTingkatKehadiran[0][0]?.nilai_mor ?? null,
                nilai_akhir: resultTingkatKehadiran[0][0]?.nilai_akhir ?? null,
                kategori: resultTingkatKehadiran[0][0]?.hasil >= 0 && resultTingkatKehadiran[0][0]?.hasil <= 95.90 ? "K" : resultTingkatKehadiran[0][0]?.hasil >= 96.00 && resultTingkatKehadiran[0][0]?.hasil <= 96.90 ? "C" : resultTingkatKehadiran[0][0]?.hasil >= 97 && resultTingkatKehadiran[0][0]?.hasil <= 97.90 ? "B" : resultTingkatKehadiran[0][0]?.hasil >= 98 && resultTingkatKehadiran[0][0]?.hasil <= 98.90 ? "BS" : resultTingkatKehadiran[0][0]?.hasil >= 99 && resultTingkatKehadiran[0][0]?.hasil <= 100 ? "IST" : "error"
            },
            {
                parameter: "Tepat Waktu & Disiplin Kerja",
                bobot: "10%",
                hasil: disiplinWaktuKerja[0][0]?.hasil ?? null,
                nilai_mor: disiplinWaktuKerja[0][0]?.nilai_mor ?? null,
                nilai_akhir: disiplinWaktuKerja[0][0]?.nilai_akhir ?? null,
                kategori: disiplinWaktuKerja[0][0]?.hasil >= 0 && disiplinWaktuKerja[0][0]?.hasil <= 1 ? "K" : disiplinWaktuKerja[0][0]?.hasil >= 2 && disiplinWaktuKerja[0][0]?.hasil <= 2 ? "C" : disiplinWaktuKerja[0][0]?.hasil >= 3 && disiplinWaktuKerja[0][0]?.hasil <= 3 ? "B" : disiplinWaktuKerja[0][0]?.hasil >= 4 && disiplinWaktuKerja[0][0]?.hasil <= 4 ? "BS" : disiplinWaktuKerja[0][0]?.hasil >= 5 && disiplinWaktuKerja[0][0]?.hasil <= 5 ? "IST" : "error"
            },
            {
                parameter: "Pencapaian Hours Meter (HM)",
                bobot: "20%",
                hasil: pencapaianHoursMeter[0][0]?.hasil ?? null,
                nilai_mor: pencapaianHoursMeter[0][0]?.nilai_mor ?? null,
                nilai_akhir: pencapaianHoursMeter[0][0]?.nilai_akhir ?? null,
                kategori: pencapaianHoursMeter[0][0]?.hasil >= 0 && pencapaianHoursMeter[0][0]?.hasil <= 129 ? "K" : pencapaianHoursMeter[0][0]?.hasil >= 130 && pencapaianHoursMeter[0][0]?.hasil <= 179 ? "C" : pencapaianHoursMeter[0][0]?.hasil >= 180 && pencapaianHoursMeter[0][0]?.hasil <= 229 ? "B" : pencapaianHoursMeter[0][0]?.hasil >= 230 && pencapaianHoursMeter[0][0]?.hasil <= 279 ? "BS" : pencapaianHoursMeter[0][0]?.hasil >= 280 && pencapaianHoursMeter[0][0]?.hasil <= 500 ? "IST" : "error"
            }, {
                parameter: "Pencapaian Produktifitas Individu",
                bobot: "25%",
                hasil: productivityIndividu[0][0]?.hasil ?? null,
                nilai_mor: productivityIndividu[0][0]?.nilai_mor ?? null,
                nilai_akhir: productivityIndividu[0][0]?.nilai_akhir ?? null,
                kategori: productivityIndividu[0][0]?.hasil >= 0 && productivityIndividu[0][0]?.hasil <= 84.99 ? "K" : productivityIndividu[0][0]?.hasil >= 85.00 && productivityIndividu[0][0]?.hasil <= 89.99 ? "C" : productivityIndividu[0][0]?.hasil >= 89 && productivityIndividu[0][0]?.hasil <= 94.99 ? "B" : productivityIndividu[0][0]?.hasil >= 95 && productivityIndividu[0][0]?.hasil <= 99.99 ? "BS" : productivityIndividu[0][0]?.hasil >= 100 && productivityIndividu[0][0]?.hasil <= 150 ? "IST" : "error"
            }, {
                parameter: "Tingkat Keseringan Insiden",
                bobot: "20%",
                hasil: keseringanInsiden[0][0]?.hasil ?? null,
                nilai_mor: keseringanInsiden[0][0]?.nilai_mor ?? null,
                nilai_akhir: keseringanInsiden[0][0]?.nilai_akhir ?? null,
                kategori: keseringanInsiden[0][0]?.hasil == 4 ? "K" : keseringanInsiden[0][0]?.hasil == 3 ? "C" : keseringanInsiden[0][0]?.hasil == 2 ? "B" : keseringanInsiden[0][0]?.hasil == 1 ? "BS" : keseringanInsiden[0][0]?.hasil == 0 ? "IST" : "error"
            }, {
                parameter: "Hazard Report",
                bobot: "5%",
                hasil: hazardReport[0][0]?.hasil ?? null,
                nilai_mor: hazardReport[0][0]?.nilai_mor ?? null,
                nilai_akhir: hazardReport[0][0]?.nilai_akhir ?? null,
                kategori: hazardReport[0][0]?.hasil == 1 || hazardReport[0][0]?.hasil == 0 ? "K" : hazardReport[0][0]?.hasil == 2 ? "C" : hazardReport[0][0]?.hasil == 3 ? "B" : hazardReport[0][0]?.hasil == 4 ? "BS" : hazardReport[0][0]?.hasil == 5 ? "IST" : "error"
            }]

            let data = {
                data: resultRapi,
                nilai_akhir: Number(resultTingkatKehadiran[0][0].nilai_akhir) + Number(disiplinWaktuKerja[0][0].nilai_akhir) + Number(pencapaianHoursMeter[0][0].nilai_akhir) + Number(productivityIndividu[0][0].nilai_akhir) + Number(keseringanInsiden[0][0].nilai_akhir) + Number(hazardReport[0][0].nilai_akhir),
            };

            return data;
        } catch (error) {
            throw error;
        }
    },
};
