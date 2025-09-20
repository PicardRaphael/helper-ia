import { useEffect, useRef } from 'react';

import { ensureNamespacesLoaded, type AppNamespace } from '@/i18n';

export const useEnsureNamespaces = (...namespaces: AppNamespace[]) => {
  const previousNamespacesRef = useRef<AppNamespace[] | null>(null);

  useEffect(() => {
    if (namespaces.length === 0) {
      return;
    }

    const uniqueNamespaces = Array.from(new Set(namespaces));
    const previousNamespaces = previousNamespacesRef.current;

    const hasChanged =
      !previousNamespaces ||
      previousNamespaces.length !== uniqueNamespaces.length ||
      uniqueNamespaces.some((namespace, index) => previousNamespaces[index] !== namespace);

    if (!hasChanged) {
      return;
    }

    previousNamespacesRef.current = uniqueNamespaces;

    void ensureNamespacesLoaded(uniqueNamespaces).catch((error) => {
      console.error('useEnsureNamespaces: failed to load namespaces', error);
    });
  }, [namespaces]);
};
