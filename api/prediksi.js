import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const { data } = await axios.get('https://shortq.info/jadwalprediksi');
    const $ = cheerio.load(data);
    
    let hasil = [];
    let isPrediksiSection = false;

    // Ambil semua teks dari tag <p> atau <div> (sesuaikan dengan struktur webnya)
    $('p, div').each((i, el) => {
      const text = $(el).text().trim();
      
      // Tandai jika sudah masuk ke area "PREDIKSI SCORE"
      if (text.includes("PREDIKSI SCORE BOLA")) {
        isPrediksiSection = true;
      }

      // Jika di dalam section prediksi, ambil baris yang punya format skor (:)
      if (isPrediksiSection && text.includes("VS") && text.includes(":")) {
        hasil.push({
          pertandingan: text
        });
      }
    });

    res.status(200).json({ status: 'success', data: hasil });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
}
