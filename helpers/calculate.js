const getMorKombinasi = (value) => {
    let newHasil = Number(value).toFixed(2)

    let hasil2 = Math.floor(newHasil)
    result_mor = (hasil2 * 0.5) + 0.8

    if (value >= 21) {
        result_mor = 5
    }

    return result_mor;
};

const getNilaiAkhirMOR = (kehadiran, hmxproduksi, ifrxhazard) => {

    let kategori
    let catatan_1
    let catatan_2
    let catatan_3

    let value = kehadiran + hmxproduksi + ifrxhazard

    if (value <= 1.99) {
        kategori = "K"
    } else if (value >= 2.00 && value <= 2.99) {
        kategori = "C"
    } else if (value >= 3.00 && value <= 3.99) {
        kategori = "B"
    } else if (value >= 4.00 && value <= 4.99) {
        kategori = "BS"
    } else if (value >= 5.00) {
        kategori = "IST"
    } else {
        kategori = "error"
    }

    if (kehadiran <= 1.99) {
        catatan_1 = "Kehadiran yang tidak teratur ini dapat mengganggu produktivitas tim dan menciptakan ketidakstabilan pada lingkungan kerja. Komunikasikan kepada GL Man Power selambat-lambatnya pada hari pertama jika tidak berangkat bekerja disertai dengan alasan logis (Surat Dokter, Surat Tugas, Surat Izin Resmi sesuai peraturan perundang-undangan dan atau peraturan perusahaan, dsb.). Dilarang pulang lebih awal dari waktu yang telah ditentukan tanpa izin atau alasan yang tidak dapat diterima."
    } else if (kehadiran >= 2.00 && kehadiran <= 2.99) {
        catatan_1 = "Kehadiran yang tidak teratur ini dapat mengganggu produktivitas tim dan menciptakan ketidakstabilan pada lingkungan kerja. Komunikasikan kepada GL Man Power selambat-lambatnya pada hari pertama jika tidak berangkat bekerja disertai dengan alasan logis (Surat Dokter, Surat Tugas, Surat Izin Resmi sesuai peraturan perundang-undangan dan atau peraturan perusahaan, dsb.). Dilarang pulang lebih awal dari waktu yang telah ditentukan tanpa izin atau alasan yang tidak dapat diterima."
    } else if (kehadiran >= 3.00 && kehadiran <= 3.99) {
        catatan_1 = "Kehadiran yang tidak teratur ini dapat mengganggu produktivitas tim dan menciptakan ketidakstabilan pada lingkungan kerja. Komunikasikan kepada GL Man Power selambat-lambatnya pada hari pertama jika tidak berangkat bekerja disertai dengan alasan logis (Surat Dokter, Surat Tugas, Surat Izin Resmi sesuai peraturan perundang-undangan dan atau peraturan perusahaan, dsb.). Dilarang pulang lebih awal dari waktu yang telah ditentukan tanpa izin atau alasan yang tidak dapat diterima."
    } else if (kehadiran >= 4.00 && kehadiran <= 4.99) {
        catatan_1 = "Terima kasih atas usaha anda dalam mempertahankan tingkat kehadrian (ATR) sesuai dengan yang sudah ditentukan. Harapannya pencapaian seperti ini dapat dipertahankan pada periode bulan selanjutnya."
    } else if (kehadiran >= 5.00) {
        catatan_1 = "Terima kasih atas usaha anda dalam mempertahankan tingkat kehadrian (ATR) sesuai dengan yang sudah ditentukan. Harapannya pencapaian seperti ini dapat dipertahankan pada periode bulan selanjutnya."
    } else {
        kategori = "error"
    }

    if (hmxproduksi <= 1.99) {
        catatan_2 = "Tidak menunjukkan inisiatif bekerja lebih baik untuk memenuhi target kerja yang ditentukan. Dilarang membiarkan mesin/unit tanpa melakukan aktivitas pekerjaan (ngompor)."
    } else if (kehadiran >= 2.00 && kehadiran <= 2.99) {
        catatan_2 = "Tidak menunjukkan inisiatif bekerja lebih baik untuk memenuhi target kerja yang ditentukan. Dilarang membiarkan mesin/unit tanpa melakukan aktivitas pekerjaan (ngompor)."
    } else if (kehadiran >= 3.00 && kehadiran <= 3.99) {
        catatan_2 = "Tidak menunjukkan inisiatif bekerja lebih baik untuk memenuhi target kerja yang ditentukan. Dilarang membiarkan mesin/unit tanpa melakukan aktivitas pekerjaan (ngompor)."
    } else if (kehadiran >= 4.00 && kehadiran <= 4.99) {
        catatan_2 = "Tidak menunjukkan inisiatif bekerja lebih baik untuk memenuhi target kerja yang ditentukan. Dilarang membiarkan mesin/unit tanpa melakukan aktivitas pekerjaan (ngompor)."
    } else if (kehadiran >= 5.00) {
        catatan_2 = "Terima kasih telah proaktif dalam pelaporan timesheet dan pelaporan ritase kepada CCR. Terima kasih atas kontribusi anda terhadap pencapaian produksi, harapannya pencapaian seperti ini dapat ditingkatkan pada periode bulan selanjutnya."
    } else {
        kategori = "error"
    }

    if (hmxproduksi <= 1.99) {
        catatan_3 = "Tidak berperan aktif dalam menciptakan lingkungan kerja yang aman dengan tidak melaporkan temuan KTA/TTA pada area kerja. Laporkan temuan KTA/TTA minimal 4 temuan dalam 1 bulan."
    } else if (kehadiran >= 2.00 && kehadiran <= 2.99) {
        catatan_3 = "Tidak berperan aktif dalam menciptakan lingkungan kerja yang aman dengan tidak melaporkan temuan KTA/TTA pada area kerja. Laporkan temuan KTA/TTA minimal 4 temuan dalam 1 bulan."
    } else if (kehadiran >= 3.00 && kehadiran <= 3.99) {
        catatan_3 = "Tidak berperan aktif dalam menciptakan lingkungan kerja yang aman dengan tidak melaporkan temuan KTA/TTA pada area kerja. Laporkan temuan KTA/TTA minimal 4 temuan dalam 1 bulan."
    } else if (kehadiran >= 4.00 && kehadiran <= 4.99) {
        catatan_3 = "Tidak berperan aktif dalam menciptakan lingkungan kerja yang aman dengan tidak melaporkan temuan KTA/TTA pada area kerja. Laporkan temuan KTA/TTA minimal 4 temuan dalam 1 bulan."
    } else if (kehadiran >= 5.00) {
        catatan_3 = "Terima kasih atas kontribusi anda dalam melaporkan temuan KTA/TTA pada area kerja anda. Harapannya pencapaian seperti ini dapat ditingkatkan pada periode bulan selanjutnya."
    } else {
        kategori = "error"
    }

    return {
        kategori: kategori,
        catatan_1: catatan_1,
        catatan_2: catatan_2,
        catatan_3: catatan_3
    }

};

const getFormatDate = (value) => {

    let newDate = value.split("/")
    let monthDate = Number(newDate[1])

    const month = [
        {
            value: 'Januari',
            label: 'Januari'
        },
        {
            value: 'Februari',
            label: 'Februari'
        },
        {
            value: 'Maret',
            label: 'Maret'
        },
        {
            value: 'April',
            label: 'April'
        },
        {
            value: 'Mei',
            label: 'Mei'
        },
        {
            value: 'Juni',
            label: 'Juni'
        },
        {
            value: 'Juli',
            label: 'Juli'
        },
        {
            value: 'Agustus',
            label: 'Agustus'
        },
        {
            value: 'September',
            label: 'September'
        },
        {
            value: 'Oktober',
            label: 'Oktober'
        },
        {
            value: 'November',
            label: 'November'
        },
        {
            value: 'Desember',
            label: 'Desember'
        },
    ];

    let newMonth = month[monthDate - 1]

    return `${newDate[0]} ${newMonth.label} ${newDate[2]}`;
};

let getStatus = (date) => {
    if (date.length !== 0 && date !== "Invalid Date") {
        let dateNow = new Date().toISOString().slice(0, 10).split("-")
        let endDate = date.split("/")
        if (Number(endDate[2]) > Number(dateNow[0])) {
            return "AKTIF"
        } else if (Number(endDate[2]) == Number(dateNow[0]) && Number(endDate[1]) > Number(dateNow[1])) {
            return "AKTIF"
        } else if (Number(endDate[2]) == Number(dateNow[0]) && Number(endDate[1]) == Number(dateNow[1]) && Number(endDate[0]) > Number(dateNow[2])) {
            return "AKTIF"
        } else {
            return "NON-AKTIF"
        }
    } else {
        return "-"
    }
}

module.exports = {
    getMorKombinasi, getNilaiAkhirMOR, getFormatDate, getStatus,
}