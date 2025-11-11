export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">RevGen Dashboards</h1>
        <p className="text-gray-600 mb-6">Welcome to your dashboard suite</p>
        
        <div className="space-y-4">
          <a 
            href="/contracts"
            className="block p-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
          >
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">🏛️ Government Contracts Tracker</h2>
            <p className="text-indigo-700">Track Federal, State, Local, and Emergency contract opportunities</p>
          </a>
          
          <a 
            href="/financial"
            className="block p-6 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition"
          >
            <h2 className="text-2xl font-bold text-purple-900 mb-2">💰 Financial Dashboard</h2>
            <p className="text-purple-700">View income, expenses, and receivables by period</p>
          </a>
          
          <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg opacity-50">
            <h2 className="text-2xl font-bold text-gray-600 mb-2">📊 Pipeline Manager</h2>
            <p className="text-gray-500">Currently undergoing maintenance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
