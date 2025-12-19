import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const { data: html } = await axios.get('https://shortq.info/jadwalprediksi', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const $ = cheerio.load(html);
    const results = [];
    let isPredictionSection = false;

    // Mengambil semua teks dan membaginya per baris
    const allText = $('body').text().split('\n');

    allText.forEach((line) => {
      const cleanLine = line.trim();

      // 1. Deteksi awal bagian Prediksi
      if (cleanLine.includes("PREDIKSI SCORE BOLA")) {
        isPredictionSection = true;
        return;
      }

      // 2. Jika sudah di area prediksi, cari baris yang punya format waktu & skor
      // Contoh target: "20/12 03:00 WIB Valencia VS Mallorca 3 : 0"
      if (isPredictionSection && cleanLine.includes("VS") && cleanLine.includes(":")) {
        
        // Regex untuk membedah data
        const timeMatch = cleanLine.match(/^(\d{2}\/\d{2}\s\d{2}:\d{2}\sWIB)/);
        const scoreMatch = cleanLine.match(/(\d+)\s:\s(\d+)$/);
        
        if (timeMatch && scoreMatch) {
          const time = timeMatch[1];
          const fullScore = scoreMatch[0];
          const scoreHome = scoreMatch[1];
          const scoreAway = scoreMatch[2];

          // Mengambil bagian tengah (Nama Tim)
          // Menghapus waktu dari depan dan skor dari belakang
          let teamsPart = cleanLine.replace(time, "").replace(fullScore, "").trim();
          const teams = teamsPart.split(" VS ");

          results.push({
            waktu: time,
            home_team: teams[0]?.trim(),
            away_team: teams[1]?.trim(),
            skor_home: parseInt(scoreHome),
            skor_away: parseInt(scoreAway),
            full_text: cleanLine
          });
        }
      }
    });

    // Menghasilkan JSON yang rapi
    res.status(200).json({
      last_updated: new Date().toISOString(),
      total_data: results.length,
      predictions: results
    });

  } catch (error) {
    res.status(500).json({ error: 'Scraping failed', message: error.message });
  }
}
