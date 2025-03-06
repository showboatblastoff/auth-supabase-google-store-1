'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { DriveProvider } from '@/contexts/DriveContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import TopBar from "@/components/TopBar";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DriveProvider>
        <ProtectedRoute>
          <TopBar />
          <main>{children}</main>
        </ProtectedRoute>
      </DriveProvider>
    </AuthProvider>
  );
} 