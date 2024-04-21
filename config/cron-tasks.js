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
                            // console.log(user[0][0].id, "Ini buat user baru")
                            await strapi.db.connection.context.raw(
                                `INSERT INTO up_users_role_mor_links (user_id, role_mor_id) VALUES (${id_user}, 2);`
                            );
                        } else {
                            id_user = user[0][0].id
                            // console.log(user[0][0].id, "Ini user existing")
                        }

                        await tingkatKehadiran(id_user, data, month, year, created_by_id_user)
                        await disiplinKerja(id_user, data, month, year, created_by_id_user)
                        await hoursMeter(id_user, data, month, year, created_by_id_user)
                        await productivityIndividu(id_user, data, month, year, created_by_id_user)
                        await keseringanInsiden(id_user, data, month, year, created_by_id_user)
                        await hazardReport(id_user, data, month, year, created_by_id_user)

                    } catch (error) {
                        console.log(error)
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
                                `DELETE FROM tingkat_kehadirans WHERE id = ${checkTingkatKehadiran[0][0].id}`
                            )

                            await strapi.db.connection.context.raw(
                                `DELETE FROM tingkat_kehadirans_user_name_links WHERE tingkat_kehadiran_id = ${checkTingkatKehadiran[0][0].id}`
                            )
                        }

                        let tingkatKehadiran = await strapi.db.connection.context.raw(
                            `INSERT INTO tingkat_kehadirans (hasil, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.hasil}, ${data.nilai_mor}, ${data.nilai_akhir}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                        )

                        await strapi.db.connection.context.raw(
                            `INSERT INTO tingkat_kehadirans_user_name_links (tingkat_kehadiran_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                        )

                    } catch (error) {
                        console.log(error)
                    }
                }

                let disiplinKerja = async (id_user, dataRaw, month, year, created_by_id_user1) => {
                    let data = dataRaw.disiplin_kerja

                    let updated_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let updated_by_id_user = created_by_id_user1
                    let created_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let created_by_id_user = created_by_id_user1

                    try {

                        let checkDisiplinKerja = await strapi.db.connection.context.raw(`
                            SELECT * FROM disiplin_kerjas tk 
                            LEFT JOIN disiplin_kerjas_user_name_links tkunl ON tkunl.disiplin_kerja_id = tk.id 
                            WHERE tkunl.user_id = ${id_user} AND tk.bulan = '${month}' AND tk.tahun = '${year}'`
                        )

                        if (checkDisiplinKerja[0].length !== 0) {

                            created_at = checkDisiplinKerja[0][0]?.created_at ? `'${new Date().toISOString(checkDisiplinKerja[0][0]?.created_at).slice(0, 19).replace('T', ' ')}'` : updated_at
                            created_by_id_user = checkDisiplinKerja[0][0]?.created_by_id_user ?? updated_by_id_user

                            await strapi.db.connection.context.raw(
                                `DELETE FROM disiplin_kerjas WHERE id = ${checkDisiplinKerja[0][0].id}`
                            )
                            await strapi.db.connection.context.raw(
                                `DELETE FROM disiplin_kerjas_user_name_links WHERE disiplin_kerja_id = ${checkDisiplinKerja[0][0].id}`
                            )
                        }

                        let disiplinKerja = await strapi.db.connection.context.raw(
                            `INSERT INTO disiplin_kerjas (nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.nilai_mor}, ${data.nilai_akhir}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                        )

                        await strapi.db.connection.context.raw(
                            `INSERT INTO disiplin_kerjas_user_name_links (disiplin_kerja_id, user_id) VALUES (${disiplinKerja[0].insertId}, ${id_user});`
                        )

                    } catch (error) {
                        console.log(error)
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
                                `DELETE FROM hours_meters WHERE id = ${checkTingkatKehadiran[0][0].id}`
                            )
                            await strapi.db.connection.context.raw(
                                `DELETE FROM hours_meters_user_name_links WHERE hours_meter_id = ${checkTingkatKehadiran[0][0].id}`
                            )
                        }

                        let tingkatKehadiran = await strapi.db.connection.context.raw(
                            `INSERT INTO hours_meters (total_hm, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.total_hm}, ${data.nilai_mor}, ${data.nilai_akhir}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                        )

                        await strapi.db.connection.context.raw(
                            `INSERT INTO hours_meters_user_name_links (hours_meter_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                        )

                    } catch (error) {
                        console.log(error)
                    }
                }

                let productivityIndividu = async (id_user, dataRaw, month, year, created_by_id_user1) => {
                    let data = dataRaw.productivity_individu

                    let updated_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let updated_by_id_user = created_by_id_user1
                    let created_at = `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
                    let created_by_id_user = created_by_id_user1

                    try {

                        let checkTingkatKehadiran = await strapi.db.connection.context.raw(`
                            SELECT * FROM productivity_individus tk 
                            LEFT JOIN productivity_individus_user_name_links tkunl ON tkunl.productivity_individu_id = tk.id 
                            WHERE tkunl.user_id = ${id_user} AND tk.bulan = '${month}' AND tk.tahun = '${year}'`
                        )

                        if (checkTingkatKehadiran[0].length !== 0) {

                            created_at = checkTingkatKehadiran[0][0]?.created_at ? `'${new Date().toISOString(checkTingkatKehadiran[0][0]?.created_at).slice(0, 19).replace('T', ' ')}'` : updated_at
                            created_by_id_user = checkTingkatKehadiran[0][0]?.created_by_id_user ?? updated_by_id_user

                            await strapi.db.connection.context.raw(
                                `DELETE FROM productivity_individus WHERE id = ${checkTingkatKehadiran[0][0].id}`
                            )
                            await strapi.db.connection.context.raw(
                                `DELETE FROM productivity_individus_user_name_links WHERE productivity_individu_id = ${checkTingkatKehadiran[0][0].id}`
                            )
                        }

                        let tingkatKehadiran = await strapi.db.connection.context.raw(
                            `INSERT INTO productivity_individus (hasil, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.hasil}, ${data.nilai_mor}, ${data.nilai_akhir}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                        )

                        await strapi.db.connection.context.raw(
                            `INSERT INTO productivity_individus_user_name_links (productivity_individu_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                        )

                    } catch (error) {
                        console.log(error)
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
                                `DELETE FROM keseringan_insidens WHERE id = ${checkTingkatKehadiran[0][0].id}`
                            )
                            await strapi.db.connection.context.raw(
                                `DELETE FROM keseringan_insidens_user_name_links WHERE keseringan_insiden_id = ${checkTingkatKehadiran[0][0].id}`
                            )
                        }

                        let tingkatKehadiran = await strapi.db.connection.context.raw(
                            `INSERT INTO keseringan_insidens (hasil, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.hasil}, ${data.nilai_mor}, ${data.nilai_akhir}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                        )

                        await strapi.db.connection.context.raw(
                            `INSERT INTO keseringan_insidens_user_name_links (keseringan_insiden_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                        )

                    } catch (error) {
                        console.log(error)
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
                                `DELETE FROM hazard_reports WHERE id = ${checkTingkatKehadiran[0][0].id}`
                            )
                            await strapi.db.connection.context.raw(
                                `DELETE FROM hazard_reports_user_name_links WHERE hazard_report_id = ${checkTingkatKehadiran[0][0].id}`
                            )
                        }

                        let tingkatKehadiran = await strapi.db.connection.context.raw(
                            `INSERT INTO hazard_reports (hasil, nilai_mor, nilai_akhir, bulan, tahun, created_at, updated_at, created_by_id_user, updated_by_id_user) VALUES (${data.hasil}, ${data.nilai_mor}, ${data.nilai_akhir}, '${month}', '${year}', ${created_at}, ${updated_at}, ${created_by_id_user}, ${updated_by_id_user});`
                        )

                        await strapi.db.connection.context.raw(
                            `INSERT INTO hazard_reports_user_name_links (hazard_report_id, user_id) VALUES (${tingkatKehadiran[0].insertId}, ${id_user});`
                        )

                    } catch (error) {
                        console.log(error)
                    }
                }

                try {
                    let dataFilePath = fs.readFileSync(path.join(__dirname, `../public/${name_file}`));
                    await readXlsxFile(dataFilePath, { sheet: 2 }).then(
                        async (data) => {
                            let dataPertama = data;
                            let next = true
                            let i = 12
                            while (next) {
                                let a = dataPertama[i];
                                if (a[3]) {
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
                                        disiplin_kerja: {
                                            nilai_mor: Number(a[10]) > -1 ? Number(a[10]) : 0,
                                            nilai_akhir: Number(a[11]) > -1 ? Number(a[11]) : 0
                                        },
                                        hours_meter: {
                                            total_hm: Number(a[12]) > -1 ? Number(a[12]) : 0,
                                            nilai_mor: Number(a[13]) > -1 ? Number(a[13]) : 0,
                                            nilai_akhir: Number(a[14]) > -1 ? Number(a[14]) : 0
                                        },
                                        productivity_individu: {
                                            hasil: Number(a[15] * 100).toFixed(2) == "NaN" ? 0 : Number(a[15] * 100).toFixed(2),
                                            nilai_mor: Number(a[16]) > -1 ? Number(a[16]) : 0,
                                            nilai_akhir: Number(a[17]) > -1 ? Number(a[17]) : 0
                                        },
                                        keseringan_insiden: {
                                            hasil: Number(a[18]) > -1 ? Number(a[18]) : 0,
                                            nilai_mor: Number(a[19]) > -1 ? Number(a[19]) : 0,
                                            nilai_akhir: Number(a[20]) > -1 ? Number(a[20]) : 0
                                        },
                                        hazard_report: {
                                            hasil: Number(a[21]) > -1 ? Number(a[21]) : 0,
                                            nilai_mor: Number(a[22]) > -1 ? Number(a[22]) : 0,
                                            nilai_akhir: Number(a[23]) > -1 ? Number(a[23]) : 0
                                        },
                                    }
                                    i = i + 1
                                    await checkingUser(data, month, year, created_by_id_user)
                                } else {
                                    next = false
                                }
                            }
                        }
                    );

                    await strapi.db.connection.context.raw(
                        `UPDATE status_imports si SET si.status = "Done" WHERE si.id = ${dataExcel[0][0].id};`
                    );

                } catch (error) {
                    if (error.message === "Cannot read properties of undefined (reading '3')") {
                        await strapi.db.connection.context.raw(
                            `UPDATE status_imports si SET si.status = "Done" WHERE si.id = ${dataExcel[0][0].id};`
                        );
                    } else {
                        await strapi.db.connection.context.raw(
                            `UPDATE status_imports si SET si.status = "Failed" WHERE si.id = ${dataExcel[0][0].id};`
                        );
                    }
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
