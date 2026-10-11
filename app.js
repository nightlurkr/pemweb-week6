const daftarEl = document.getElementById("daftar");
const kosongEl = document.getElementById("kosong");
const counterEl = document.getElementById("counter");
const formEl = document.getElementById("form-tugas");
const judulEl = document.getElementById("judul");
const matkulEl = document.getElementById("matkul");
const deadlineEl = document.getElementById("deadline");
const errorEl = document.getElementById("error");
const filterEl = document.getElementById("filter");

let filterAktif = "semua";

let tugas = [];

function tampil(t) {
  if (filterAktif === "aktif") return !t.selesai;
  if (filterAktif === "selesai") return t.selesai;
  return true;
}

function render() {
  daftarEl.textContent = "";

  const terlihat = tugas.filter(tampil);

  for (const t of terlihat) {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    if (t.selesai) li.classList.add("selesai");

    const centang = document.createElement("input");
    centang.type = "checkbox";
    centang.checked = t.selesai;

    const judul = document.createElement("span");
    judul.className = "judul";
    judul.textContent = t.judul;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = `${t.matkul} · deadline ${t.deadline}`;

    const isi = document.createElement("div");
    isi.className = "isi";
    isi.append(judul, meta);

    const hapus = document.createElement("button");
    hapus.type = "button";
    hapus.className = "btn-hapus";
    hapus.textContent = "×";

    li.append(centang, isi, hapus);
    daftarEl.append(li);
  }

  const jumlahAktif = tugas.filter((t) => !t.selesai).length;
  counterEl.textContent = `${jumlahAktif} tugas aktif`;
  kosongEl.hidden = terlihat.length > 0;
}

function tampilError(pesan) {
  errorEl.textContent = pesan;
  errorEl.hidden = false;
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const judul = judulEl.value.trim();
  const deadline = deadlineEl.value;

  if (judul.length < 3) {
    tampilError("Judul tugas minimal 3 karakter.");
    return;
  }

  if (!deadline) {
    tampilError("Deadline wajib diisi.");
    return;
  }

  errorEl.hidden = true;

  tugas.push({
    id: Date.now(),
    judul: judul,
    matkul: matkulEl.value,
    deadline: deadline,
    selesai: false,
  });

  formEl.reset();
  judulEl.focus();
  render();
});

daftarEl.addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (event.target.matches(".btn-hapus")) {
    tugas = tugas.filter((t) => t.id !== id);
    render();
  } else if (event.target.matches("input[type='checkbox']")) {
    const item = tugas.find((t) => t.id === id);
    item.selesai = event.target.checked;
    render();
  }
});

filterEl.addEventListener("click", (event) => {
  if (!event.target.matches("button")) return;

  filterAktif = event.target.dataset.filter;

  for (const tombol of filterEl.children) {
    tombol.classList.toggle("on", tombol === event.target);
  }

  render();
});

async function api(url, opsi) {
  const res = await fetch(url, opsi);

  if (!res.ok) {
    let pesan = `Permintaan gagal (${res.status})`;
    try {
      const body = await res.json();
      if (body && body.pesan) pesan = body.pesan;
    } catch (e) {
      // respons tanpa body JSON, pakai pesan default
    }
    throw new Error(pesan);
  }

  if (res.status === 204) return null;
  return res.json();
}

function isiPilihanMatkul(daftar) {
  matkulEl.textContent = "";
  for (const nama of daftar) {
    const opsi = document.createElement("option");
    opsi.textContent = nama;
    matkulEl.append(opsi);
  }
}

async function muat() {
  const [dariServer, daftarMatkul] = await Promise.all([
    api("/api/tugas"),
    api("/api/matkul"),
  ]);

  tugas = dariServer;
  isiPilihanMatkul(daftarMatkul);
  render();
}

muat();
