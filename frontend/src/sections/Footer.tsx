import Link from "next/link"
import XSocial from "../assets/social-x.svg"
import INstaSocial from "../assets/social-instagram.svg"
import YTSocial from "../assets/social-youtube.svg"

export const Footer = () => {
  return (
    <footer className="py-5 border border-t border-white/15">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-y-8 lg:items-center lg:flex-row justify-between">
          {/* left or top div */}
          <div className="flex gap-x-5 items-center">
            <Link href="/" className="text-white font-inter text-xl font-semibold hover:opacity-80 transition-opacity duration-200">
              focal.ai
            </Link>
            <div>
                             <p className="text-xs text-white/60">Made by Akshat Thakur, Veer Adyani, Shorya Jain, Vaidik Sule & Akshara Sharma</p>
            </div>
          </div>
          {/* right or bottom div */}
          <div className="flex gap-x-8">
            <img src={XSocial.src} alt="X Social" className="text-white/30 hover:text-white transition-all duration-200 hover:scale-110 h-6 w-6 cursor-pointer" />
            <img src={INstaSocial.src} alt="Instagram" className="text-white/30 hover:text-white transition-all duration-200 hover:scale-110 h-6 w-6 cursor-pointer" />
            <img src={YTSocial.src} alt="YouTube" className="text-white/30 hover:text-white transition-all duration-200 hover:scale-110 h-6 w-6 cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  )
}