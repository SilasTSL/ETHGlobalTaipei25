'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">ETHGlobal Taipei Project</h1>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Frontend Status</h2>
            <p>Running on port 3001</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Backend Status</h2>
            <p>Connected to port 3000</p>
            {data && (
              <pre className="mt-4 p-4 bg-gray-100 rounded">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Recommendation System</h2>
            <p>Connected to port 5000</p>
          </div>
        </div>
      </div>
    </main>
  );
} 