import React from 'react';

import { User } from '../../shared/types/User';
import { BlueTeam } from '../blue-team/BlueTeam';
import { RedTeam } from '../red-team/RedTeam';

export interface FrameProps {
  users: User[];
}

export function Frame({ users }: FrameProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Tribe X
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Walking Skeleton — Team Member Directory
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <RedTeam users={users} />
        <BlueTeam users={users} />
      </main>
    </div>
  );
}
