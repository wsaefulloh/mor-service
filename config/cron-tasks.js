const axios = require("axios"); // node
const readXlsxFile = require("read-excel-file/node");
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator')
const fs = require('fs');
const path = require("path");

module.exports = {

    addData: {
        task: async ({ strapi }) => {

            let dataExcel = await strapi.db.connection.context.raw(
                `SELECT * FROM status_imports si WHERE si.status = 'Pending'`
            );

            if (dataExcel[0].length !== 0) {

                await strapi.db.connection.context.raw(
                    `UPDATE status_imports si SET si.status = "Process" WHERE si.id = ${dataExcel[0][0].id};`
                );

                let month = dataExcel[0][0].bulan
                let year = dataExcel[0][0].tahun
                let name_file = dataExcel[0][0].nama_file
                let created_by_id_user = dataExcel[0][0].created_by_id_user

                let checkingUser = async (data, month, year, created_by_id_user) => {
                    try {

                        let user = await strapi.db.connection.context.raw(
                            `SELECT * FROM up_users uu WHERE uu.nrp = '${data.nrp}'`
                        );

                        let id_user

                        if (user[0].length === 0) {
                            let password = `${otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })}`
                            const salt = bcrypt.genSaltSync(10);
                            const password_hash = bcrypt.hashSync(password, salt);
                            let email = `${data.nrp}@mor.com`
                            user = await strapi.db.connection.context.raw(
                                `INSERT INTO up_users (name, username, email, password, password_mor, confirmed, blocked, nrp, jabatan, versatility, grade) values ("${data.name}", '${email}', '${email}', '${password_hash}', '${password}', 1, 0, '${data.nrp}', '${data.jabatan}', '${data.versatility}', '${data.grade}')`
                            );
                            id_user = user[0].insertId
                            await strapi.db.connection.context.raw(
                                `INSERT INTO up_users_role_mor_links (user_id, role_mor_id) VALUES (${id_user}, 2);`
                            );
                        } else {
                            id_user = user[0][0].id
                        }

                        await tingkatKehadiran(id_user, data, month, year, created_by_id_user)
                        await hoursMeter(id_user, data, month, year, created_by_id_user)
                        await productivityTotal(id_user, data, month, year, created_by_id_user)
                        await keseringanInsiden(id_user, data, month, year, created_by_id_user)
                        await hazardReport(id_user, data, month, year, created_by_id_user)

                    } catch (error) {
                        console.log(error)
                        throw error
                    }
                }

                let tingkatKehadiran = async (id_user, dataRaw, month, year, created_by_id_user1) => {
                    let data = dataRaw.tingkat_kehadiran
                    let updated_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let updated_by_id_user = created_by_id_user1
                    let created_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let created_by_id_user = created_by_id_user1

                    try {

                        let checkTingkatKehadiran = await strapi.db.connection.context.raw(`
                            SELECT * FROM tingkat_kehadirans tk 
                            LEFT JOIN tingkat_kehadirans_user_name_links tkunl ON tkunl.tingkat_kehadiran_id = tk.id 
                            WHERE tkunl.user_id = ${id_user} AND tk.bulan = '${month}' AND tk.tahun = '${year}'`
                        )

                        if (checkTingkatKehadiran[0].length !== 0) {

                            created_at = checkTingkatKehadiran[0][0]?.created_at ? `'${new Date().toISOString(checkTingkatKehadiran[0][0]?.created_at).slice(0, 19).replace('T', ' ')}'` : updated_at
                            created_by_id_user = checkTingkatKehadiran[0][0]?.created_by_id_user ?? updated_by_id_user

                            await strapi.db.connection.context.raw(
                                `UPDATE tingkat_kehadirans
                                SET
                                hasil = ${data.hasil},
                                nilai_mor = ${data.nilai_mor},
                                nilai_akhir = ${data.nilai_akhir},
                                bulan = '${month}',
                                tahun = '${year}',
                                created_at = ${created_at},
                                updated_at = ${updated_at},
                                created_by_id_user = ${created_by_id_user},
                                updated_by_id_user = ${updated_by_id_user}
                                WHERE id = ${checkTingkatKehadiran[0][0].id};`
                            )

                        } else {

                            let tingkatKehadiran = await strapi.db.connection.context.raw(
                                `INSERT INTO tingkat_kehadirans (hasil, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.hasil}, ${data.nilai_mor}, ${data.nilai_akhir}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                            )

                            await strapi.db.connection.context.raw(
                                `INSERT INTO tingkat_kehadirans_user_name_links (tingkat_kehadiran_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                            )
                        }

                    } catch (error) {
                        console.log(error)
                        throw error
                    }
                }

                let hoursMeter = async (id_user, dataRaw, month, year, created_by_id_user1) => {
                    let data = dataRaw.hours_meter

                    let updated_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let updated_by_id_user = created_by_id_user1
                    let created_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let created_by_id_user = created_by_id_user1

                    try {

                        let checkTingkatKehadiran = await strapi.db.connection.context.raw(`
                            SELECT * FROM hours_meters tk 
                            LEFT JOIN hours_meters_user_name_links tkunl ON tkunl.hours_meter_id = tk.id 
                            WHERE tkunl.user_id = ${id_user} AND tk.bulan = '${month}' AND tk.tahun = '${year}'`
                        )

                        if (checkTingkatKehadiran[0].length !== 0) {

                            created_at = checkTingkatKehadiran[0][0]?.created_at ? `'${new Date().toISOString(checkTingkatKehadiran[0][0]?.created_at).slice(0, 19).replace('T', ' ')}'` : updated_at
                            created_by_id_user = checkTingkatKehadiran[0][0]?.created_by_id_user ?? updated_by_id_user

                            await strapi.db.connection.context.raw(
                                `UPDATE hours_meters
                                SET
                                total_hm = ${data.total_hm},
                                nilai_mor = ${data.nilai_mor},
                                nilai_akhir = 0,
                                bulan = '${month}',
                                tahun = '${year}',
                                created_at = ${created_at},
                                updated_at = ${updated_at},
                                created_by_id_user = ${created_by_id_user},
                                updated_by_id_user = ${updated_by_id_user}
                                WHERE id = ${checkTingkatKehadiran[0][0].id};`
                            )

                        } else {
                            let tingkatKehadiran = await strapi.db.connection.context.raw(
                                `INSERT INTO hours_meters (total_hm, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.total_hm}, ${data.nilai_mor}, ${0}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                            )

                            await strapi.db.connection.context.raw(
                                `INSERT INTO hours_meters_user_name_links (hours_meter_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                            )
                        }



                    } catch (error) {
                        console.log(error)
                        throw error
                    }
                }

                let productivityTotal = async (id_user, dataRaw, month, year, created_by_id_user1) => {
                    let data = dataRaw.pencapaian_produksi

                    let updated_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let updated_by_id_user = created_by_id_user1
                    let created_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let created_by_id_user = created_by_id_user1

                    try {

                        let checkTingkatKehadiran = await strapi.db.connection.context.raw(`
                            SELECT * FROM pencapaian_produksis tk 
                            LEFT JOIN pencapaian_produksis_user_name_links tkunl ON tkunl.pencapaian_produksi_id = tk.id 
                            WHERE tkunl.user_id = ${id_user} AND tk.bulan = '${month}' AND tk.tahun = '${year}'`
                        )

                        if (checkTingkatKehadiran[0].length !== 0) {

                            created_at = checkTingkatKehadiran[0][0]?.created_at ? `'${new Date().toISOString(checkTingkatKehadiran[0][0]?.created_at).slice(0, 19).replace('T', ' ')}'` : updated_at
                            created_by_id_user = checkTingkatKehadiran[0][0]?.created_by_id_user ?? updated_by_id_user

                            await strapi.db.connection.context.raw(
                                `UPDATE pencapaian_produksis
                                SET
                                hasil = ${data.hasil},
                                nilai_mor = ${data.nilai_mor},
                                nilai_akhir = 0,
                                bulan = '${month}',
                                tahun = '${year}',
                                created_at = ${created_at},
                                updated_at = ${updated_at},
                                created_by_id_user = ${created_by_id_user},
                                updated_by_id_user = ${updated_by_id_user}
                                WHERE id = ${checkTingkatKehadiran[0][0].id};`
                            )

                        } else {
                            let tingkatKehadiran = await strapi.db.connection.context.raw(
                                `INSERT INTO pencapaian_produksis (hasil, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.hasil}, ${data.nilai_mor}, ${0}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                            )

                            await strapi.db.connection.context.raw(
                                `INSERT INTO pencapaian_produksis_user_name_links (pencapaian_produksi_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                            )
                        }



                    } catch (error) {
                        console.log(error)
                        throw error
                    }
                }

                let keseringanInsiden = async (id_user, dataRaw, month, year, created_by_id_user1) => {
                    let data = dataRaw.keseringan_insiden

                    let updated_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let updated_by_id_user = created_by_id_user1
                    let created_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let created_by_id_user = created_by_id_user1

                    try {

                        let checkTingkatKehadiran = await strapi.db.connection.context.raw(`
                            SELECT * FROM keseringan_insidens tk 
                            LEFT JOIN keseringan_insidens_user_name_links tkunl ON tkunl.keseringan_insiden_id = tk.id 
                            WHERE tkunl.user_id = ${id_user} AND tk.bulan = '${month}' AND tk.tahun = '${year}'`
                        )

                        if (checkTingkatKehadiran[0].length !== 0) {

                            created_at = checkTingkatKehadiran[0][0]?.created_at ? `'${new Date().toISOString(checkTingkatKehadiran[0][0]?.created_at).slice(0, 19).replace('T', ' ')}'` : updated_at
                            created_by_id_user = checkTingkatKehadiran[0][0]?.created_by_id_user ?? updated_by_id_user

                            await strapi.db.connection.context.raw(
                                `UPDATE keseringan_insidens
                                SET
                                hasil = ${data.hasil},
                                nilai_mor = ${data.nilai_mor},
                                nilai_akhir = 0,
                                bulan = '${month}',
                                tahun = '${year}',
                                created_at = ${created_at},
                                updated_at = ${updated_at},
                                created_by_id_user = ${created_by_id_user},
                                updated_by_id_user = ${updated_by_id_user}
                                WHERE id = ${checkTingkatKehadiran[0][0].id};`
                            )

                        } else {
                            let tingkatKehadiran = await strapi.db.connection.context.raw(
                                `INSERT INTO keseringan_insidens (hasil, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.hasil}, ${data.nilai_mor}, ${0}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                            )

                            await strapi.db.connection.context.raw(
                                `INSERT INTO keseringan_insidens_user_name_links (keseringan_insiden_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                            )
                        }



                    } catch (error) {
                        console.log(error)
                        throw error
                    }
                }

                let hazardReport = async (id_user, dataRaw, month, year, created_by_id_user1) => {
                    let data = dataRaw.hazard_report

                    let updated_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let updated_by_id_user = created_by_id_user1
                    let created_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let created_by_id_user = created_by_id_user1

                    try {

                        let checkTingkatKehadiran = await strapi.db.connection.context.raw(`
                            SELECT * FROM hazard_reports tk 
                            LEFT JOIN hazard_reports_user_name_links tkunl ON tkunl.hazard_report_id = tk.id 
                            WHERE tkunl.user_id = ${id_user} AND tk.bulan = '${month}' AND tk.tahun = '${year}'`
                        )

                        if (checkTingkatKehadiran[0].length !== 0) {

                            created_at = checkTingkatKehadiran[0][0]?.created_at ? `'${new Date().toISOString(checkTingkatKehadiran[0][0]?.created_at).slice(0, 19).replace('T', ' ')}'` : updated_at
                            created_by_id_user = checkTingkatKehadiran[0][0]?.created_by_id_user ?? updated_by_id_user

                            await strapi.db.connection.context.raw(
                                `UPDATE pencapaian_produksis
                                SET
                                hasil = ${data.hasil},
                                nilai_mor = ${data.nilai_mor},
                                nilai_akhir = 0,
                                bulan = '${month}',
                                tahun = '${year}',
                                created_at = ${created_at},
                                updated_at = ${updated_at},
                                created_by_id_user = ${created_by_id_user},
                                updated_by_id_user = ${updated_by_id_user}
                                WHERE id = ${checkTingkatKehadiran[0][0].id};`
                            )
                        } else {
                            let tingkatKehadiran = await strapi.db.connection.context.raw(
                                `INSERT INTO hazard_reports (hasil, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.hasil}, ${data.nilai_mor}, ${0}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                            )

                            await strapi.db.connection.context.raw(
                                `INSERT INTO hazard_reports_user_name_links (hazard_report_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                            )
                        }



                    } catch (error) {
                        console.log(error)
                        throw error
                    }
                }


                let checkingSP = async (data, month, year, created_by_id_user1) => {
                    try {

                        let updated_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                        let updated_by_id_user = created_by_id_user1
                        let created_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                        let created_by_id_user = created_by_id_user1

                        let user = await strapi.db.connection.context.raw(
                            `SELECT * FROM up_users uu WHERE uu.nrp = '${data.nrp}'`
                        );

                        let id_user

                        if (user[0].length !== 0) {
                            id_user = user[0][0].id
                            let report = await strapi.db.connection.context.raw(
                                `
                                SELECT * FROM data_surat_peringatans dsp
                                LEFT JOIN data_surat_peringatans_user_name_links dspunl ON dspunl.data_surat_peringatan_id = dsp.id 
                                WHERE dsp.pasal_pelanggaran = '${data.pasal_pelanggaran}' AND dsp.jenis_disiplin_report = '${data.jenis_disiplin_report}' AND
                                dsp.start_date = '${ExcelDateToJSDate(data.tanggal_mulai)}' AND dsp.end_date = '${ExcelDateToJSDate(data.tanggal_selesai)}' AND dspunl.user_id = ${id_user}
                                `
                            );

                            if (report[0].length === 0) {
                                let reportData = await strapi.db.connection.context.raw(
                                    `INSERT INTO data_surat_peringatans (pasal_pelanggaran, jenis_disiplin_report, start_date, end_date, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES ('${data.pasal_pelanggaran}', '${data.jenis_disiplin_report}', '${ExcelDateToJSDate(data.tanggal_mulai)}', '${ExcelDateToJSDate(data.tanggal_selesai)}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                                )

                                await strapi.db.connection.context.raw(
                                    `INSERT INTO data_surat_peringatans_user_name_links (data_surat_peringatan_id, user_id) VALUES (${reportData[0].insertId}, ${id_user});`
                                )
                            }
                        }

                    } catch (error) {
                        console.log(error)
                        throw error
                    }
                }

                function ExcelDateToJSDate(serial) {
                    var utc_days = Math.floor(serial - 25569);
                    var utc_value = utc_days * 86400;
                    var date_info = new Date(utc_value * 1000);

                    var fractional_day = serial - Math.floor(serial) + 0.0000001;

                    var total_seconds = Math.floor(86400 * fractional_day);

                    var seconds = total_seconds % 60;

                    total_seconds -= seconds;

                    var hours = Math.floor(total_seconds / (60 * 60));
                    var minutes = Math.floor(total_seconds / 60) % 60;

                    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds).toLocaleDateString("en-GB");
                }


                try {
                    let dataFilePath = fs.readFileSync(path.join(__dirname, `../public/${name_file}`));
                    await readXlsxFile(dataFilePath, { sheet: 2 }).then(
                        async (data) => {
                            let dataPertama = data;
                            let next = true
                            let l = 12
                            for (let i = l; i < dataPertama.length; i++) {
                                let a = dataPertama[i]
                                let data = {
                                    name: a[3],
                                    nrp: a[2],
                                    jabatan: a[4],
                                    versatility: a[5],
                                    grade: a[6],
                                    tingkat_kehadiran: {
                                        hasil: Number(a[7] * 100).toFixed(2) == "NaN" ? 0 : Number(a[7] * 100).toFixed(2),
                                        nilai_mor: Number(a[8]) > -1 ? Number(a[8]) : 0,
                                        nilai_akhir: Number(a[9]) > -1 ? Number(a[9]) : 0
                                    },
                                    hours_meter: {
                                        total_hm: Number(a[10] * 100).toFixed(2) == "NaN" ? 0 : Number(a[10] * 100).toFixed(2),
                                        nilai_mor: Number(a[11]) > -1 ? Number(a[11]) : 0
                                    },
                                    pencapaian_produksi: {
                                        hasil: Number(a[12] * 100).toFixed(2) == "NaN" ? 0 : Number(a[12] * 100).toFixed(2),
                                        nilai_mor: Number(a[13]) > -1 ? Number(a[13]) : 0,
                                    },
                                    keseringan_insiden: {
                                        hasil: Number(a[17]) > -1 ? Number(a[17]) : 0,
                                        nilai_mor: Number(a[18]) > -1 ? Number(a[18]) : 0,
                                    },
                                    hazard_report: {
                                        hasil: Number(a[19]) > -1 ? Number(a[19]) : 0,
                                        nilai_mor: Number(a[20]) > -1 ? Number(a[20]) : 0,
                                    },
                                }
                                await checkingUser(data, month, year, created_by_id_user)
                            }
                        }
                    );

                } catch (error) {
                    await strapi.db.connection.context.raw(
                        `UPDATE status_imports si SET si.status = "Failed" WHERE si.id = ${dataExcel[0][0].id};`
                    );
                }

                try {
                    let dataFilePath = fs.readFileSync(path.join(__dirname, `../public/${name_file}`));
                    await readXlsxFile(dataFilePath, { sheet: 9 }).then(
                        async (data) => {
                            let dataPertama = data;
                            let next = true
                            let l = 3
                            console.log(dataPertama.length)
                            for (let i = l; i < dataPertama.length; i++) {
                                let a = dataPertama[i]
                                let data = {
                                    name: a[2],
                                    nrp: a[1],
                                    jenis_disiplin_report: a[6],
                                    tanggal_mulai: a[7],
                                    tanggal_selesai: a[8],
                                    pasal_pelanggaran: a[9]
                                }
                                await checkingSP(data, month, year, created_by_id_user)
                            }
                        }
                    );

                    await strapi.db.connection.context.raw(
                        `UPDATE status_imports si SET si.status = "Done" WHERE si.id = ${dataExcel[0][0].id};`
                    );

                } catch (error) {
                    await strapi.db.connection.context.raw(
                        `UPDATE status_imports si SET si.status = "Failed" WHERE si.id = ${dataExcel[0][0].id};`
                    );
                }

                console.log("Update Data Success")
            }

            console.log("Updated")

        },
        options: {
            rule: "*/1 * * * *",
        },
    },
};
