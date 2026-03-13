export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-2xl">🍔</span>
            <span className="text-lg font-bold text-orange-500">DailyFoodDeals</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DailyFoodDeals. Sizzling deals that won&apos;t break the bank.
          </p>
        </div>
      </div>
    </footer>
  );
}
