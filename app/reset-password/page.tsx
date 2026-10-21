// app/reset-password/page.tsx
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex items-center justify-center py-20 bg-neutral-soft">
        <Suspense fallback={
          <div className="w-full max-w-md mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-border">
              Cargando...
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}