import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#071a34] pb-8 pt-14 text-white">
      <div className="mx-auto max-w-360 px-6">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="hub-display mb-3 text-2xl font-extrabold tracking-tight">
              M&amp;N DATA HUB
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#b9c8de]">
              Secure and dependable data bundle delivery for MTN, AirtelTigo,
              and Telecel customers across Ghana.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[#c6d5ea]">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[#5eead4]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#categories"
                  className="transition-colors hover:text-[#5eead4]"
                >
                  Data Services
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="transition-colors hover:text-[#5eead4]"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#fcd34d]">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-[#c6d5ea]">
              <li>Phone and WhatsApp support daily</li>
              <li>Guided checkout assistance</li>
              <li>Order updates in minutes</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#29486f] pt-6 text-center text-xs text-[#9fb2ce]">
          © {new Date().getFullYear()} M&amp;N DATA HUB. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
