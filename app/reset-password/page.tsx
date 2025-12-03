'use client';
import { AuthLayout } from '@/components/features/auth/auth-layout';
import { Icon } from '@/components/ui/primitives/icon';
import { Logo } from '@/components/ui/primitives/logo';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ResetPasswordPage() {
  const [error, setError] = useState('');

  useEffect(() => {
    setError('Resetting password via email is not currently implemented');
  }, []);

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <Logo size="md" />
      </div>

      <div className="text-gray-90 flex-1 flex flex-col justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="Delete" size={32} className="text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Email functionality disabled
          </h1>
          <p className="font-light text-base mb-8">{error}</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="text-gray-40 flex items-center leading-4 gap-2 justify-center hover:cursor-pointer hover:underline"
          >
            <Icon name="Chevron right" size={16} className="rotate-180" />
            <span className="font-light text-xs">Back to Login</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
