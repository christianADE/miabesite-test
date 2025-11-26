import React from 'react';
import Link from 'next/link';

export default function CreateSiteMaintenancePage({ searchParams }: { searchParams?: { template?: string } }) {
  const template = searchParams?.template || 'ce template';

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted py-12 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Template en maintenance</h1>
        <p className="mb-6 text-muted-foreground">Le template <strong>{template}</strong> est actuellement en cours de maintenance. Nous travaillons à sa remise en ligne. Pour le moment, seul le template E‑commerce est disponible pour créer un site.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/create-site/select-template">
            <button className="px-4 py-2 bg-primary text-white rounded">Retour aux templates</button>
          </Link>
          <Link href="/create-site?templateType=ecommerce">
            <button className="px-4 py-2 border border-primary text-primary rounded">Utiliser E‑commerce</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
