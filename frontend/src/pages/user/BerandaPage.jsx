import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Label from "../../components/Label";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { showAlert } from "../../components/SweetAlert";

const HERO_DOTS = [
  { id: 1, x: "8%", y: "16%", size: "8px", color: "#FFC107", drift: "12s", glow: "6.4s", delay: "0s" },
  { id: 2, x: "22%", y: "10%", size: "6px", color: "#E00013", drift: "16s", glow: "8.2s", delay: "0.7s" },
  { id: 3, x: "35%", y: "19%", size: "10px", color: "#F97316", drift: "14s", glow: "7.5s", delay: "1.2s" },
  { id: 4, x: "48%", y: "8%", size: "7px", color: "#FFC107", drift: "17s", glow: "9s", delay: "0.4s" },
  { id: 5, x: "61%", y: "14%", size: "5px", color: "#FB7185", drift: "13s", glow: "6.9s", delay: "1.8s" },
  { id: 6, x: "74%", y: "11%", size: "8px", color: "#E00013", drift: "15s", glow: "8.4s", delay: "0.9s" },
  { id: 7, x: "86%", y: "18%", size: "6px", color: "#FFC107", drift: "12.5s", glow: "6.5s", delay: "2.1s" },
  { id: 8, x: "14%", y: "36%", size: "9px", color: "#F97316", drift: "18s", glow: "9.6s", delay: "1.1s" },
  { id: 9, x: "28%", y: "30%", size: "6px", color: "#E00013", drift: "11.5s", glow: "6.2s", delay: "2.4s" },
  { id: 10, x: "41%", y: "37%", size: "7px", color: "#FFC107", drift: "14.8s", glow: "8.1s", delay: "0.3s" },
  { id: 11, x: "56%", y: "33%", size: "5px", color: "#FB7185", drift: "13.7s", glow: "7.2s", delay: "1.7s" },
  { id: 12, x: "69%", y: "38%", size: "8px", color: "#F97316", drift: "16.5s", glow: "8.8s", delay: "2.6s" },
  { id: 13, x: "82%", y: "32%", size: "7px", color: "#E00013", drift: "12.8s", glow: "7.3s", delay: "0.6s" },
  { id: 14, x: "10%", y: "54%", size: "6px", color: "#FFC107", drift: "15.2s", glow: "8.1s", delay: "2.9s" },
  { id: 15, x: "26%", y: "60%", size: "10px", color: "#F97316", drift: "17.4s", glow: "9.3s", delay: "1.4s" },
  { id: 16, x: "44%", y: "56%", size: "6px", color: "#E00013", drift: "13.4s", glow: "7.1s", delay: "3.1s" },
  { id: 17, x: "63%", y: "62%", size: "8px", color: "#FFC107", drift: "16.1s", glow: "8.6s", delay: "1.9s" },
  { id: 18, x: "80%", y: "58%", size: "6px", color: "#FB7185", drift: "14.1s", glow: "7.6s", delay: "2.2s" },
];

const BerandaPage = ({ setPage }) => {
  const [isSending, setIsSending] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      await showAlert({
        title: "Konfigurasi Belum Lengkap",
        text: "Periksa kredensial EmailJS di file .env.",
        icon: "error",
      });
      return;
    }

    setIsSending(true);

    try {
      const fullName = `${contactForm.firstName} ${contactForm.lastName}`.trim();
      const templateParams = {
        from_name: fullName || contactForm.firstName,
        name: fullName || contactForm.firstName,
        email: contactForm.email,
        first_name: contactForm.firstName,
        last_name: contactForm.lastName,
        from_email: contactForm.email,
        reply_to: contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message,
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });

      await showAlert({
        title: "Pesan Terkirim",
        text: "Terima kasih, pesan Anda sudah kami terima.",
        icon: "success",
      });
    } catch (error) {
      console.error("EmailJS error:", error);
      await showAlert({
        title: "Gagal Mengirim",
        text: "Pesan belum terkirim. Silakan coba lagi.",
        icon: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-base text-accent">
      <main className="flex-grow">
        {/* 1. HERO SECTION */}
        <section
          id="home"
          className="relative pt-24 pb-32 flex items-center justify-center overflow-hidden"
        >
          {/* Background Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="beranda-dots-layer" aria-hidden="true">
              {HERO_DOTS.map((dot) => (
                <span
                  key={dot.id}
                  className="beranda-dot"
                  style={{
                    left: dot.x,
                    top: dot.y,
                    "--dot-size": dot.size,
                    "--dot-color": dot.color,
                    "--drift-duration": dot.drift,
                    "--glow-duration": dot.glow,
                    "--dot-delay": dot.delay,
                  }}
                />
              ))}
            </div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block py-1.5 px-4 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-6 border border-secondary/20 shadow-sm">
              🔥 100% Halal & Menggugah Selera
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-secondary mb-6 tracking-tight leading-tight">
              Pedasnya Nendang,
              <br />
              <span className="text-primary">Gurihnya Bikin Nagih!</span>
            </h1>
            <p className="text-lg md:text-xl text-accent/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Rasakan sensasi Sate Taichan premium dengan bumbu rahasia
              Konilicious. Daging ayam fillet pilihan, dibakar sempurna,
              disajikan dengan sambal spesial yang meledak di mulut.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="primary"
                className="px-8 py-3.5 text-lg shadow-lg shadow-primary/30 rounded-full font-bold text-accent hover:scale-105 transform transition"
                onClick={() => setPage && setPage("menu")}
              >
                Pesan Sekarang
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage && setPage("menu")}
                className="px-8 py-3.5 text-lg rounded-full font-bold border-accent/20 text-accent bg-white/50 backdrop-blur-sm hover:bg-accent hover:scale-105 transform transition"
              >
                Lihat Menu
              </Button>
            </div>
          </div>
        </section>

        {/* 2. ABOUT SECTION */}
        <section id="about" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary rounded-3xl transform translate-x-4 translate-y-4 -z-10 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                <img
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Sate Taichan Konilicious"
                  className="rounded-3xl shadow-xl w-full h-[450px] object-cover"
                />
              </div>
              <div className="pl-0 md:pl-8">
                <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-3">
                  Tentang Kami
                </h2>
                <h3 className="text-4xl font-black text-accent mb-6">
                  Kenapa Harus{" "}
                  <span className="text-primary">Konilicious?</span>
                </h3>
                <p className="text-accent/70 text-lg mb-5 leading-relaxed">
                  Berawal dari kecintaan kami pada kuliner pedas, Konilicious
                  hadir untuk memberikan pengalaman makan sate taichan yang
                  berbeda. Kami hanya menggunakan dada ayam filet segar tanpa
                  lemak, dibumbui dengan rempah alami tanpa pengawet buatan.
                </p>
                <p className="text-accent/70 text-lg mb-10 leading-relaxed">
                  Sambal khas Konilicious dibuat{" "}
                  <i className="font-semibold">fresh</i> setiap hari menggunakan
                  cabai rawit merah pilihan dipadu dengan perasan jeruk nipis
                  yang menyegarkan. Sekali gigit, pasti minta nambah!
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-base p-5 rounded-2xl border border-gray-100">
                    <h4 className="text-3xl font-black text-secondary mb-1">
                      10K+
                    </h4>
                    <p className="text-sm text-accent/60 font-medium">
                      Tusuk Terjual
                    </p>
                  </div>
                  <div className="bg-base p-5 rounded-2xl border border-gray-100">
                    <h4 className="text-3xl font-black text-secondary mb-1">
                      100%
                    </h4>
                    <p className="text-sm text-accent/60 font-medium">
                      Bahan Segar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 bg-base relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-tr-full"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-3">
                Cara Pemesanan
              </h2>
              <h3 className="text-4xl font-black text-accent">
                Pesan Gampang,{" "}
                <span className="text-primary">Perut Kenyang!</span>
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <Card className="text-center p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white">
                <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                  <span className="text-3xl font-black text-primary block transform -rotate-3">
                    1
                  </span>
                </div>
                <Card.Title className="text-xl mb-3 font-bold text-accent">
                  Pilih Menu Favorit
                </Card.Title>
                <Card.Body className="px-0 py-0 text-accent/70">
                  Pilih paket Sate Taichan kesukaanmu. Ada original, mozzarella
                  leleh, sampai yang super pedas level dewa!
                </Card.Body>
              </Card>

              {/* Step 2 */}
              <Card className="text-center p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white relative">
                <div className="hidden md:block absolute top-1/2 -left-4 w-8 h-0.5 bg-gray-200"></div>
                <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                  <span className="text-3xl font-black text-secondary block transform rotate-3">
                    2
                  </span>
                </div>
                <Card.Title className="text-xl mb-3 font-bold text-accent">
                  Bayar Cepat & Aman
                </Card.Title>
                <Card.Body className="px-0 py-0 text-accent/70">
                  Selesaikan pembayaran pakai e-wallet, transfer bank, atau
                  QRIS. Proses cepat, gak pake ribet nunggu kembalian.
                </Card.Body>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200"></div>
              </Card>

              {/* Step 3 */}
              <Card className="text-center p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white">
                <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                  <span className="text-3xl font-black text-accent block transform -rotate-3">
                    3
                  </span>
                </div>
                <Card.Title className="text-xl mb-3 font-bold text-accent">
                  Proses Cepat
                </Card.Title>
                <Card.Body className="px-0 py-0 text-accent/70">
                  Duduk manis, Sate Taichan panas nan lezat akan segera meluncur
                  ke lokasimu. Siap disantap bareng bestie!
                </Card.Body>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. TESTIMONIALS SECTION */}
        <section id="testimonials" className="py-24 bg-accent text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">
                Testimoni
              </h2>
              <h3 className="text-4xl font-black text-white">
                Apa Kata <span className="text-primary">Mereka?</span>
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-none text-left backdrop-blur-sm">
                <Card.Body className="p-8">
                  <div className="flex text-primary mb-5 text-lg">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                  <p className="text-gray-300 italic mb-8 leading-relaxed">
                    "Gila sih sambalnya! Asli pedasnya nendang banget tapi bikin
                    nagih. Dagingnya juga tebel dan empuk. Wajib coba yang
                    mozzarella!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-accent font-black text-lg">
                      BS
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-wide">
                        Budi Santoso
                      </p>
                      <p className="text-sm text-primary">Pecinta Pedas</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="bg-white/5 border-none text-left backdrop-blur-sm">
                <Card.Body className="p-8">
                  <div className="flex text-primary mb-5 text-lg">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                  <p className="text-gray-300 italic mb-8 leading-relaxed">
                    "Penyelamat lapar tengah malam. Pengirimannya cepet banget,
                    sate pas dateng masih panas. Bumbu rahasianya meresap sampai
                    ke dalam."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-black text-lg">
                      AS
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-wide">
                        Anya Siregar
                      </p>
                      <p className="text-sm text-primary">Mahasiswi</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="bg-white/5 border-none text-left backdrop-blur-sm">
                <Card.Body className="p-8">
                  <div className="flex text-primary mb-5 text-lg">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                  <p className="text-gray-300 italic mb-8 leading-relaxed">
                    "Sate taichan terenak yang pernah gue makan di kota ini. Gak
                    bau amis sama sekali, potongannya gede-gede. Worth every
                    penny!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                      DR
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-wide">
                        Dimas Ramadhan
                      </p>
                      <p className="text-sm text-primary">Food Vlogger</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. CONTACT US SECTION */}
        <section
          id="contact"
          className="py-24 bg-white relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full -z-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-tr-full -z-10"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-3">
                Hubungi Kami
              </h2>
              <h3 className="text-4xl font-black text-accent">
                Ada Pertanyaan?
              </h3>
            </div>

            <Card className="shadow-2xl shadow-accent/5 border-none overflow-hidden rounded-3xl">
              <div className="grid md:grid-cols-5">
                {/* Left Side: Info */}
                <div className="md:col-span-2 bg-accent text-white p-10 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-3 text-primary">
                      Info Kontak
                    </h3>
                    <p className="text-white/70 text-sm mb-10 leading-relaxed">
                      Punya pertanyaan, kritik, saran, atau mau pesan jumlah
                      besar untuk acara (katering)? Jangan ragu untuk sapa kami!
                    </p>

                    <div className="mt-10">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-3 font-semibold">
                        Lokasi Kami
                      </p>
                      <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg shadow-black/20">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63362.85075451378!2d110.38446678184165!3d-6.988283014660616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b8a726ddc57%3A0x4111b05b0bbccff1!2sKonicipi%20pleburan!5e0!3m2!1sid!2sid!4v1776659314978!5m2!1sid!2sid"
                          className="w-full h-56 md:h-64 border-0"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Lokasi Konicipi Pleburan"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="md:col-span-3 p-10 bg-white">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label
                          htmlFor="firstName"
                          required
                          className="text-accent font-semibold"
                        >
                          Nama Depan
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={contactForm.firstName}
                          onChange={handleContactInputChange}
                          className="bg-base border-gray-200 focus:border-primary focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="lastName"
                          className="text-accent font-semibold"
                        >
                          Nama Belakang
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={contactForm.lastName}
                          onChange={handleContactInputChange}
                          className="bg-base border-gray-200 focus:border-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        required
                        className="text-accent font-semibold"
                      >
                        Alamat Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={contactForm.email}
                        onChange={handleContactInputChange}
                        className="bg-base border-gray-200 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="subject"
                        required
                        className="text-accent font-semibold"
                      >
                        Subjek
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Tanya katering..."
                        value={contactForm.subject}
                        onChange={handleContactInputChange}
                        className="bg-base border-gray-200 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="message"
                        required
                        className="text-accent font-semibold"
                      >
                        Pesan Anda
                      </Label>
                      <textarea
                        id="message"
                        name="message"
                        rows="4"
                        value={contactForm.message}
                        onChange={handleContactInputChange}
                        className="w-full px-4 py-3 bg-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-accent placeholder:text-gray-400 transition-all duration-200 resize-none"
                        placeholder="Tulis detail pesan Anda di sini..."
                        required
                      ></textarea>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={isSending}
                      className="py-3.5 text-accent font-black text-lg rounded-xl mt-4 shadow-md shadow-primary/20 hover:-translate-y-1 transition-transform"
                    >
                      {isSending ? "Mengirim..." : "Kirim Pesan"}
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BerandaPage;