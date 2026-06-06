import { useState } from 'react'
import './App.css'

const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

const stikerReady = [
  { id: 1, nama: 'Snoopy Balon', harga: 9500, kategori: 'Karakter', img: '/snoopy.jpg' },
  { id: 2, nama: 'Meme Stiker', harga: 9500, kategori: 'Meme', img: '/memes.jpg' },
  { id: 3, nama: 'Spiderman Logo', harga: 9500, kategori: 'Karakter', img: '/spiderman.jpg' },
  { id: 4, nama: 'Spotify Code', harga: 9500, kategori: 'Aesthetic', img: '/spotify.jpg' },
  { id: 5, nama: 'Stiker Emoji', harga: 9500, kategori: 'Cute', img: '/emoji.jpg' },
  { id: 6, nama: 'Stiker Tulisan', harga: 9500, kategori: 'Quotes', img: '/tulisan.jpg' },
  { id: 7, nama: 'JDM Car', harga: 9500, kategori: 'JDM', img: '/jdm.jpg' },
  { id: 8, nama: 'Hello Letters', harga: 9500, kategori: 'Aesthetic', img: '/letters.jpg' },
  { id: 9, nama: 'Stiker Buah', harga: 9500, kategori: 'Cute', img: '/fruits.jpg' },
  { id: 10, nama: 'Others', harga: 9500, kategori: 'Lainnya', img: '/others.jpg' },
]

const paket = [
  { id: 'paket1', nama: 'Paket Custom 5 Stiker', harga: 60000, deskripsi: '5 custom sticker sesuai desain kamu', emoji: '🎨' },
  { id: 'paket2', nama: 'Paket 10 Stiker Siap Jual', harga: 95000, deskripsi: '10 sticker random best seller', emoji: '📦' },
]

export default function App() {
  const [halaman, setHalaman] = useState('home')
  const [keranjang, setKeranjang] = useState([])
  const [showKeranjang, setShowKeranjang] = useState(false)
  const [pesanSukses, setPesanSukses] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const [adminLogin, setAdminLogin] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [adminError, setAdminError] = useState('')
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('stikerku_orders')
    return saved ? JSON.parse(saved) : []
  })

  const [formCustom, setFormCustom] = useState({
    nama: '', noHp: '', bahan: 'vinyl', jumlah: '5',
    warna: 'full color', deskripsi: '', gambar: null,
    gambarPreview: null, gambarUrl: '',
  })
  const [errorCustom, setErrorCustom] = useState({})
  const [submitSukses, setSubmitSukses] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  const handleTambahKeranjang = (item) => {
    const ada = keranjang.find(k => k.id === item.id)
    if (ada) {
      setKeranjang(keranjang.map(k => k.id === item.id ? { ...k, qty: k.qty + 1 } : k))
    } else {
      setKeranjang([...keranjang, { ...item, qty: 1 }])
    }
    setPesanSukses(`"${item.nama}" ditambahkan ke keranjang!`)
    setTimeout(() => setPesanSukses(''), 2500)
  }

  const handleHapusKeranjang = (id) => {
    setKeranjang(keranjang.filter(k => k.id !== id))
  }

  const totalHarga = keranjang.reduce((acc, k) => acc + k.harga * k.qty, 0)
  const totalItem = keranjang.reduce((a, k) => a + k.qty, 0)

  const handleChangeCustom = (e) => {
    const { name, value } = e.target
    setFormCustom({ ...formCustom, [name]: value })
    setErrorCustom({ ...errorCustom, [name]: '' })
  }

  const handleGambar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setErrorCustom(prev => ({ ...prev, gambar: '' }))
    setUploadLoading(true)
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      const maxSize = 400
      let w = img.width, h = img.height
      if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize } }
      else { if (h > maxSize) { w = w * maxSize / h; h = maxSize } }
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      const base64 = canvas.toDataURL('image/jpeg', 0.7)
      setFormCustom(prev => ({ ...prev, gambar: file, gambarPreview: base64, gambarUrl: base64 }))
      setUploadLoading(false)
    }
    img.src = URL.createObjectURL(file)
  }

  const handleSubmitCustom = (e) => {
    e.preventDefault()
    const err = {}
    if (!formCustom.nama) err.nama = 'Nama wajib diisi'
    if (!formCustom.noHp) err.noHp = 'No. HP wajib diisi'
    if (!formCustom.deskripsi) err.deskripsi = 'Deskripsi wajib diisi'
    if (!formCustom.gambar) err.gambar = 'Gambar wajib diunggah'
    if (Object.keys(err).length > 0) { setErrorCustom(err); return }

    const orderBaru = {
      id: Date.now(),
      tanggal: new Date().toLocaleString('id-ID'),
      nama: formCustom.nama,
      noHp: formCustom.noHp,
      bahan: formCustom.bahan,
      jumlah: formCustom.jumlah,
      warna: formCustom.warna,
      deskripsi: formCustom.deskripsi,
      gambarUrl: formCustom.gambarUrl || '',
      status: 'Baru',
    }
    const ordersBaru = [orderBaru, ...orders]
    setOrders(ordersBaru)
    localStorage.setItem('stikerku_orders', JSON.stringify(ordersBaru))
    setSubmitSukses(true)
    setFormCustom({ nama: '', noHp: '', bahan: 'vinyl', jumlah: '5', warna: 'full color', deskripsi: '', gambar: null, gambarPreview: null, gambarUrl: '' })
  }

  const navTo = (page) => {
    setHalaman(page)
    setMenuOpen(false)
    if (page === 'admin') { setAdminLogin(false); setAdminPass('') }
  }

  return (
    <div className="min-h-screen bg-[#F0FAF6]" style={{ fontFamily: 'Nunito, sans-serif' }}>

      {/* NAVBAR */}
      <nav className="bg-[#04342C] px-4 md:px-8 py-4 sticky top-0 z-50 shadow-lg">
        <div className="flex justify-between items-center">
          <div onClick={() => navTo('home')} className="text-xl font-extrabold text-[#9FE1CB] cursor-pointer">
            🏷️ StikerKikir
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-6 items-center">
            {[['home','Home'],['shop','Shop'],['custom','Custom Order'],['admin','🔒 Admin']].map(([page, label]) => (
              <button key={page} onClick={() => navTo(page)}
                className={`bg-transparent border-none cursor-pointer text-sm font-bold pb-1 transition-all
                  ${halaman === page ? 'text-[#9FE1CB] border-b-2 border-[#9FE1CB]' : 'text-[#5DCAA5] border-b-2 border-transparent'}`}>
                {label}
              </button>
            ))}
            <button onClick={() => setShowKeranjang(!showKeranjang)}
              className="bg-[#1D9E75] text-white border-none rounded-full px-5 py-2 font-extrabold cursor-pointer text-sm">
              🛒 {totalItem}
            </button>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden gap-3 items-center">
            <button onClick={() => setShowKeranjang(!showKeranjang)}
              className="bg-[#1D9E75] text-white border-none rounded-full px-4 py-1.5 font-extrabold cursor-pointer text-sm">
              🛒 {totalItem}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="bg-transparent border-none text-[#9FE1CB] text-2xl cursor-pointer">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-1 mt-4 pb-2 border-t border-[#0F6E56] pt-4">
            {[['home','Home'],['shop','Shop'],['custom','Custom Order'],['admin','🔒 Admin']].map(([page, label]) => (
              <button key={page} onClick={() => navTo(page)}
                className={`text-left bg-transparent border-none cursor-pointer text-sm font-bold py-2 px-2 rounded-lg
                  ${halaman === page ? 'text-[#9FE1CB] bg-[#0F6E56]' : 'text-[#5DCAA5]'}`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* NOTIF */}
      {pesanSukses && (
        <div className="bg-[#1D9E75] text-white text-center py-2 font-bold text-sm px-4">
          ✅ {pesanSukses}
        </div>
      )}

      {/* KERANJANG */}
      {showKeranjang && (
        <div className="fixed top-[70px] right-3 md:right-6 bg-white rounded-2xl shadow-2xl p-5 w-[90vw] max-w-[340px] z-[200] border border-[#9FE1CB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-[#04342C] text-lg">🛒 Keranjang</h3>
            <button onClick={() => setShowKeranjang(false)} className="bg-transparent border-none text-xl cursor-pointer text-[#0F6E56]">✕</button>
          </div>
          {keranjang.length === 0 ? (
            <p className="text-gray-400 text-center py-5">Keranjang masih kosong</p>
          ) : (
            <>
              {keranjang.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-2 px-3 py-2 bg-[#E1F5EE] rounded-xl">
                  <span className="text-sm text-[#04342C]">{item.nama} <b>x{item.qty}</b></span>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold text-[#1D9E75] text-xs">Rp {(item.harga * item.qty).toLocaleString('id-ID')}</span>
                    <button onClick={() => handleHapusKeranjang(item.id)} className="bg-[#04342C] text-white border-none rounded px-2 py-0.5 cursor-pointer text-xs">✕</button>
                  </div>
                </div>
              ))}
              <hr className="my-3 border-[#9FE1CB]" />
              <div className="font-extrabold text-base mb-3 text-[#04342C]">
                Total: Rp {totalHarga.toLocaleString('id-ID')}
              </div>
              <button className="w-full bg-[#04342C] text-[#9FE1CB] border-none rounded-xl py-3 font-extrabold cursor-pointer text-sm">
                Checkout via WhatsApp 💬
              </button>
            </>
          )}
        </div>
      )}

      {/* ======= HOME ======= */}
      {halaman === 'home' && (
        <div>
          <div className="bg-gradient-to-br from-[#04342C] to-[#0F6E56] py-16 md:py-24 px-4 md:px-8 text-center">
            <div className="text-5xl md:text-6xl mb-4">🏷️✨</div>
            <h1 className="text-2xl md:text-4xl font-black mb-3 text-[#9FE1CB]">Make your own stickers</h1>
            <p className="text-base md:text-lg mb-8 text-[#E1F5EE] max-w-lg mx-auto">Custom stickers and best seller stickers design!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button onClick={() => setHalaman('shop')} className="bg-[#9FE1CB] text-[#04342C] border-none rounded-full px-8 py-3 font-extrabold text-base cursor-pointer w-full sm:w-auto">🛍️ Lihat Shop</button>
              <button onClick={() => setHalaman('custom')} className="bg-transparent text-[#9FE1CB] border-2 border-[#9FE1CB] rounded-full px-8 py-3 font-extrabold text-base cursor-pointer w-full sm:w-auto">🎨 Custom Order</button>
            </div>
          </div>

          <div className="py-12 px-4 md:px-8 max-w-4xl mx-auto">
            <h2 className="text-center text-2xl font-black mb-8 text-[#04342C]">📦 Paket Kikir</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {paket.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-md border-2 border-[#9FE1CB]">
                  <div className="text-5xl mb-3">{p.emoji}</div>
                  <h3 className="font-extrabold text-lg mb-2 text-[#04342C]">{p.nama}</h3>
                  <p className="text-[#0F6E56] mb-4 text-sm">{p.deskripsi}</p>
                  <div className="text-3xl font-black text-[#1D9E75] mb-4">Rp {p.harga.toLocaleString('id-ID')}</div>
                  <button onClick={() => handleTambahKeranjang(p)} className="bg-[#04342C] text-[#9FE1CB] border-none rounded-full px-7 py-3 font-extrabold cursor-pointer text-sm w-full sm:w-auto">Tambah ke Keranjang</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#E1F5EE] py-12 px-4 md:px-8 text-center">
            <h2 className="text-2xl font-black mb-8 text-[#04342C]">💎 Kenapa StikerKikir?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: '🎨', judul: 'Full Custom', teks: 'Bisa desain sendiri cikk!!' },
                { icon: '⚡', judul: 'Proses Cepat', teks: 'kerjaan kite cepet' },
                { icon: '💎', judul: 'Kualitas Premium', teks: 'Bahan premium dah pokoknya' },
                { icon: '💸', judul: 'Harga Kikir', teks: 'Mulai Rp 9.500/pcs' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#9FE1CB]">
                  <div className="text-3xl md:text-4xl mb-2">{item.icon}</div>
                  <h4 className="font-extrabold mb-1 text-[#04342C] text-sm md:text-base">{item.judul}</h4>
                  <p className="text-[#0F6E56] text-xs md:text-sm">{item.teks}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======= SHOP ======= */}
      {halaman === 'shop' && (
        <div className="py-8 px-4 md:px-8 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-[#04342C]">🛍️ Best seller nihh</h2>
          <p className="text-[#0F6E56] mb-6 text-sm md:text-base">Gas lahh beli gausah banyak cacicu</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5 mb-12">
            {stikerReady.map(stiker => (
              <div key={stiker.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#9FE1CB]">
                <div className="w-full h-32 md:h-40 bg-[#E1F5EE] flex items-center justify-center">
                  <img src={stiker.img} alt={stiker.nama}
                    className="w-full h-full object-contain p-2 md:p-3"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <div className="p-3 md:p-4 text-center">
                  <h4 className="font-bold text-xs md:text-sm mb-1 text-[#04342C]">{stiker.nama}</h4>
                  <span className="bg-[#E1F5EE] text-[#0F6E56] text-xs px-2 py-0.5 rounded-full font-bold">{stiker.kategori}</span>
                  <div className="font-black text-[#1D9E75] my-2 text-sm md:text-base">Rp {stiker.harga.toLocaleString('id-ID')}</div>
                  <button onClick={() => handleTambahKeranjang(stiker)} className="w-full bg-[#04342C] text-[#9FE1CB] border-none rounded-full py-1.5 md:py-2 font-bold cursor-pointer text-xs">+ Keranjang</button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl md:text-2xl font-black mb-4 text-[#04342C]">📦 Paket Kikir</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {paket.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-5 md:p-7 flex items-center gap-4 md:gap-5 shadow-md border border-[#9FE1CB]">
                <div className="text-4xl md:text-5xl">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold mb-1 text-[#04342C] text-sm md:text-base">{p.nama}</h3>
                  <p className="text-[#0F6E56] text-xs mb-2">{p.deskripsi}</p>
                  <div className="font-black text-[#1D9E75] text-lg md:text-xl">Rp {p.harga.toLocaleString('id-ID')}</div>
                </div>
                <button onClick={() => handleTambahKeranjang(p)} className="bg-[#04342C] text-[#9FE1CB] border-none rounded-xl px-3 md:px-4 py-2 font-extrabold cursor-pointer text-sm shrink-0">Beli</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======= CUSTOM ORDER ======= */}
      {halaman === 'custom' && (
        <div className="py-8 px-4 md:px-8 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-[#04342C]">🎨 Custom Order</h2>
          <p className="text-[#0F6E56] mb-6 text-sm md:text-base">Desain sendiri stiker lau cikk!!</p>

          {submitSukses ? (
            <div className="bg-[#E1F5EE] border-2 border-[#1D9E75] rounded-2xl p-8 md:p-12 text-center">
              <div className="text-5xl md:text-6xl mb-4">🎉</div>
              <h3 className="font-black text-xl md:text-2xl text-[#04342C] mb-2">Pesanan Diterima!</h3>
              <p className="text-[#0F6E56] mb-6 text-sm md:text-base">Tim sticker akan segera menghubungi mu</p>
              <button onClick={() => setSubmitSukses(false)} className="bg-[#04342C] text-[#9FE1CB] border-none rounded-full px-7 py-3 font-extrabold cursor-pointer">Buat Order Lagi</button>
            </div>
          ) : (
            <form onSubmit={handleSubmitCustom} className="bg-white rounded-2xl p-5 md:p-8 shadow-lg border border-[#9FE1CB]">
              <div className="mb-4">
                <label className="block font-bold mb-1 text-[#04342C] text-sm">Nama Lengkap *</label>
                <input name="nama" value={formCustom.nama} onChange={handleChangeCustom} placeholder="Contoh: King Nassir"
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none ${errorCustom.nama ? 'border-red-400' : 'border-[#9FE1CB]'}`} />
                {errorCustom.nama && <p className="text-red-400 text-xs mt-1">⚠️ {errorCustom.nama}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-1 text-[#04342C] text-sm">No. WhatsApp *</label>
                <input name="noHp" value={formCustom.noHp} onChange={handleChangeCustom} placeholder="Contoh: 08123456789"
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none ${errorCustom.noHp ? 'border-red-400' : 'border-[#9FE1CB]'}`} />
                {errorCustom.noHp && <p className="text-red-400 text-xs mt-1">⚠️ {errorCustom.noHp}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block font-bold mb-1 text-[#04342C] text-sm">Bahan Stiker</label>
                  <select name="bahan" value={formCustom.bahan} onChange={handleChangeCustom}
                    className="w-full px-3 py-3 rounded-xl border-2 border-[#9FE1CB] text-sm outline-none bg-white text-[#04342C]">
                    <option value="vinyl">Vinyl (Tahan Air)</option>
                    <option value="kertas">Kertas (Standard)</option>
                    <option value="transparan">Transparan (Clear)</option>
                    <option value="hologram">Hologram ✨</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#04342C] text-sm">Jumlah</label>
                  <select name="jumlah" value={formCustom.jumlah} onChange={handleChangeCustom}
                    className="w-full px-3 py-3 rounded-xl border-2 border-[#9FE1CB] text-sm outline-none bg-white text-[#04342C]">
                    <option value="5">5 pcs — Rp 60.000</option>
                    <option value="10">10 pcs — Rp 110.000</option>
                    <option value="20">20 pcs — Rp 200.000</option>
                    <option value="50">50 pcs — Rp 475.000</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#04342C] text-sm">Warna</label>
                  <select name="warna" value={formCustom.warna} onChange={handleChangeCustom}
                    className="w-full px-3 py-3 rounded-xl border-2 border-[#9FE1CB] text-sm outline-none bg-white text-[#04342C]">
                    <option value="full color">Full Color</option>
                    <option value="hitam putih">Hitam Putih</option>
                    <option value="pastel">Pastel</option>
                    <option value="neon">Neon</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-1 text-[#04342C] text-sm">Upload Gambar / Desain *</label>
                <input type="file" accept="image/*" onChange={handleGambar}
                  className={`w-full p-3 rounded-xl border-2 border-dashed text-sm cursor-pointer ${errorCustom.gambar ? 'border-red-400' : 'border-[#1D9E75]'}`} />
                {errorCustom.gambar && <p className="text-red-400 text-xs mt-1">⚠️ {errorCustom.gambar}</p>}
                {uploadLoading && <p className="text-[#1D9E75] text-xs mt-2 font-bold">⏳ Memproses gambar...</p>}
                {formCustom.gambarPreview && (
                  <div className="mt-3 text-center">
                    <img src={formCustom.gambarPreview} alt="Preview" className="max-w-[160px] max-h-[160px] rounded-xl border-2 border-[#9FE1CB] object-contain mx-auto" />
                    <p className="text-xs text-[#1D9E75] mt-2 font-bold">✅ Gambar siap!</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block font-bold mb-1 text-[#04342C] text-sm">Deskripsi Stiker *</label>
                <textarea name="deskripsi" value={formCustom.deskripsi} onChange={handleChangeCustom}
                  placeholder="Lau mau stiker yang gimana, jelasin aje di sini tapi jelasin yang bener, awas kalo ngawur"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none resize-y ${errorCustom.deskripsi ? 'border-red-400' : 'border-[#9FE1CB]'}`}
                  style={{ fontFamily: 'Nunito, sans-serif' }} />
                {errorCustom.deskripsi && <p className="text-red-400 text-xs mt-1">⚠️ {errorCustom.deskripsi}</p>}
              </div>

              <button type="submit" disabled={uploadLoading}
                className={`w-full border-none rounded-xl py-4 font-black text-base md:text-lg cursor-pointer
                  ${uploadLoading ? 'bg-[#9FE1CB] text-[#04342C] cursor-not-allowed' : 'bg-[#04342C] text-[#9FE1CB]'}`}>
                {uploadLoading ? '⏳ Tunggu sebentar...' : '🎨 Kirim Pesanan Custom'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ======= ADMIN ======= */}
      {halaman === 'admin' && (
        <div className="py-8 px-4 md:px-8 max-w-5xl mx-auto">
          {!adminLogin ? (
            <div className="max-w-sm mx-auto mt-10 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[#9FE1CB]">
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">🔒</div>
                <h2 className="text-2xl font-black text-[#04342C]">Khusus Admin</h2>
                <p className="text-[#0F6E56] text-sm mt-1">Password nya Wok</p>
              </div>
              <input type="password" value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (adminPass === ADMIN_PASSWORD) { setAdminLogin(true); setAdminError('') }
                    else setAdminError('Password salah!')
                  }
                }}
                placeholder="Mana password wok..."
                className="w-full px-4 py-3 rounded-xl border-2 border-[#9FE1CB] text-sm outline-none mb-3" />
              {adminError && <p className="text-red-400 text-xs mb-3">⚠️ {adminError}</p>}
              <button onClick={() => {
                if (adminPass === ADMIN_PASSWORD) { setAdminLogin(true); setAdminError('') }
                else setAdminError('Password salah!')
              }} className="w-full bg-[#04342C] text-[#9FE1CB] border-none rounded-xl py-3 font-extrabold cursor-pointer">
                Masuk
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#04342C]">📋 Admin Panel</h2>
                  <p className="text-[#0F6E56] text-sm">Nih orderan nya min: <b>{orders.length}</b></p>
                </div>
                <div className="flex gap-3">
                  {orders.length > 0 && (
                    <button onClick={() => { if (confirm('Hapus semua order?')) { setOrders([]); localStorage.removeItem('stikerku_orders') } }}
                      className="bg-red-500 text-white border-none rounded-xl px-4 py-2 font-bold cursor-pointer text-sm">
                      🗑️ Hapus Semua
                    </button>
                  )}
                  <button onClick={() => setAdminLogin(false)}
                    className="bg-[#04342C] text-[#9FE1CB] border-none rounded-xl px-4 py-2 font-bold cursor-pointer text-sm">
                    Keluar
                  </button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#9FE1CB]">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-[#0F6E56] font-bold">Sabar, Masih kosong min</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl p-4 md:p-6 border border-[#9FE1CB] shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-extrabold text-base md:text-lg text-[#04342C]">{order.nama}</h3>
                          <p className="text-[#0F6E56] text-xs md:text-sm">📱 {order.noHp} · 🕐 {order.tanggal}</p>
                        </div>
                        <span className="bg-[#E1F5EE] text-[#1D9E75] text-xs font-bold px-3 py-1 rounded-full shrink-0">{order.status}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
                        {[['Bahan', order.bahan], ['Jumlah', order.jumlah + ' pcs'], ['Warna', order.warna]].map(([label, val]) => (
                          <div key={label} className="bg-[#F0FAF6] rounded-xl p-2 md:p-3">
                            <p className="text-xs text-[#0F6E56] font-bold mb-0.5">{label}</p>
                            <p className="text-xs md:text-sm font-bold text-[#04342C] capitalize">{val}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#F0FAF6] rounded-xl p-3 mb-3">
                        <p className="text-xs text-[#0F6E56] font-bold mb-1">Deskripsi</p>
                        <p className="text-sm text-[#04342C]">{order.deskripsi}</p>
                      </div>

                      {order.gambarUrl && (
                        <div className="mb-4">
                          <p className="text-xs text-[#0F6E56] font-bold mb-2">Gambar Desain</p>
                          <img src={order.gambarUrl} alt="desain" className="w-28 h-28 md:w-32 md:h-32 object-contain rounded-xl border-2 border-[#9FE1CB]" />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <a href={`https://wa.me/${order.noHp.replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(order.nama)}%2C%20pesanan%20custom%20stiker%20kamu%20sudah%20kami%20terima!`}
                          target="_blank" rel="noreferrer"
                          className="bg-green-500 text-white rounded-xl px-4 py-2 font-bold text-sm no-underline">
                          💬 Hubungi via WA
                        </a>
                        <button onClick={() => {
                          const updated = orders.filter(o => o.id !== order.id)
                          setOrders(updated)
                          localStorage.setItem('stikerku_orders', JSON.stringify(updated))
                        }} className="bg-red-100 text-red-500 border-none rounded-xl px-4 py-2 font-bold text-sm cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#04342C] text-[#9FE1CB] text-center py-8 mt-16 px-4">
        <div className="text-xl md:text-2xl font-extrabold mb-2">🏷️ StikerKikir</div>
        <p className="text-sm opacity-70">© 2024 StikerKikir. Semua hak dilindungi wowok.</p>
       
      </footer>

    </div>
  )
}
