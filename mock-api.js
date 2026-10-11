(() => {
  let mode = "normal";
  let idBerikutnya = 3;

  const daftarMatkul = [
    "Pemrograman Web",
    "Basis Data",
    "Keamanan Jaringan Komputer",
    "Tata Kelola TI",
    "Ethical Hacking",
    "IoT",
    "Komdat Jarkom",
  ];

  let data = [
    { id: 1, judul: "Lab 10 event delegation", matkul: "Pemrograman Web", deadline: "2026-10-08", selesai: false },
    { id: 2, judul: "Ringkasan materi async/await", matkul: "Pemrograman Web", deadline: "2026-10-10", selesai: false },
  ];

  function respons(status, body) {
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status: status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fetchAsli = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    const opsi = init || {};

    if (!url.includes("/api/")) return fetchAsli(input, init);

    await new Promise((lanjut) => setTimeout(lanjut, mode === "lambat" ? 2500 : 300));

    if (mode === "offline") throw new TypeError("Failed to fetch");

    const metode = (opsi.method || "GET").toUpperCase();
    const body = opsi.body ? JSON.parse(opsi.body) : null;
    const cocok = url.match(/\/api\/tugas\/(\d+)/);
    const id = cocok ? Number(cocok[1]) : null;

    if (url.includes("/api/matkul")) return respons(200, daftarMatkul);

    if (metode === "GET") return respons(200, data);

    if (metode === "POST") {
      if (!body || typeof body.judul !== "string" || body.judul.trim().length < 3) {
        return respons(400, { pesan: "Judul tugas minimal 3 karakter." });
      }
      if (!body.deadline) {
        return respons(400, { pesan: "Deadline wajib diisi." });
      }
      const baru = {
        id: idBerikutnya++,
        judul: body.judul.trim(),
        matkul: body.matkul,
        deadline: body.deadline,
        selesai: false,
      };
      data.push(baru);
      return respons(201, baru);
    }

    if (metode === "PATCH") {
      const item = data.find((t) => t.id === id);
      if (!item) return respons(404, { pesan: "Tugas tidak ditemukan." });
      Object.assign(item, body);
      return respons(200, item);
    }

    if (metode === "DELETE") {
      if (!data.some((t) => t.id === id)) return respons(404, { pesan: "Tugas tidak ditemukan." });
      data = data.filter((t) => t.id !== id);
      return respons(204);
    }

    return respons(405, { pesan: "Metode tidak didukung." });
  };

  window.__API = {
    setMode(nilai) {
      if (!["normal", "offline", "lambat"].includes(nilai)) {
        throw new Error('mode harus "normal", "offline", atau "lambat"');
      }
      mode = nilai;
      console.log(`[mock api] mode = ${mode}`);
    },
    getMode: () => mode,
  };
})();
