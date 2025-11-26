'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface SiteData {
  id: string;
  user_id: string;
  subdomain: string;
  site_data: any;
  status: string;
  template_type: string;
  created_at: string;
}

interface SiteCardProps {
  site: SiteData;
  onSiteDeleted?: () => void;
}

export default function SiteCard({ site, onSiteDeleted }: SiteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteSite = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sites?id=${site.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
        setIsDeleting(false);
        return;
      }

      setShowDeleteDialog(false);
      // Trigger a refresh of the sites list
      if (onSiteDeleted) {
        onSiteDeleted();
      } else {
        // Fallback: refresh the page
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Une erreur est survenue lors de la suppression du site.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {site.site_data?.publicName || site.subdomain}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Lien: <span className="font-medium text-foreground">/sites/{site.subdomain}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Statut: <span className="font-medium text-green-600">{site.status === 'published' ? 'En ligne' : 'Brouillon'}</span>
          </p>
          <div className="flex gap-2">
            <Link href={`/dashboard/${site.subdomain}/overview`} passHref className="flex-1">
              <Button asChild className="w-full">
                <div>
                  Gérer le site
                </div>
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              title="Supprimer le site"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le site ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le site "<strong>{site.site_data?.publicName || site.subdomain}</strong>" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSite}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
