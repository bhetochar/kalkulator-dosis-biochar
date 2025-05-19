document.addEventListener('DOMContentLoaded', () => {
    const csvFilePath = 'data/data_biochar.csv'; // Pastikan path ini benar
    let biocharData = [];

    // Elemen DOM
    const phSelect = document.getElementById('phTanah');
    const teksturSelect = document.getElementById('teksturTanah');
    const organikSelect = document.getElementById('kandunganOrganik');
    const aplikasiSelect = document.getElementById('tipeAplikasi');
    const calculateButton = document.getElementById('calculateButton');
    const dosisOutputDiv = document.getElementById('rekomendasiDosis');
    const catatanOutputDiv = document.getElementById('catatanPenting');

    // Nama kolom di CSV Anda (sesuaikan jika berbeda persis)
    const COL_PH = 'Kategori pH Tanah';
    const COL_TEKSTUR = 'Kategori Tekstur/Fisik Tanah';
    const COL_BO = 'Kategori Bahan Organik (BO)';
    const COL_SPOT = 'Konversi Aplikasi SPOT (g/lubang ~30L)**';
    const COL_BAND = 'Konversi Aplikasi BAND/FURROW (g/m lajur)***';
    const COL_AREA = 'Rekomendasi Dosis Dasar Biochar Aktif (kg/m²)*';
    const COL_CATATAN = 'Fokus Utama Aplikasi & CATATAN PENTING (untuk Pengguna Awam)';

    // Fungsi untuk mem-parse CSV sederhana
    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(value => value.trim());
            if (values.length === headers.length) {
                const entry = {};
                headers.forEach((header, index) => {
                    entry[header] = values[index];
                });
                data.push(entry);
            }
        }
        return data;
    }

    // Fungsi untuk mengisi dropdown dengan opsi unik
    function populateDropdown(selectElement, items, placeholder) {
        selectElement.innerHTML = `<option value="">-- Pilih ${placeholder} --</option>`; // Placeholder
        const uniqueItems = [...new Set(items.filter(item => item))]; // Filter item kosong dan ambil unik
        uniqueItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }

    // Memuat dan memproses data CSV
    fetch(csvFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - Gagal memuat ${csvFilePath}`);
            }
            return response.text();
        })
        .then(csvText => {
            biocharData = parseCSV(csvText);
            if (biocharData.length === 0) {
                console.error("Tidak ada data yang berhasil diparse dari CSV atau CSV kosong.");
                phSelect.innerHTML = '<option value="">Gagal muat data pH</option>';
                teksturSelect.innerHTML = '<option value="">Gagal muat data Tekstur</option>';
                organikSelect.innerHTML = '<option value="">Gagal muat data BO</option>';
                return;
            }

            // Isi dropdown
            populateDropdown(phSelect, biocharData.map(row => row[COL_PH]), 'pH Tanah');
            populateDropdown(teksturSelect, biocharData.map(row => row[COL_TEKSTUR]), 'Tekstur Tanah');
            populateDropdown(organikSelect, biocharData.map(row => row[COL_BO]), 'Kandungan Organik');
        })
        .catch(error => {
            console.error("Error memuat atau memproses CSV:", error);
            dosisOutputDiv.innerHTML = `<p><strong>Error:</strong> Gagal memuat data panduan. ${error.message}</p>`;
            phSelect.innerHTML = '<option value="">Error</option>';
            teksturSelect.innerHTML = '<option value="">Error</option>';
            organikSelect.innerHTML = '<option value="">Error</option>';
        });

    // Fungsi untuk menampilkan hasil
    function displayResults() {
        const selectedPh = phSelect.value;
        const selectedTekstur = teksturSelect.value;
        const selectedOrganik = organikSelect.value;
        const selectedAplikasi = aplikasiSelect.value;

        if (!selectedPh || !selectedTekstur || !selectedOrganik || !selectedAplikasi) {
            dosisOutputDiv.innerHTML = `<p><strong>Rekomendasi Dosis:</strong> -</p>`;
            catatanOutputDiv.innerHTML = `<p><strong>Fokus Utama & Catatan Penting:</strong> -</p>`;
            return;
        }

        const matchedRow = biocharData.find(row =>
            row[COL_PH] === selectedPh &&
            row[COL_TEKSTUR] === selectedTekstur &&
            row[COL_BO] === selectedOrganik
        );

        if (matchedRow) {
            let dosis = "Tidak ditemukan";
            if (selectedAplikasi === "Per Lubang") {
                dosis = matchedRow[COL_SPOT] || "Data tidak tersedia";
            } else if (selectedAplikasi === "Per Bedeng") {
                dosis = matchedRow[COL_BAND] || "Data tidak tersedia";
            } else if (selectedAplikasi === "Per Area Tanam") {
                dosis = matchedRow[COL_AREA] || "Data tidak tersedia";
            }

            dosisOutputDiv.innerHTML = `<p><strong>Rekomendasi Dosis:</strong> ${dosis}</p>`;
            catatanOutputDiv.innerHTML = `<p><strong>Fokus Utama & Catatan Penting:</strong> ${matchedRow[COL_CATATAN] || "Tidak ada catatan."}</p>`;
        } else {
            dosisOutputDiv.innerHTML = `<p><strong>Rekomendasi Dosis:</strong> Kombinasi input tidak ditemukan.</p>`;
            catatanOutputDiv.innerHTML = `<p><strong>Fokus Utama & Catatan Penting:</strong> Kombinasi input tidak ditemukan.</p>`;
        }
    }

    // Tambahkan event listener ke tombol
    calculateButton.addEventListener('click', displayResults);
});