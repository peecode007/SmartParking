import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100 font-sans">
      {/* Hero Section */}
      <section className="text-center py-24 px-6 relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Revolutionize Your Parking
        </h1>
        <p className="text-lg md:text-xl max-w-xl mx-auto mb-8 text-gray-300">
          Real-time smart parking. Reserve, navigate, and pay with one tap.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-blue-500 hover:bg-blue-600 transition px-8 py-3 text-lg font-semibold rounded-full shadow-lg"
        >
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        {[
          {
            title: 'Parking History',
            desc: 'Track ypur parking history with our system.',
          },
          {
            title: 'One-Tap Payments',
            desc: 'Cashless and secure payments right from your dashboard.',
          },
          {
            title: 'Smart Alerts',
            desc: 'Get instant alerts on spot availability, duration & more.',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white/5 border border-gray-700 backdrop-blur-lg rounded-xl p-6 shadow-xl hover:shadow-blue-600/40 transition"
          >
            <h2 className="text-xl font-semibold text-white mb-2">{feature.title}</h2>
            <p className="text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* About Section */}
      <section className="bg-gray-900 border-t border-gray-700 py-20 text-center px-6">
        <h2 className="text-4xl font-bold mb-4">Built for Drivers & Cities</h2>
        <p className="text-lg max-w-2xl mx-auto text-gray-400">
          Reduce traffic, fuel usage, and parking headaches. Our system supports smart city initiatives and offers seamless UX for everyday drivers.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-500 py-6 text-center text-sm border-t border-gray-800">
        &copy; {new Date().getFullYear()} SmartParking Inc. All rights reserved.
      </footer>
    </main>
  );
}
