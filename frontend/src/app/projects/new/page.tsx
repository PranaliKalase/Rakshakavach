"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectRecommendation() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/mp/recommended');
  }, [router]);

  return null;
}
