export default async function handler(req, res) {
  try {
    const response = await fetch("https://shortq.info/jadwalprediksi");
    const html = await response.text();

    const scores = [];
    const regex = /(\d+)\s*-\s*(\d+)/g;
    let m;

    while ((m = regex.exec(html)) !== null) {
      scores.push(m[0]);
    }

    res.status(200).json({
      total: scores.length,
      prediksi_score: scores
    });
  } catch (e) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
}
