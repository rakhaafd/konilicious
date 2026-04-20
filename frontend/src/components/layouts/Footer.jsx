import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-10 md:h-16 lg:h-20 block relative top-2 md:top-3" preserveAspectRatio="none">
        <path fill="#111827" fillOpacity="1" d="M0,192L16,176C32,160,64,128,96,122.7C128,117,160,139,192,149.3C224,160,256,160,288,154.7C320,149,352,139,384,154.7C416,171,448,213,480,229.3C512,245,544,235,576,208C608,181,640,139,672,122.7C704,107,736,117,768,122.7C800,128,832,128,864,144C896,160,928,192,960,208C992,224,1024,224,1056,208C1088,192,1120,160,1152,122.7C1184,85,1216,43,1248,32C1280,21,1312,43,1344,64C1376,85,1408,107,1424,117.3L1440,128L1440,320L1424,320C1408,320,1376,320,1344,320C1312,320,1280,320,1248,320C1216,320,1184,320,1152,320C1120,320,1088,320,1056,320C1024,320,992,320,960,320C928,320,896,320,864,320C832,320,800,320,768,320C736,320,704,320,672,320C640,320,608,320,576,320C544,320,512,320,480,320C448,320,416,320,384,320C352,320,320,320,288,320C256,320,224,320,192,320C160,320,128,320,96,320C64,320,32,320,16,320L0,320Z"></path>
      </svg>
      <footer className="text-base pt-12 pb-6 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            <div>
              <h2 className="text-2xl font-black text-primary mb-4">Konilicious</h2>
              <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
                Menyajikan sate taichan terbaik dengan resep otentik dan bumbu rahasia yang menggugah selera. Pedasnya nendang, gurihnya bikin nagih.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-0.5 shrink-0" />
                  <span>Jl. Kertanegara VI, Pleburan, Kec. Semarang Sel., Kota Semarang, Jawa Tengah 50241</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaPhoneAlt className="mt-0.5 shrink-0" />
                  <span>+62 812 3456 7890</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaEnvelope className="mt-0.5 shrink-0" />
                  <span>hello@konilicious.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 mt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Konilicious. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
