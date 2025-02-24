import { BellIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="bg-white h-16 px-6 flex items-center justify-end border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="text-gray-600 flex items-center">
          <span>Credits:</span>
          <span className="ml-1 font-medium">₹ 6866</span>
        </div>
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}